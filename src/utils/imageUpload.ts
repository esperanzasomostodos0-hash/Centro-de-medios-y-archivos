/**
 * Utility to downscale photos from mobile cameras/files and upload directly to server storage.
 * Eliminates QuotaExceededError in localStorage and ensures all connected devices
 * can immediately view photos uploaded by any employee.
 */

export async function compressImageToDataUrl(
  fileOrDataUrl: File | string,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    let src = '';

    const processImage = (img: HTMLImageElement) => {
      let { width, height } = img;

      // Calculate new dimensions preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Draw and compress
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      processImage(img);
    };

    img.onerror = (e) => {
      reject(new Error('Failed to load image for compression'));
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = (e.target?.result as string) || '';
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Compresses an image and uploads it to the central server.
 * Returns the public URL (e.g. "/uploads/cma_img_12345.jpg") that any device can display.
 */
export async function uploadImageToServer(
  fileOrDataUrl: File | string,
  filename = 'foto_documento.jpg'
): Promise<string> {
  try {
    // 1. Compress client-side first to avoid sending multi-megabyte payloads
    const compressedDataUrl = await compressImageToDataUrl(fileOrDataUrl);

    // 2. Upload to server
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: compressedDataUrl,
        filename,
        mimeType: 'image/jpeg',
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.url) {
        return json.url;
      }
    }

    // Fallback to compressed base64 if server upload endpoint failed or offline
    console.warn('Server upload failed, using compressed base64 fallback');
    return compressedDataUrl;
  } catch (err) {
    console.warn('Image upload error, attempting fallback:', err);
    try {
      return await compressImageToDataUrl(fileOrDataUrl);
    } catch {
      return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';
    }
  }
}
