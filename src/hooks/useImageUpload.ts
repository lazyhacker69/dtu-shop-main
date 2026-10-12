import { useState } from 'react';
import { toast } from 'sonner';

interface UseImageUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  uploadEndpoint: string;
}

export function useImageUpload({
  maxSize = 2 * 1024 * 1024, // 2MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  uploadEndpoint,
}: UseImageUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid File Type", {
        description: "Please select a valid image file.",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast.error("File Too Large", {
        description: `File must be less than ${Math.round(maxSize / (1024 * 1024))}MB.`,
      });
      return false;
    }

    return true;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!validateFile(file)) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Upload Successful", {
          description: "Image uploaded successfully.",
        });
        return result.url;
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error: any) {
      toast.error("Upload Failed", {
        description: error.message || "Failed to upload image.",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        if (validateFile(file)) {
          formData.append('images', file);
        }
      });

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Upload Successful", {
          description: `${result.urls.length} images uploaded successfully.`,
        });
        return result.urls;
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error: any) {
      toast.error("Upload Failed", {
        description: error.message || "Failed to upload images.",
      });
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    uploadMultipleImages,
    isUploading,
    validateFile,
  };
}
