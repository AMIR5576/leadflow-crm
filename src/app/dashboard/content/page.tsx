import ContentLibrary from "@/components/dashboard/ContentLibrary";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function ContentPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const files = await prisma.contentFile.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return <ContentLibrary initialFiles={files as never} />;
}
