import TemplatesManager from "@/components/dashboard/TemplatesManager";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function createTemplate(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  const name = formData.get("name") as string;
  const body = formData.get("body") as string;
  const channel = formData.get("channel") as string;
  const category = formData.get("category") as string;
  const isGlobal = formData.get("isGlobal") === "true";
  if (!name || !body) return { error: "Name and body required" };
  const template = await prisma.template.create({
    data: { name, body, channel: channel as never, category: category as never, isGlobal, userId: session.id },
  });
  revalidatePath("/dashboard/settings/templates");
  return { success: true, data: template };
}

async function deleteTemplate(id: string) {
  "use server";
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  await prisma.template.deleteMany({ where: { id, userId: session.id } });
  revalidatePath("/dashboard/settings/templates");
  return { success: true };
}

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

  return (
    <TemplatesManager
      initialTemplates={initialTemplates}
      createTemplate={createTemplate}
      deleteTemplate={deleteTemplate}
    />
  );
}
