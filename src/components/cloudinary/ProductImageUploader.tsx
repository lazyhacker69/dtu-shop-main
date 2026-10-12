// components/cloudinary/ProductImagesUploader.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ProductImagesUploader({ 
    value = [], 
    onChange,
    onFormUpdate // Add this prop to update form field
  }: {
    value: File[];
    onChange: (files: File[]) => void;
    onFormUpdate?: (hasImages: boolean) => void;
  }) {
    const [previews, setPreviews] = useState<string[]>([]);
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      
      // Validate files
      const validFiles = files.filter(file => {
        return file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024;
      });
  
      // Generate previews
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
      
      // Update files
      const updatedFiles = [...value, ...validFiles];
      onChange(updatedFiles);
      
      // Notify form that images exist
      if (onFormUpdate) {
        onFormUpdate(updatedFiles.length > 0);
      }
    };
  
    const handleRemove = (index: number) => {
      const newPreviews = [...previews];
      newPreviews.splice(index, 1);
      setPreviews(newPreviews);
  
      const newFiles = [...value];
      newFiles.splice(index, 1);
      onChange(newFiles);
      
      // Notify form about image count
      if (onFormUpdate) {
        onFormUpdate(newFiles.length > 0);
      }
    };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5 text-red-600" />
          Product Images
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div>
          <Label htmlFor="file-upload" className="cursor-pointer">
            <div className={`flex items-center space-x-2 bg-white border px-4 py-2 rounded hover:bg-red-50 transition-colors `}>
              <Upload className="w-4 h-4" />
              <span>Select Images</span>
            </div>
          </Label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-sm text-gray-600 mt-2">
            JPG, PNG or GIF. Max size 2MB per image.
          </p>
          {/* {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
}
