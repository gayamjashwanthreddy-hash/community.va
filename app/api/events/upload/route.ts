import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "public"; // "public" (cover/QR) or "payment-proof" (private)

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided for upload" },
        { status: 400 }
      );
    }

    // Validate mime type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Unsupported file type. Please upload a PNG, JPG, JPEG, or WebP image." },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "File exceeds maximum allowed size of 5 MB." },
        { status: 400 }
      );
    }

    const bucketName = type === "payment-proof" ? "event-payment-proofs" : "event-public-assets";
    const extension = file.name.split(".").pop() || "png";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 7);
    const fileName = `${type}_${timestamp}_${random}.${extension}`;
    const filePath = `${fileName}`;

    const adminClient = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const { data, error } = await adminClient.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (!error && data) {
        if (type === "public") {
          const { data: publicUrlData } = adminClient.storage
            .from(bucketName)
            .getPublicUrl(filePath);

          return NextResponse.json({
            success: true,
            filePath: publicUrlData.publicUrl,
            fileName,
          });
        } else {
          // Private bucket: generate 7-day signed URL or return path
          const { data: signedData } = await adminClient.storage
            .from(bucketName)
            .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

          return NextResponse.json({
            success: true,
            filePath: signedData?.signedUrl || filePath,
            storagePath: filePath,
            fileName,
          });
        }
      }
    } catch (uploadErr) {
      console.warn("[Upload] Supabase Storage upload fallback:", uploadErr);
    }

    // Fallback data URI for local offline testing if Supabase bucket isn't provisioned yet
    const base64Data = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      filePath: dataUri,
      fileName,
    });
  } catch (err: any) {
    console.error("[API /api/events/upload POST]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
