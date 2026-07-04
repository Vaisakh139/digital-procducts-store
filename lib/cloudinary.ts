import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

const CLOUDINARY_FOLDER = "digital-products";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

/**
 * Uploads an image buffer to Cloudinary via the Admin API. Must only be
 * called from server code (Route Handlers) — it uses the API secret.
 */
export function uploadImageBuffer(
  buffer: Buffer,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed with no result."));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          format: result.format,
        });
      },
    );

    uploadStream.end(buffer);
  });
}

/** Deletes an image from Cloudinary by its public_id. Safe to call even if the asset was already removed. */
export async function deleteImageByPublicId(publicId: string): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(
      `Failed to delete Cloudinary asset "${publicId}": ${result.result}`,
    );
  }
}
