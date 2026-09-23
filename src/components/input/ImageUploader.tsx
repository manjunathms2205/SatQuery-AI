import React, { useRef, useState } from 'react';
import { Upload, X, RefreshCw, FileText, Image as ImageIcon, ArrowDown, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AnalysisMode, UploadedFileMeta } from '../../types';

interface ImageUploaderProps {
  primaryImage: string | null;
  primaryLabel: string;
  primaryMeta?: UploadedFileMeta | null;
  secondaryImage: string | null;
  secondaryLabel: string;
  secondaryMeta?: UploadedFileMeta | null;
  onSetPrimaryImage: (img: string | null, label?: string, meta?: UploadedFileMeta | null) => void;
  onSetSecondaryImage: (img: string | null, label?: string, meta?: UploadedFileMeta | null) => void;
  mode: AnalysisMode;
  isAnalyzing: boolean;
  onLoadSample?: (isSecondary: boolean) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractFileMeta(file: File, dataUrl: string): Promise<UploadedFileMeta> {
  return new Promise(resolve => {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'IMAGE';
    const isTiff = ext === 'TIF' || ext === 'TIFF' || ext === 'GEOTIFF';
    const format = isTiff ? 'GeoTIFF / TIFF' : ext;
    const sizeFormatted = formatFileSize(file.size);

    const img = new Image();
    img.onload = () => {
      resolve({
        name: file.name,
        sizeFormatted,
        dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
        format
      });
    };
    img.onerror = () => {
      resolve({
        name: file.name,
        sizeFormatted,
        format
      });
    };
    img.src = dataUrl;
  });
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  primaryImage,
  primaryLabel,
  primaryMeta,
  secondaryImage,
  secondaryLabel,
  secondaryMeta,
  onSetPrimaryImage,
  onSetSecondaryImage,
  mode,
  isAnalyzing,
  onLoadSample
}) => {
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const [isDragging1, setIsDragging1] = useState(false);
  const [isDragging2, setIsDragging2] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isDualMode = mode === 'bitemporal' || mode === 'optisar';
  const showSecondarySlot = isDualMode || (mode === 'auto' && (secondaryImage !== null || true));

  const processFile = async (file: File, isSecondary: boolean) => {
    setUploadError(null);

    // Validate format
    const validExtensions = ['png', 'jpg', 'jpeg', 'tif', 'tiff', 'geotiff', 'webp'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(fileExt) && !file.type.startsWith('image/')) {
      setUploadError(`Unsupported file format ".${fileExt}". Please upload PNG, JPEG, TIFF, or GeoTIFF.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = async event => {
      const dataUrl = event.target?.result as string;
      const meta = await extractFileMeta(file, dataUrl);
      if (isSecondary) {
        onSetSecondaryImage(dataUrl, file.name, meta);
      } else {
        onSetPrimaryImage(dataUrl, file.name, meta);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please verify file readability.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isSecondary: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, isSecondary);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, isSecondary: boolean) => {
    e.preventDefault();
    if (isSecondary) setIsDragging2(false);
    else setIsDragging1(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, isSecondary);
    }
  };

  // Titles based on active mode
  const getSlot1Config = () => {
    switch (mode) {
      case 'grounding':
        return {
          title: 'Reference Image',
          subtitle: 'Target scene for region grounding',
          tag: 'Optical / Orthomosaic'
        };
      case 'bitemporal':
        return {
          title: 'Observation A · Earlier Date',
          subtitle: 'Pre-event baseline observation (T1)',
          tag: 'Baseline (T1)'
        };
      case 'optisar':
        return {
          title: 'Optical Image',
          subtitle: 'VNIR visible spectrum reflectance',
          tag: 'Optical VNIR'
        };
      default:
        return {
          title: 'Primary Observation',
          subtitle: 'Satellite scene for analysis',
          tag: 'Earth Observation'
        };
    }
  };

  const getSlot2Config = () => {
    switch (mode) {
      case 'bitemporal':
        return {
          title: 'Observation B · Later Date',
          subtitle: 'Post-event observation for change analysis (T2)',
          tag: 'Post-Event (T2)'
        };
      case 'optisar':
        return {
          title: 'SAR Image',
          subtitle: 'Co-registered microwave radar backscatter',
          tag: 'Radar Polarimetry'
        };
      default:
        return {
          title: 'Secondary Observation (Optional)',
          subtitle: 'Paired observation for comparison or fusion',
          tag: 'Paired Input'
        };
    }
  };

  const slot1 = getSlot1Config();
  const slot2 = getSlot2Config();

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-secondary font-sans">
            Upload your observation
          </h2>
          <p className="text-xs text-charcoal-muted">
            {mode === 'bitemporal'
              ? 'Upload two corresponding observations across different timestamps.'
              : mode === 'optisar'
              ? 'Upload complementary optical and SAR radar imagery.'
              : 'Upload a high-resolution satellite scene in PNG, JPEG, TIFF, or GeoTIFF.'}
          </p>
        </div>

        {/* Status Tag */}
        <div className="text-[11px] font-mono text-charcoal-muted">
          {isDualMode
            ? `${primaryImage && secondaryImage ? '2 of 2 uploaded' : (primaryImage || secondaryImage ? '1 of 2 uploaded' : '0 of 2 uploaded')}`
            : primaryImage ? '1 image uploaded' : 'No imagery loaded'}
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-3 rounded-lg bg-terracotta-50 border border-terracotta-100 text-terracotta-700 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-terracotta-600" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-terracotta-600 hover:text-terracotta-800 text-xs underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Dropzones Layout */}
      <div className={`grid gap-4 ${isDualMode || (mode === 'auto' && secondaryImage) ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* SLOT 1: Primary / Observation A / Optical */}
        <div className="rounded-xl border border-[#DDD9CE] bg-white overflow-hidden shadow-subtle flex flex-col">
          {/* Slot Header */}
          <div className="px-4 py-2.5 border-b border-[#DDD9CE] bg-[#FAF9F6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-forest-600"></span>
              <span className="text-xs font-bold text-charcoal uppercase tracking-wider font-sans">
                {slot1.title}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ivory-200 text-charcoal-secondary border border-[#DDD9CE]">
                {slot1.tag}
              </span>
            </div>

            {primaryImage && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInput1Ref.current?.click()}
                  className="text-[11px] text-charcoal-secondary hover:text-forest-700 flex items-center gap-1 font-medium transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Replace
                </button>
                <span className="text-[#DDD9CE]">|</span>
                <button
                  type="button"
                  onClick={() => onSetPrimaryImage(null, undefined, null)}
                  className="text-[11px] text-charcoal-secondary hover:text-terracotta-600 flex items-center gap-1 font-medium transition-colors"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            )}
          </div>

          {/* Slot Body */}
          <div className="p-4 flex-1 flex flex-col justify-center bg-[#FAF9F6] min-h-[280px]">
            {primaryImage ? (
              /* Uploaded Preview with Metadata */
              <div className="space-y-3">
                <div className="relative w-full max-h-[340px] rounded-lg overflow-hidden border border-[#DDD9CE] bg-white flex items-center justify-center carto-grid-subtle">
                  <img
                    src={primaryImage}
                    alt={slot1.title}
                    className="w-full h-full object-contain max-h-[320px]"
                  />
                </div>

                {/* File Metadata Bar */}
                <div className="p-2.5 rounded-lg bg-white border border-[#DDD9CE] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span className="font-semibold text-charcoal truncate" title={primaryMeta?.name || primaryLabel}>
                      {primaryMeta?.name || primaryLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-charcoal-secondary text-[11px]">
                    <span>{primaryMeta?.format || 'PNG/JPEG'}</span>
                    {primaryMeta?.dimensions && <span>{primaryMeta.dimensions}</span>}
                    {primaryMeta?.sizeFormatted && <span className="font-semibold">{primaryMeta.sizeFormatted}</span>}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty Drag & Drop Interface */
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging1(true);
                }}
                onDragLeave={e => {
                  e.preventDefault();
                  setIsDragging1(false);
                }}
                onDrop={e => handleDrop(e, false)}
                onClick={() => fileInput1Ref.current?.click()}
                className={`w-full h-full min-h-[240px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all text-center group ${
                  isDragging1
                    ? 'border-forest-700 bg-forest-50/50'
                    : 'border-[#DDD9CE] bg-white hover:border-forest-700/60 hover:bg-forest-50/20'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-ivory-200 border border-[#DDD9CE] flex items-center justify-center text-charcoal-secondary group-hover:text-forest-700 group-hover:border-forest-700/40 transition-colors mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-charcoal font-sans">
                  Upload satellite image
                </div>
                <p className="text-xs text-charcoal-secondary mt-1">
                  Drag & drop image here or <span className="text-forest-700 underline font-medium">browse files</span>
                </p>
                <div className="text-[11px] font-mono text-charcoal-muted mt-2 pt-2 border-t border-[#DDD9CE]/60">
                  PNG · JPEG · TIFF · GeoTIFF
                </div>
                {onLoadSample && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onLoadSample(false);
                    }}
                    className="mt-2.5 px-2.5 py-1 rounded bg-ivory-200 hover:bg-forest-50 text-forest-700 hover:text-forest-800 text-[11px] font-mono border border-[#DDD9CE] transition-colors"
                  >
                    Load Sentinel-2 Sample (Easy-EO)
                  </button>
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInput1Ref}
              onChange={e => handleFileChange(e, false)}
              accept="image/png,image/jpeg,image/tiff,.tif,.tiff,.geotiff,image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* SLOT 2: Paired / Observation B / SAR (If Dual Mode) */}
        {isDualMode && (
          <div className="rounded-xl border border-[#DDD9CE] bg-white overflow-hidden shadow-subtle flex flex-col">
            {/* Slot Header */}
            <div className="px-4 py-2.5 border-b border-[#DDD9CE] bg-[#FAF9F6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-terracotta-500"></span>
                <span className="text-xs font-bold text-charcoal uppercase tracking-wider font-sans">
                  {slot2.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ivory-200 text-charcoal-secondary border border-[#DDD9CE]">
                  {slot2.tag}
                </span>
              </div>

              {secondaryImage && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInput2Ref.current?.click()}
                    className="text-[11px] text-charcoal-secondary hover:text-forest-700 flex items-center gap-1 font-medium transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Replace
                  </button>
                  <span className="text-[#DDD9CE]">|</span>
                  <button
                    type="button"
                    onClick={() => onSetSecondaryImage(null, undefined, null)}
                    className="text-[11px] text-charcoal-secondary hover:text-terracotta-600 flex items-center gap-1 font-medium transition-colors"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              )}
            </div>

            {/* Slot Body */}
            <div className="p-4 flex-1 flex flex-col justify-center bg-[#FAF9F6] min-h-[280px]">
              {secondaryImage ? (
                /* Uploaded Preview with Metadata */
                <div className="space-y-3">
                  <div className="relative w-full max-h-[340px] rounded-lg overflow-hidden border border-[#DDD9CE] bg-white flex items-center justify-center carto-grid-subtle">
                    <img
                      src={secondaryImage}
                      alt={slot2.title}
                      className="w-full h-full object-contain max-h-[320px]"
                    />
                  </div>

                  {/* File Metadata Bar */}
                  <div className="p-2.5 rounded-lg bg-white border border-[#DDD9CE] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                      <span className="font-semibold text-charcoal truncate" title={secondaryMeta?.name || secondaryLabel}>
                        {secondaryMeta?.name || secondaryLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-charcoal-secondary text-[11px]">
                      <span>{secondaryMeta?.format || 'PNG/JPEG'}</span>
                      {secondaryMeta?.dimensions && <span>{secondaryMeta.dimensions}</span>}
                      {secondaryMeta?.sizeFormatted && <span className="font-semibold">{secondaryMeta.sizeFormatted}</span>}
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Drag & Drop Interface */
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDragging2(true);
                  }}
                  onDragLeave={e => {
                    e.preventDefault();
                    setIsDragging2(false);
                  }}
                  onDrop={e => handleDrop(e, true)}
                  onClick={() => fileInput2Ref.current?.click()}
                  className={`w-full h-full min-h-[240px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all text-center group ${
                    isDragging2
                      ? 'border-terracotta-500 bg-terracotta-50/50'
                      : 'border-[#DDD9CE] bg-white hover:border-terracotta-500/60 hover:bg-terracotta-50/20'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-ivory-200 border border-[#DDD9CE] flex items-center justify-center text-charcoal-secondary group-hover:text-terracotta-600 group-hover:border-terracotta-500/40 transition-colors mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-charcoal font-sans">
                    {mode === 'bitemporal' ? 'Upload second observation' : 'Upload SAR radar image'}
                  </div>
                  <p className="text-xs text-charcoal-secondary mt-1">
                    Drag & drop image here or <span className="text-terracotta-600 underline font-medium">browse files</span>
                  </p>
                  <div className="text-[11px] font-mono text-charcoal-muted mt-2 pt-2 border-t border-[#DDD9CE]/60">
                    PNG · JPEG · TIFF · GeoTIFF
                  </div>
                  {onLoadSample && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onLoadSample(true);
                      }}
                      className="mt-2.5 px-2.5 py-1 rounded bg-ivory-200 hover:bg-terracotta-50 text-terracotta-700 hover:text-terracotta-800 text-[11px] font-mono border border-[#DDD9CE] transition-colors"
                    >
                      Load Sentinel-2 Sample (Easy-EO)
                    </button>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInput2Ref}
                onChange={e => handleFileChange(e, true)}
                accept="image/png,image/jpeg,image/tiff,.tif,.tiff,.geotiff,image/*"
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bi-Temporal Relationship Indicator */}
      {mode === 'bitemporal' && (
        <div className="p-2.5 rounded-lg bg-ivory-200 border border-[#DDD9CE] flex items-center justify-between text-xs text-charcoal-secondary">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-charcoal">Temporal Differencing:</span>
            <span className="font-mono text-forest-700">Observation A (Earlier)</span>
            <ArrowRight className="w-3.5 h-3.5 text-charcoal-muted" />
            <span className="font-mono text-terracotta-600">Observation B (Later)</span>
          </div>
          <span className="text-[11px] text-charcoal-muted">
            ChangeSense will compute surface transition & area delta
          </span>
        </div>
      )}

      {/* Validation Message If Paired Mode Incomplete */}
      {isDualMode && (!primaryImage || !secondaryImage) && (
        <div className="text-xs text-charcoal-secondary flex items-center gap-1.5 px-1 font-sans">
          <AlertCircle className="w-3.5 h-3.5 text-ochre-600" />
          <span>
            {mode === 'bitemporal'
              ? 'Two observations are required for bi-temporal analysis. Upload both images to proceed to query.'
              : 'Both optical and SAR observations are required for cross-modal fusion. Upload both to proceed.'}
          </span>
        </div>
      )}
    </section>
  );
};
