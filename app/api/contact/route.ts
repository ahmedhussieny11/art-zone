import { NextResponse } from "next/server";
import { saveMessage, generateId } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, service, budget, message } = body;

    if (!name || !phone || !service || !message) {
      return NextResponse.json({ error: "حقول مطلوبة ناقصة" }, { status: 400 });
    }

    saveMessage({
      _id: generateId(),
      name,
      phone,
      email: email || "",
      service,
      budget: budget || "",
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });

    const contactEmail = process.env.CONTACT_EMAIL || "info@artzonedesign.com";
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "Art Zone Design <onboarding@resend.dev>",
        to: contactEmail,
        subject: `طلب استشارة جديد من ${name}`,
        html: `
          <h2 dir="rtl">طلب استشارة جديد</h2>
          <div dir="rtl">
          <p><strong>الاسم:</strong> ${name}</p>
          <p><strong>الجوال:</strong> ${phone}</p>
          <p><strong>البريد:</strong> ${email || "غير محدد"}</p>
          <p><strong>الخدمة:</strong> ${service}</p>
          <p><strong>الميزانية:</strong> ${budget || "غير محددة"}</p>
          <p><strong>الرسالة:</strong></p>
          <p>${message}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "فشل في إرسال الرسالة" }, { status: 500 });
  }
}
