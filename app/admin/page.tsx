import { getProjects, getMessages, getTestimonials, getServices, getArticles } from "@/lib/data";
import Link from "next/link";
import { ADMIN_UI_BASE } from "@/lib/admin-path";

export default function AdminDashboard() {
  const projects = getProjects();
  const messages = getMessages();
  const testimonials = getTestimonials();
  const services = getServices();
  const articles = getArticles();
  const unreadMessages = messages.filter((m) => !m.read).length;

  const stats = [
    { label: "المشاريع", value: projects.length, href: `${ADMIN_UI_BASE}/projects`, color: "bg-gold/10 text-gold" },
    { label: "المقالات", value: articles.length, href: `${ADMIN_UI_BASE}/articles`, color: "bg-orange-50 text-orange-600" },
    { label: "الخدمات", value: services.length, href: `${ADMIN_UI_BASE}/services`, color: "bg-blue-50 text-blue-600" },
    { label: "آراء العملاء", value: testimonials.length, href: `${ADMIN_UI_BASE}/testimonials`, color: "bg-green-50 text-green-600" },
    { label: "الرسائل", value: messages.length, href: `${ADMIN_UI_BASE}/messages`, color: "bg-purple-50 text-purple-600", badge: unreadMessages },
  ];

  const recentMessages = messages.slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal">لوحة التحكم</h1>
      <p className="mt-1 text-warmgray">مرحباً بك في لوحة تحكم آرت زون</p>

      {/* Stats */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-warmgray">{stat.label}</span>
              {stat.badge ? (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {stat.badge} جديد
                </span>
              ) : null}
            </div>
            <p className={`mt-3 text-3xl font-bold ${stat.color.split(" ")[1]}`}>
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent messages */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal">آخر الرسائل</h2>
          <Link href={`${ADMIN_UI_BASE}/messages`} className="text-sm text-gold hover:text-gold-dark">
            عرض الكل
          </Link>
        </div>

        {recentMessages.length === 0 ? (
          <div className="mt-4 rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-warmgray">لا توجد رسائل حتى الآن</p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-start text-xs font-medium text-warmgray">الاسم</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-warmgray">الخدمة</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-warmgray">التاريخ</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-warmgray">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentMessages.map((msg) => (
                  <tr key={msg._id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 text-sm font-medium text-charcoal">{msg.name}</td>
                    <td className="px-6 py-4 text-sm text-warmgray">{msg.service}</td>
                    <td className="px-6 py-4 text-sm text-warmgray">
                      {new Date(msg.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${msg.read ? "bg-gray-100 text-warmgray" : "bg-gold/10 text-gold"}`}>
                        {msg.read ? "مقروءة" : "جديدة"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
