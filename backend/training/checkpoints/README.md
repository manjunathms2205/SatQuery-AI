# Model Checkpoints

This directory stores fine-tuned PyTorch model weights (`.pt` / `.pth`) and ONNX export models for pluggable specialist heads.
Production deployments can load weights directly from this directory into `RemoteSensingSpecialistHead` or Triton / FastAPI inference servers.
