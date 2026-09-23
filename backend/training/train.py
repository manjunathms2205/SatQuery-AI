"""
Pluggable Model Training Script for Remote-Sensing Adaptation.
Enables fine-tuning lightweight CNN/Transformer backends on multispectral Earth observation datasets.
"""

import os
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np

class RemoteSensingSpecialistHead(nn.Module):
    """Multispectral specialist model taking 6-channel input (B, G, R, NIR, NDVI, NDWI)."""
    def __init__(self, in_channels: int = 6, num_classes: int = 10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(in_channels, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        self.classifier = nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(inplace=True),
            nn.Linear(32, num_classes)
        )

    def forward(self, x):
        feat = self.features(x)
        feat = torch.flatten(feat, 1)
        return self.classifier(feat)

def run_training_cycle(epochs: int = 2, batch_size: int = 4, checkpoint_dir: str = "checkpoints"):
    os.makedirs(checkpoint_dir, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Initializing training cycle on {device}...")

    # Simulated batch of preprocessed Sentinel-2 patches (6 channels: 4 spectral + 2 indices)
    dummy_x = torch.randn(16, 6, 64, 64)
    dummy_y = torch.randint(0, 10, (16,))
    dataset = TensorDataset(dummy_x, dummy_y)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    model = RemoteSensingSpecialistHead(in_channels=6, num_classes=10).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)

    print(f"[*] Training RemoteSensingSpecialistHead for {epochs} epochs...")
    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        for batch_x, batch_y in loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            out = model(batch_x)
            loss = criterion(out, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(loader)
        print(f"    Epoch {epoch + 1}/{epochs} - Loss: {avg_loss:.4f}")

    ckpt_path = os.path.join(checkpoint_dir, "specialist_head_v1.pt")
    torch.save(model.state_dict(), ckpt_path)
    print(f"[+] Checkpoint saved successfully to {ckpt_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=2)
    parser.add_argument("--batch-size", type=int, default=4)
    args = parser.parse_args()
    run_training_cycle(epochs=args.epochs, batch_size=args.batch_size)
