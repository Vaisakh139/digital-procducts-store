import { NextResponse } from "next/server";
import { isCloudinaryConfigured, uploadImageBuffer } from "@/lib/cloudinary";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isCloudinaryConfigured) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Cloudinary is not configured on the server. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local.",
      },
      { status: 500 },
    );
  }

  let file: File;
  try {
    const formData = await request.formData();
    const candidate = formData.get("file");

    if (!candidate || !(candidate instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No image file was provided." },
        { status: 400 },
      );
    }
    file = candidate;
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not read the uploaded file." },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        success: false,
        error: "Unsupported image type. Allowed formats: JPG, JPEG, PNG, WEBP, AVIF.",
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, error: "Image must be smaller than 5 MB." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { success: false, error: "The uploaded file is empty." },
      { status: 400 },
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await uploadImageBuffer(buffer);

    return NextResponse.json({
      success: true,
      imageUrl: result.secureUrl,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image. Please try again." },
      { status: 502 },
    );
  }
}
