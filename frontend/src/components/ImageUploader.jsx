import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import itemService from '../services/itemService.js';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export const ImageUploader = ({
  images = [],
  onChange,
  maxImages = 5,
  label = 'Item Photographs',
  helperText = 'Upload clear photos (up to 5 images, max 5 MB each)'
}) => {
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [replacingIndex, setReplacingIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File '${file.name}' is not a supported format. Please use JPEG, PNG, WEBP, or SVG.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File '${file.name}' exceeds the 5 MB maximum size limit.`;
    }
    return null;
  };

  const handleFiles = async (files) => {
    setError(null);
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`Maximum limit of ${maxImages} images reached.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // Validate files
    for (const file of filesToUpload) {
      const valError = validateFile(file);
      if (valError) {
        setError(valError);
        return;
      }
    }

    setUploading(true);
    setProgress(25);

    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => formData.append('images', file));

      setProgress(60);
      const res = await itemService.uploadImages(formData);
      setProgress(95);

      if (res?.data?.urls) {
        const updated = [...images, ...res.data.urls];
        onChange(updated);
      }
    } catch (err) {
      // Fallback: convert to base64 if server multipart has issue
      try {
        const base64Promises = filesToUpload.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        );
        const base64Urls = await Promise.all(base64Promises);
        onChange([...images, ...base64Urls]);
      } catch (fallbackErr) {
        setError(err.message || 'Image upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (indexToRemove) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    if (error) setError(null);
  };

  const handleReplaceClick = (index) => {
    setReplacingIndex(index);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;

    const valError = validateFile(file);
    if (valError) {
      setError(valError);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('images', file);
      const res = await itemService.uploadImages(formData);

      if (res?.data?.urls?.[0]) {
        const updated = [...images];
        updated[replacingIndex] = res.data.urls[0];
        onChange(updated);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        const updated = [...images];
        updated[replacingIndex] = reader.result;
        onChange(updated);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      setReplacingIndex(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider">
          {label} ({images.length}/{maxImages})
        </label>
        <span className="text-[11px] text-[#526579] font-medium">JPEG, PNG, WEBP &lt; 5MB</span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-[#FFEBEE] border border-[#FFCDD2] flex items-start gap-2 text-[#D32F2F] text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceFile}
      />

      {/* Upload Drag & Drop Area */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            uploading
              ? 'border-[#00695C] bg-[#E0F2F1]/50'
              : 'border-[#D9E2E8] hover:border-[#00695C] bg-[#F7FAFC] hover:bg-[#F0F7F6]'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C]">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#16324F]">
                Click or drag &amp; drop photos here
              </p>
              <p className="text-[11px] text-[#526579] mt-0.5">{helperText}</p>
            </div>
          </div>

          {uploading && (
            <div className="mt-4 max-w-xs mx-auto space-y-1.5">
              <div className="h-1.5 w-full bg-[#E0F2F1] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00695C] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-[#00695C] font-semibold">Uploading photos ({progress}%)...</p>
            </div>
          )}
        </div>
      )}

      {/* Image Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative group rounded-lg overflow-hidden border border-[#D9E2E8] bg-white aspect-square flex items-center justify-center shadow-xs"
            >
              <img
                src={url}
                alt={`Item image ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80';
                }}
              />

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReplaceClick(idx);
                  }}
                  className="p-1.5 rounded-md bg-[#FF9800] text-white hover:bg-[#F57C00] transition-colors"
                  title="Replace this image"
                  aria-label="Replace this image"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                  className="p-1.5 rounded-md bg-[#D32F2F] text-white hover:bg-[#B71C1C] transition-colors"
                  title="Remove this image"
                  aria-label="Remove this image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {idx === 0 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#00695C] text-white shadow-xs">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
