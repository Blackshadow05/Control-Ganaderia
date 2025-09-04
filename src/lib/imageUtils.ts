import { supabase } from './supabase';

export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions (max 1100px)
        const maxSize = 1100;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);

        // Try WebP with quality 0.85 first
        let quality = 0.85;
        let compressedDataUrl = canvas.toDataURL('image/webp', quality);

        // If file size is too large, reduce quality to minimum 0.70
        let blob = dataURLToBlob(compressedDataUrl);
        if (blob.size > 500 * 1024) { // If larger than 500KB
          quality = 0.70;
          compressedDataUrl = canvas.toDataURL('image/webp', quality);
          blob = dataURLToBlob(compressedDataUrl);
        }

        // Create new file with compressed data
        const compressedFile = new File([blob], `${file.name.split('.')[0]}.webp`, {
          type: 'image/webp',
          lastModified: Date.now()
        });

        resolve(compressedFile);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Error loading image'));
    };

    // Create object URL for the image
    img.src = URL.createObjectURL(file);
  });
}

function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

export async function uploadImage(file: File, bucketName: string = 'cattle-images'): Promise<string | null> {
  try {
    // Compress image first
    const compressedFile = await compressImage(file);

    // Generate unique filename
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
    const filePath = `cattle/${fileName}`;

    // Upload compressed file to Supabase Storage
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
}

export async function deleteImage(imageUrl: string, bucketName: string = 'cattle-images'): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `cattle/${fileName}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return false;
  }
}
