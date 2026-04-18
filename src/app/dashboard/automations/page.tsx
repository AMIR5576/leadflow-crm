// src/app/dashboard/automations/page.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SequenceBuilder from "@/components/dashboard/SequenceBuilder";

export default async function AutomationsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const sequences = await prisma.sequence.findMany({
    where: { userId: session.id },
    include: { steps: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Automations</h1>
        <p className="text-gray-500 text-sm">
          Build multi-step follow-up sequences. Let AI generate them for you.
        </p>
      </div>
      <SequenceBuilder sequences={sequences as never} />
    </div>
  );
}
