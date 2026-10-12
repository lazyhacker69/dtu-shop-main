// components/ImageUploader.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ImageUploader({
  onUpload,
  onRemove,
  value,
  disabled,
}: {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  value?: string;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, GIF)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Upload failed");
      }

      const data = await res.json();
      if (!data.secure_url) {
        throw new Error("No image URL returned from Cloudinary");
      }

      onUpload(data.secure_url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5 text-red-600" />
          Product Image
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {value ? (
              <>
                <img
                  src={value}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded border-4 border-gray-200"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                  onClick={onRemove}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded border-4 border-gray-200">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex items-center space-x-2 bg-white border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-50 transition-colors">
                <Upload className="w-4 h-4" />
                <span>{value ? "Change Image" : "Upload Image"}</span>
              </div>
            </Label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled || uploading}
            />
            <p className="text-sm text-gray-600 mt-2">
              JPG, PNG or GIF. Max size 2MB.
            </p>
            {error && (
              <p className="text-red-600 text-xs mt-2">{error}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
