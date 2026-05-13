import { NextResponse } from "next/server";
import { getAdminUserRecords, saveAdminUserRecords } from "@/lib/data";
import { hashAdminPassword } from "@/lib/admin-crypto";

const MIN_PASSWORD = 8;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (id.startsWith("_env_")) {
    return NextResponse.json(
      { error: "لا يمكن التعديل من هنا — هذا المستخدم معرّف في ملف البيئة (.env)" },
      { status: 400 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const users = getAdminUserRecords();
  const idx = users.findIndex((u) => u._id === id);
  if (idx < 0) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  const newUsername =
    typeof body.username === "string" ? body.username.trim() : users[idx].username;
  if (!newUsername) {
    return NextResponse.json({ error: "اسم المستخدم مطلوب" }, { status: 400 });
  }

  if (newUsername !== users[idx].username) {
    if (users.some((u, i) => i !== idx && u.username === newUsername)) {
      return NextResponse.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 409 });
    }
  }

  const password = typeof body.password === "string" ? body.password : "";
  let passwordHash = users[idx].passwordHash;
  if (password.length > 0) {
    if (password.length < MIN_PASSWORD) {
      return NextResponse.json(
        { error: `كلمة المرور يجب أن تكون ${MIN_PASSWORD} أحرف على الأقل` },
        { status: 400 }
      );
    }
    passwordHash = hashAdminPassword(password);
  }

  const next = [...users];
  next[idx] = { ...users[idx], username: newUsername, passwordHash };
  saveAdminUserRecords(next);
  return NextResponse.json({ success: true, user: { _id: id, username: newUsername } });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (id.startsWith("_env_")) {
    return NextResponse.json(
      { error: "لا يمكن حذف مستخدم البيئة من هنا" },
      { status: 400 }
    );
  }

  const users = getAdminUserRecords();
  const next = users.filter((u) => u._id !== id);
  if (next.length === users.length) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }
  saveAdminUserRecords(next);
  return NextResponse.json({ success: true });
}
