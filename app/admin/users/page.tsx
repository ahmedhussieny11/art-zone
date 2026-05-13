"use client";

import { useCallback, useEffect, useState } from "react";

type UserRow = { _id: string; username: string; managedInEnv?: true };

type UsersResponse = { source: "file" | "env"; users: UserRow[] };

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ username: "", password: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const r = await fetch("/api/admin/users");
    if (!r.ok) {
      setError("تعذر تحميل البيانات");
      setLoading(false);
      return;
    }
    const j = (await r.json()) as UsersResponse;
    setData(j);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    setSaved("");
    const r = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUser.username, password: newUser.password }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(typeof j.error === "string" ? j.error : "فشل الإضافة");
      setAdding(false);
      return;
    }
    setNewUser({ username: "", password: "" });
    setSaved("تم إضافة المستخدم");
    setTimeout(() => setSaved(""), 4000);
    await load();
    setAdding(false);
  }

  function startEdit(u: UserRow) {
    if (u.managedInEnv) return;
    setEditingId(u._id);
    setEditForm({ username: u.username, password: "" });
    setError("");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSavingEdit(true);
    setError("");
    const r = await fetch(`/api/admin/users/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: editForm.username,
        password: editForm.password || undefined,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(typeof j.error === "string" ? j.error : "فشل الحفظ");
      setSavingEdit(false);
      return;
    }
    setEditingId(null);
    setSaved("تم حفظ التعديلات");
    setTimeout(() => setSaved(""), 4000);
    await load();
    setSavingEdit(false);
  }

  async function handleDelete(u: UserRow) {
    if (u.managedInEnv) return;
    if (!confirm(`حذف المستخدم «${u.username}»؟`)) return;
    setError("");
    const r = await fetch(`/api/admin/users/${u._id}`, { method: "DELETE" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(typeof j.error === "string" ? j.error : "فشل الحذف");
      return;
    }
    setSaved("تم الحذف");
    setTimeout(() => setSaved(""), 4000);
    if (editingId === u._id) setEditingId(null);
    await load();
  }

  if (loading || !data) {
    return <div className="text-warmgray">جاري التحميل...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal">حسابات الدخول</h1>
      <p className="mt-1 text-sm text-warmgray">إدارة من يستطيع الدخول إلى لوحة التحكم</p>

      {data.source === "env" && (
        <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-950">
          <p className="font-medium">المستخدمون الحاليون من ملف البيئة (.env)</p>
          <p className="mt-2 text-amber-900/90">
            بمجرد إضافة مستخدم من هنا، يُخزَّن الحساب في ملف على السيرفر وتصبح لوحة التحكم تعتمد عليه فقط
            (ولن يُستخدم الدخول من البيئة حتى تحذف كل المستخدمين من القائمة أدناه).
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {saved && <p className="mt-4 text-sm text-emerald-700">{saved}</p>}

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-charcoal">المستخدمون</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[320px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-start text-xs text-warmgray">
                <th className="pb-3 pe-4 font-medium">اسم المستخدم</th>
                <th className="pb-3 pe-4 font-medium">المصدر</th>
                <th className="pb-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {data.users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-warmgray">
                    لا يوجد مستخدمون في البيئة — أضف مستخدمًا بالأسفل
                  </td>
                </tr>
              ) : (
                data.users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pe-4 font-medium text-charcoal">{u.username}</td>
                    <td className="py-3 pe-4 text-warmgray">
                      {u.managedInEnv ? "ملف البيئة" : "ملف البيانات"}
                    </td>
                    <td className="py-3">
                      {u.managedInEnv ? (
                        <span className="text-xs text-warmgray">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(u)}
                            className="text-xs text-gold-dark hover:underline"
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            حذف
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-charcoal">إضافة مستخدم</h2>
        <form onSubmit={handleAdd} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new-username" className="mb-1 block text-xs font-medium text-warmgray">
              اسم المستخدم
            </label>
            <input
              id="new-username"
              value={newUser.username}
              onChange={(e) => setNewUser((p) => ({ ...p, username: e.target.value }))}
              required
              className="w-full border border-gray-200 px-3 py-2.5 text-sm text-charcoal outline-none focus:border-gold"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="mb-1 block text-xs font-medium text-warmgray">
              كلمة المرور (8 أحرف على الأقل)
            </label>
            <input
              id="new-password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full border border-gray-200 px-3 py-2.5 text-sm text-charcoal outline-none focus:border-gold"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={adding}
              className="bg-gold px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-dark disabled:opacity-50"
            >
              {adding ? "جاري الإضافة..." : "إضافة مستخدم"}
            </button>
          </div>
        </form>
      </div>

      {editingId && (
        <div className="mt-6 rounded-xl border border-gold/30 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-charcoal">تعديل مستخدم</h2>
          <form onSubmit={handleSaveEdit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-username" className="mb-1 block text-xs font-medium text-warmgray">
                اسم المستخدم
              </label>
              <input
                id="edit-username"
                value={editForm.username}
                onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))}
                required
                className="w-full border border-gray-200 px-3 py-2.5 text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>
            <div>
              <label htmlFor="edit-password" className="mb-1 block text-xs font-medium text-warmgray">
                كلمة مرور جديدة (اتركها فارغة إن لم ترد التغيير)
              </label>
              <input
                id="edit-password"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
                minLength={editForm.password.length > 0 ? 8 : 0}
                autoComplete="new-password"
                className="w-full border border-gray-200 px-3 py-2.5 text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={savingEdit}
                className="bg-gold px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-dark disabled:opacity-50"
              >
                {savingEdit ? "جاري الحفظ..." : "حفظ"}
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="border border-gray-200 px-6 py-2.5 text-sm text-charcoal hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
