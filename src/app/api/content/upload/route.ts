import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("leadflow_session")?.value;
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const session = await verifyToken(token);
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
    if (!apiKey) return NextResponse.json({ success: false, error: "Add UPLOADTHING_SECRET to Vercel environment variables." }, { status: 500 });

    const { UTApi } = await import("uploadthing/server");
    const utapi = new UTApi({ token: apiKey });

    const response = await utapi.uploadFiles(file);

    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: "Upload failed: " + (response.error?.message || "Unknown") }, { status: 500 });
    }

    const fileUrl = response.data.ufsUrl || response.data.url;
    const trackingKey = Math.random().toString(36).slice(2) + Date.now().toString(36);

    const contentFile = await prisma.contentFile.create({
      data: {
        name: name || file.name, description, fileUrl,
        fileType: file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : "pdf",
        fileSize: file.size, folder, trackingKey, userId: session.id,
      },
    });

    await prisma.toolUsage.create({ data: { userId: session.id, action: "upload_content" } });
    return NextResponse.json({ success: true, data: contentFile }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}
