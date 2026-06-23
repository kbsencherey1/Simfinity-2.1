import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  label: string;
  accept?: string;
  onFileSelect: (file: File | null) => void;
  description?: string;
  initialFileUrl?: string;
  initialFileName?: string;
  key?: number | string;
}

export function FileUploader({
  label,
  accept = "image/*,application/pdf",
  onFileSelect,
  description = "PNG, JPG, or PDF up to 10MB",
  initialFileUrl = "",
  initialFileName = ""
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialFileUrl);
  const [fileName, setFileName] = useState<string>(initialFileName);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    onFileSelect(selectedFile);

    // Simulate upload progress
    setIsUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // Create preview for images
          if (selectedFile.type.startsWith('image/')) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
          } else {
            setPreviewUrl(""); // PDF or other documents do not get local preview easily
          }
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    setFileName("");
    setPreviewUrl("");
    onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      <label className="font-mono text-[10px] text-gray-500 uppercase tracking-wider block font-bold">
        {label}
      </label>
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`relative border border-dashed rounded-xl p-5 text-center transition-all duration-200 cursor-pointer ${
          dragActive
            ? 'border-[#ffd700] bg-[#ffd700]/5 scale-[1.01]'
            : 'border-white/10 bg-[#121212]/50 hover:border-white/20 hover:bg-[#181818]/65'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {fileName ? (
          <div className="flex flex-col items-center justify-center space-y-3" onClick={(e) => e.stopPropagation()}>
            {previewUrl ? (
              <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-white/20 shadow-md">
                <img src={previewUrl} alt="Document Preview" className="w-full h-full object-cover" />
                <button
                  onClick={handleRemove}
                  className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white hover:text-red-400 p-1 rounded-full transition-colors"
                  title="Remove File"
                >
                  <span className="material-symbols-outlined text-[12px] font-black select-none block">close</span>
                </button>
              </div>
            ) : (
              <div className="relative flex items-center gap-3 bg-black/40 border border-white/10 px-4 py-2.5 rounded-lg w-full max-w-sm">
                <span className="material-symbols-outlined text-[#ffd700] text-2xl shrink-0">
                  {fileName.toLowerCase().endsWith('.pdf') ? 'picture_as_pdf' : 'draft'}
                </span>
                <div className="text-left overflow-hidden flex-1">
                  <p className="text-xs text-white font-medium truncate">{fileName}</p>
                  <p className="text-[9px] text-gray-500 font-mono">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Loaded'}
                  </p>
                </div>
                <button
                  onClick={handleRemove}
                  className="bg-white/10 hover:bg-white/20 text-gray-400 hover:text-red-400 p-1 rounded-full transition-colors shrink-0"
                  title="Remove File"
                >
                  <span className="material-symbols-outlined text-xs select-none block">close</span>
                </button>
              </div>
            )}

            {isUploading ? (
              <div className="w-full max-w-xs space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                  <span>Uploading profile data...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00c9ff] via-[#2575fc] to-[#bf55ec] h-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#94ecb4] text-[10px] font-mono font-bold uppercase">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                <span>Document successfully verification encoded</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
              <span className="material-symbols-outlined text-xl">cloud_upload</span>
            </div>
            <div>
              <p className="text-xs text-white font-bold">
                Drag & drop or <span className="text-[#ffd700] hover:underline">browse</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-1 font-mono font-medium">{description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
