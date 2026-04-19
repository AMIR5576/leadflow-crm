import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string || "";
    const description = formData.get("description") as string || "";
    const folder = formData.get("folder") as string || "General";

    if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ success: false, error: "File too large. Max 10MB." }, { status: 400 });

    const apiKey = process.env.UPLOADTHING_SECRET;
    if (!apiKey) return NextResponse.json({ success: false, error: "Storage not configured." }, { status: 500 });

    const presignRes = await fetch("https://uploadthing.com/api/uploadFiles", {
      method: "POST",
      headers: { "X-Uploadthing-Api-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ files: [{ name: file.name, size: file.size, type: file.type }], acl: "public-read", contentDisposition: "inline" }),
    });

    if (!presignRes.ok) return NextResponse.json({ success: false, error: "Upload service error." }, { status: 500 });

    const presignData = await presignRes.json();
    const uploadData = presignData.data?.[0];
    if (!uploadData?.url) return NextResponse.json({ success: false, error: "Could not get upload URL." }, { status: 500 });

    const fields = uploadData.fields || {};
    const s3Form = new FormData();
    Object.entries(fields).forEach(([k, v]) => s3Form.append(k, v as string));
    s3Form.append("file", file);

    const s3Res = await fetch(uploadData.url, { method: "POST", body: s3Form });
    if (!s3Res.ok) return NextResponse.json({ success: false, error: "File upload failed." }, { status: 500 });

    const fileUrl = uploadData.fileUrl || `${uploadData.url}/${fields.key}`;
    const trackingKey = Math.random().toString(36).slice(2) + Date.now().toString(36);

    const contentFile = await prisma.contentFile.create({
      data: {
        name: name || file.name, description, fileUrl,
        fileType: file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : "pdf",
        fileSize: file.size, folder, trackingKey, userId: session.id,
      },
    });

    return NextResponse.json({ success: true, data: contentFile }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}
