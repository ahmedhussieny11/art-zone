import { NextResponse } from "next/server";
import {
  getAdminUserRecords,
  saveAdminUserRecords,
  generateId,
  type AdminUserRecord,
} from "@/lib/data";
import { getEnvAdminAccounts } from "@/lib/auth";
import { hashAdminPassword } from "@/lib/admin-crypto";

const MIN_PASSWORD = 8;

export async function GET() {
  const fileUsers = getAdminUserRecords();
  if (fileUsers.length > 0) {
    return NextResponse.json({
      source: "file" as const,
      users: fileUsers.map((u) => ({ _id: u._id, username: u.username })),
    });
  }
  return NextResponse.json({
    source: "env" as const,
    users: getEnvAdminAccounts().map((a, i) => ({
      _id: `_env_${i}`,
      username: a.username,
      managedInEnv: true as const,
    })),
  });
}

export async function POST(request: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!username) {
    return NextResponse.json({ error: "اسم المستخدم مطلوب" }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `كلمة المرور يجب أن تكون ${MIN_PASSWORD} أحرف على الأقل` },
      { status: 400 }
    );
  }

  const existing = getAdminUserRecords();
  const taken = new Set(
    existing.length > 0
      ? existing.map((u) => u.username)
      : getEnvAdminAccounts().map((a) => a.username)
  );
  if (taken.has(username)) {
    return NextResponse.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 409 });
  }

  const record: AdminUserRecord = {
    _id: generateId(),
    username,
    passwordHash: hashAdminPassword(password),
  };
  saveAdminUserRecords([...existing, record]);
  return NextResponse.json({
    success: true,
    user: { _id: record._id, username: record.username },
  });
}
