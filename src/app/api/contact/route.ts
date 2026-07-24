import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { contactSchema } from "@/lib/validations/contact";
import type { ApiResponse } from "@/types/api";

// POST /api/contact — public, ส่ง email ผ่าน SMTP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: message },
        { status: 400 }
      );
    }

    const { name, email, message } = parsed.data;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      replyTo: email,
      subject: `ข้อความติดต่อใหม่จาก ${name}`,
      text: `จาก: ${name} <${email}>\n\n${message}`,
    });

    return NextResponse.json<ApiResponse<null>>({ success: true, data: null });
  } catch (error) {
    console.error("Failed to send contact email", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
