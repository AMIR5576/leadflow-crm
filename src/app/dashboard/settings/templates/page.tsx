import TemplatesManager from "@/components/dashboard/TemplatesManager";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function TemplatesPage() {
  let initialTemplates: never[] = [];
  try {
    const session = await getSession();
    if (session) {
      const templates = await prisma.template.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
      });
      initialTemplates = templates as never[];
    }
  } catch { initialTemplates = []; }
  return <TemplatesManager initialTemplates={initialTemplates} />;
}
