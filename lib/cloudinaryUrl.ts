/**
 * Pure, isomorphic helpers for building optimized Cloudinary delivery URLs.
 * Safe to import from client components — unlike lib/cloudinary.ts, this
 * file never touches the Cloudinary SDK or API credentials.
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "thumb";
}

/**
 * Inserts Cloudinary transformation flags (auto format, auto quality, and
 * optionally a responsive size) into a Cloudinary secure URL. Falls back to
 * returning the original URL untouched if it isn't a Cloudinary "upload" URL.
 */
export function getOptimizedImageUrl(
  url: string,
  options: CloudinaryTransformOptions = {},
): string {
  if (!url || !url.includes("/upload/")) return url;

  const transforms = ["f_auto", "q_auto"];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop && (options.width || options.height)) {
    transforms.push(`c_${options.crop}`);
  }

  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
}
