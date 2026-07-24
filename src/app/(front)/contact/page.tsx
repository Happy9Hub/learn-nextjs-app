import type { Metadata } from "next";
import { MailIcon, PhoneIcon, ClockIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: "ติดต่อทีมงานของเรา",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center sm:mb-12">
        <h1 className="text-3xl font-semibold sm:text-4xl">ติดต่อเรา</h1>
        <p className="mt-2 text-muted-foreground">
          มีคำถามหรือข้อเสนอแนะ? ส่งข้อความถึงเราได้เลย
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.6fr] md:gap-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <MailIcon className="size-5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">contact@example.com</span>
          </div>
          <div className="flex items-center gap-3">
            <PhoneIcon className="size-5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">02-123-4567</span>
          </div>
          <div className="flex items-center gap-3">
            <ClockIcon className="size-5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">จันทร์ - ศุกร์ 9:00 - 18:00</span>
          </div>

          <Separator className="my-2" />

          <p className="text-sm text-muted-foreground">
            ทีมงานของเราจะตอบกลับข้อความของคุณโดยเร็วที่สุด โดยปกติภายใน 1-2
            วันทำการ
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
