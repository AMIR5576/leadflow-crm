import ContentLibrary from "@/components/dashboard/ContentLibrary";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function ContentPage() {
  let initialFiles: never[] = [];

  try {
    const session = await getSession();
    if (session) {
      const files = await prisma.contentFile.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
      });
      initialFiles = files as never[];
    }
  } catch {
    initialFiles = [];
  }

  return <ContentLibrary initialFiles={initialFiles} />;
}
