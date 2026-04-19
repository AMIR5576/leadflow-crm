import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { trackingKey: string } }
) {
  try {
    const file = await prisma.contentFile.findUnique({
      where: { trackingKey: params.trackingKey },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Update view count
    await prisma.contentFile.update({
      where: { id: file.id },
      data: { totalViews: { increment: 1 } },
    });

    // Notify the owner
    await prisma.notification.create({
      data: {
        userId: file.userId,
        type: "CONTENT_VIEWED",
        title: "Someone viewed your content!",
        body: `Your file "${file.name}" was just opened`,
        metadata: { fileId: file.id, fileName: file.name },
      },
    }).catch(() => {});

    // Redirect to actual file
    return NextResponse.redirect(file.fileUrl);

  } catch (error) {
    console.error("Content view error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
