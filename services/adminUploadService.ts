import { API_BASE_URL, getAuthToken } from "@/lib/apiClient";

export {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  validateImageFile,
} from "@/services/cloudinaryService";

export interface UploadResult {
  secureUrl: string;
  publicId: string;
}

interface UploadApiResponse {
  success?: boolean;
  message?: string;
  data?: { secureUrl?: string; publicId?: string };
}

function uploadToBackend(
  path: string,
  fieldName: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append(fieldName, file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}${path}`);
    xhr.timeout = 60000;

    const token = getAuthToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      let data: UploadApiResponse;
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
        data.data?.secureUrl &&
        data.data?.publicId
      ) {
        resolve({ secureUrl: data.data.secureUrl, publicId: data.data.publicId });
      } else {
        reject(new Error(data.message || "Upload failed."));
      }
    };

    xhr.onerror = () =>
      reject(new Error("Network error during upload. Check your connection and try again."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Please try again."));

    xhr.send(formData);
  });
}

export function uploadImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  return uploadToBackend("/upload/image", "image", file, onProgress);
}

export function uploadDownloadFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  return uploadToBackend("/upload/download-file", "file", file, onProgress);
}

async function deleteAsset(path: string, publicId: string): Promise<void> {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ publicId }),
  }).catch(() => undefined);
}

export function deleteImage(publicId: string): Promise<void> {
  return deleteAsset("/upload/image/delete", publicId);
}

export function deleteDownloadFile(publicId: string): Promise<void> {
  return deleteAsset("/upload/download-file/delete", publicId);
}

export async function deleteMultipleImages(publicIds: string[]): Promise<void> {
  await Promise.all(publicIds.map((id) => deleteImage(id)));
}
