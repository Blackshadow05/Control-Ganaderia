import { Client, Storage, ID } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const storage = new Storage(client);

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

export async function uploadImage(file: File, bucketName: string = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'default'): Promise<string | null> {
  try {
    // Compress image first
    const compressedFile = await compressImage(file);

    // Generate unique filename
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;

    // Upload compressed file to Appwrite Storage
    const response = await storage.createFile(
      bucketName,
      ID.unique(),
      compressedFile
    );

    if (!response.$id) {
      throw new Error('Failed to upload file to Appwrite Storage');
    }

    // Get file view URL (not preview) for proper display
    const fileUrl = storage.getFileView(
      bucketName,
      response.$id
    );

    const url = fileUrl.toString();
    console.log('Generated image URL:', url);
    return url;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
}

export async function deleteImage(imageUrl: string, bucketName: string = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'default'): Promise<boolean> {
  try {
    // Extract file ID from URL
    // Appwrite URL format: https://cloud.appwrite.io/v1/storage/buckets/bucketId/files/fileId/view?project=...
    const urlParts = imageUrl.split('/');
    const fileIdIndex = urlParts.findIndex(part => part === 'files') + 1;
    
    if (fileIdIndex <= 0 || fileIdIndex >= urlParts.length) {
      throw new Error('Invalid image URL format');
    }
    
    const fileId = urlParts[fileIdIndex];
    
    // Remove any query parameters from the file ID
    const cleanFileId = fileId.split('?')[0];

    await storage.deleteFile(bucketName, cleanFileId);

    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return false;
  }
}

// Función para obtener la URL de una imagen de Appwrite Storage
export function getImageUrl(fileId: string, bucketName: string = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'default'): string {
  try {
    const fileUrl = storage.getFileView(
      bucketName,
      fileId
    );

    return fileUrl.toString();
  } catch (error) {
    console.error('Error getting image URL:', error);
    return '';
  }
}
