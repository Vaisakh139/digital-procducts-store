import { NextResponse } from "next/server";
import { deleteImageByPublicId, isCloudinaryConfigured } from "@/lib/cloudinary";

export const runtime = "nodejs";

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

  let publicId: string;
  try {
    const body = await request.json();
    if (typeof body?.publicId !== "string" || body.publicId.trim() === "") {
      return NextResponse.json(
        { success: false, error: "publicId is required." },
        { status: 400 },
      );
    }
    publicId = body.publicId;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  try {
    await deleteImageByPublicId(publicId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image. Please try again." },
      { status: 502 },
    );
  }
}
