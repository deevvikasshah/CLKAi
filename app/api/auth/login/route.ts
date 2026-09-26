import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rateLimit";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  const limited = rateLimit(`login:${ip}`, RATE_LIMITS.LOGIN.limit, RATE_LIMITS.LOGIN.windowMs);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: body.data.email } });

  const passwordOk = user ? await verifyPassword(body.data.password, user.passwordHash) : false;

  if (!user || !passwordOk || !user.isActive) {
    await writeAuditLog({
      action: "login.failed",
      entityType: "User",
      entityId: user?.id,
      ipAddress: ip,
      metadata: { emailAttempted: body.data.email },
    });
    // Same generic message whether the account exists or not — avoids
    // leaking which emails are registered.
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await setSessionCookie({ userId: user.id, role: user.role, name: user.name });
  await writeAuditLog({ actorUserId: user.id, action: "login.success", entityType: "User", entityId: user.id, ipAddress: ip });

  return NextResponse.json({ ok: true, role: user.role });
}
