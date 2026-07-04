export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export interface CloudinaryUploadResult {
  imageUrl: string;
  publicId: string;
  width: number;
  height: number;
}

interface UploadImageApiResponse {
  success?: boolean;
  imageUrl?: string;
  publicId?: string;
  width?: number;
  height?: number;
  error?: string;
}

/** Client-side pre-check so obviously-invalid files never hit the network. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Unsupported image type. Allowed formats: JPG, JPEG, PNG, WEBP, AVIF.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image must be smaller than 5 MB.";
  }
  return null;
}

/**
 * Uploads a single image to our /api/upload-image Route Handler (which
 * forwards it to Cloudinary server-side), reporting progress (0-100) along
 * the way via XMLHttpRequest — fetch() has no upload progress events.
 */
export function uploadImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  const validationError = validateImageFile(file);
  if (validationError) return Promise.reject(new Error(validationError));

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload-image");
    xhr.timeout = 60000;

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      let data: UploadImageApiResponse;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Unexpected response from the server."));
        return;
      }

      if (
        xhr.status >= 200 &&
        xhr.status < 300 &&
        data.success &&
        data.imageUrl &&
        data.publicId
      ) {
        resolve({
          imageUrl: data.imageUrl,
          publicId: data.publicId,
          width: data.width ?? 0,
          height: data.height ?? 0,
        });
      } else {
        reject(new Error(data.error || "Image upload failed."));
      }
    };

    xhr.onerror = () =>
      reject(new Error("Network error during upload. Check your connection and try again."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Please try again."));

    xhr.send(formData);
  });
}

/** Uploads several images in parallel, reporting per-file progress. */
export async function uploadMultipleImages(
  files: File[],
  onProgress?: (fileIndex: number, percent: number) => void,
): Promise<CloudinaryUploadResult[]> {
  return Promise.all(
    files.map((file, index) =>
      uploadImage(file, (percent) => onProgress?.(index, percent)),
    ),
  );
}

export async function deleteImage(publicId: string): Promise<void> {
  const response = await fetch("/api/delete-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  });

  let data: { success?: boolean; error?: string } = {};
  try {
    data = await response.json();
  } catch {
    // Ignore malformed/empty response bodies — handled by the ok/success check below.
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to delete image.");
  }
}

/** Best-effort bulk delete — failures are logged, not thrown, so one bad ID doesn't block the rest. */
export async function deleteMultipleImages(publicIds: string[]): Promise<void> {
  await Promise.all(
    publicIds.map((id) =>
      deleteImage(id).catch((error: unknown) => {
        console.error(`Failed to delete Cloudinary image ${id}:`, error);
      }),
    ),
  );
}
