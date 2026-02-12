import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
}

interface Preview {
  file: File;
  preview: string;
}

export const ImageUpload = ({ onImagesChange, maxImages = 5 }: ImageUploadProps) => {
  const [previews, setPreviews] = useState<Preview[]>([]);

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [previews]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (previews.length + acceptedFiles.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const next = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setPreviews((prev) => {
        const merged = [...prev, ...next];
        onImagesChange(merged.map((item) => item.file));
        return merged;
      });
    },
    [maxImages, onImagesChange, previews.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 5 * 1024 * 1024,
  });

  const removeImage = (index: number) => {
    setPreviews((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const removed = prev[index];
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      onImagesChange(next.map((item) => item.file));
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`rounded-[var(--radius-lg)] border-2 border-dashed p-8 text-center transition ${
          isDragActive
            ? "border-[var(--primary)] bg-[var(--primary-soft)]"
            : "border-[var(--border-strong)] bg-[var(--surface-muted)] hover:border-[var(--primary)]"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-soft" />
        <p className="mt-3 font-semibold">{isDragActive ? "Drop images here" : "Drag images or click to upload"}</p>
        <p className="mt-1 text-sm text-soft">PNG/JPG/WEBP up to 5MB, max {maxImages} files.</p>
      </div>

      {previews.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {previews.map((item, index) => (
            <div key={item.preview} className="group relative aspect-square overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]">
              <img src={item.preview} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface-subtle py-8 text-center text-sm text-soft">
          <ImageIcon className="mx-auto mb-2 h-6 w-6" />
          No images uploaded yet
        </div>
      )}
    </div>
  );
};
