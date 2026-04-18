// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminHash = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@leadflow.com" },
    update: {},
    create: {
      email: "admin@leadflow.com",
      name: "LeadFlow Admin",
      passwordHash: adminHash,
      role: "ADMIN",
      plan: "TEAM",
      companyName: "LeadFlow Inc",
      onboarding: { create: {} },
    },
  });
  console.log("✅ Admin user:", admin.email);

  // Demo user
  const demoHash = await bcrypt.hash("demo123456", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@leadflow.com" },
    update: {},
    create: {
      email: "demo@leadflow.com",
      name: "Rajesh Sharma",
      passwordHash: demoHash,
      role: "OWNER",
      plan: "PRO",
      companyName: "Sharma Realty",
      onboarding: {
        create: {
          downloadedApp: true,
          connectedFacebook: true,
          connectedLeadSources: false,
          setDefaultSequence: false,
          setAutoResponder: false,
          addedCustomFields: false,
          invitedTeam: false,
          sentFirstMessage: true,
        },
      },
    },
  });
  console.log("✅ Demo user:", demo.email);

  // Seed demo clients
  const sources = ["Facebook Ads", "Google Ads", "Website Form", "IndiaMART", "Manual"];
  const statuses = ["NEW", "CONTACTED", "INTERESTED", "FOLLOW_UP", "CONVERTED", "LOST"];
  const names = [
    "Amit Kumar", "Priya Singh", "Rahul Verma", "Sunita Patel",
    "Vikram Rao", "Anjali Sharma", "Ravi Gupta", "Meera Nair",
    "Suresh Iyer", "Kavita Mehta", "Arun Joshi", "Pooja Malhotra",
  ];

  for (let i = 0; i < names.length; i++) {
    const client = await prisma.client.create({
      data: {
        name: names[i],
        phone: `+91${9800000000 + i}`,
        email: `${names[i].toLowerCase().replace(" ", ".")}@email.com`,
        leadSource: sources[i % sources.length],
        status: statuses[i % statuses.length] as never,
        notes: `Lead from ${sources[i % sources.length]}. Interested in residential property.`,
        tags: i % 3 === 0 ? ["hot-lead"] : i % 2 === 0 ? ["follow-up"] : [],
        contentViews: Math.floor(Math.random() * 5),
        createdById: demo.id,
        createdAt: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)), // staggered dates
        lastActivityAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        followUpAt: i % 3 === 0 ? new Date(Date.now() + (2 * 24 * 60 * 60 * 1000)) : null,
      },
    });

    // Seed activities for each client
    await prisma.activity.create({
      data: {
        type: "LEAD_RECEIVED",
        clientId: client.id,
        userId: demo.id,
        notes: `Lead received from ${sources[i % sources.length]}`,
        createdAt: client.createdAt,
      },
    });

    if (i % 2 === 0) {
      await prisma.activity.create({
        data: {
          type: "WHATSAPP_SENT",
          clientId: client.id,
          userId: demo.id,
          notes: "Hi {{name}}, thanks for your enquiry! I'll share more details shortly.",
          createdAt: new Date(client.createdAt.getTime() + 60 * 60 * 1000),
        },
      });
    }
  }
  console.log(`✅ Seeded ${names.length} demo clients`);

  // Seed templates
  const templates = [
    {
      name: "New Lead Intro",
      body: "Hi {{name}}! 👋 Thanks for your enquiry. I'm {{agent_name}} and I'd love to help you. Can we connect for a quick call?",
      channel: "WHATSAPP" as const,
      category: "INTRODUCTION" as const,
    },
    {
      name: "Follow-up Day 1",
      body: "Hi {{name}}, following up on your enquiry. Are you still looking? I have some great options to share with you!",
      channel: "WHATSAPP" as const,
      category: "FOLLOWUP" as const,
    },
    {
      name: "Follow-up Day 3",
      body: "Hello {{name}} 😊 Just checking in — do you have 10 minutes for a quick call this week?",
      channel: "WHATSAPP" as const,
      category: "FOLLOWUP" as const,
    },
    {
      name: "Brochure Share",
      body: "Hi {{name}}, I've put together a brochure with our latest options for you. Take a look: {{link}}",
      channel: "WHATSAPP" as const,
      category: "FOLLOWUP" as const,
    },
    {
      name: "Closing Message",
      body: "Hi {{name}}, I wanted to reach out one final time. The offer we discussed is still available — shall we proceed? 🏠",
      channel: "WHATSAPP" as const,
      category: "CLOSING" as const,
    },
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: `template-${t.name.replace(/\s/g, "-").toLowerCase()}` },
      update: {},
      create: { id: `template-${t.name.replace(/\s/g, "-").toLowerCase()}`, ...t, userId: demo.id, isGlobal: true },
    }).catch(() =>
      prisma.template.create({ data: { ...t, userId: demo.id, isGlobal: true } })
    );
  }
  console.log("✅ Seeded message templates");

  // Seed default sequence
  const seq = await prisma.sequence.create({
    data: {
      name: "New Lead Intro Sequence",
      description: "Automatic 3-step follow-up for all new leads",
      isDefault: true,
      userId: demo.id,
      steps: {
        create: [
          { order: 1, channel: "WHATSAPP", delayMinutes: 0, customBody: "Hi {{name}}! 👋 Thanks for reaching out. I'm {{agent_name}}. Can we connect for a quick call?" },
          { order: 2, channel: "WHATSAPP", delayMinutes: 1440, customBody: "Hi {{name}}, just following up on my earlier message. Are you still looking? Happy to help!" },
          { order: 3, channel: "WHATSAPP", delayMinutes: 4320, customBody: "Hello {{name}} 😊 One last follow-up — I have some great options to share. Let me know if you'd like to connect!" },
        ],
      },
    },
  });
  console.log("✅ Seeded default sequence:", seq.name);

  // Seed lead sources
  await prisma.leadSource.createMany({
    data: [
      { name: "Facebook Ads", type: "FACEBOOK_ADS", userId: demo.id, isActive: true, leadCount: 45 },
      { name: "Website Form", type: "WEBSITE_FORM", userId: demo.id, isActive: true, leadCount: 23 },
      { name: "Google Ads", type: "GOOGLE_ADS", userId: demo.id, isActive: false, leadCount: 12 },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Seeded lead sources");

  // Seed tool usage history
  const actions = ["create_lead", "send_whatsapp", "webhook_lead_received", "use_sequence", "view_analytics"];
  for (let i = 0; i < 50; i++) {
    await prisma.toolUsage.create({
      data: {
        userId: demo.id,
        action: actions[i % actions.length],
        createdAt: new Date(Date.now() - (i * 3 * 60 * 60 * 1000)),
      },
    });
  }
  console.log("✅ Seeded tool usage logs");

  console.log("\n🎉 Seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin:  admin@leadflow.com / admin123456");
  console.log("Demo:   demo@leadflow.com  / demo123456");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
