import * as z from "zod"

export const contactSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ").max(100),
  email: z
    .string()
    .min(1, "กรุณากรอก Email")
    .pipe(z.email("รูปแบบ Email ไม่ถูกต้อง")),
  message: z
    .string()
    .min(10, "ข้อความต้องมีอย่างน้อย 10 ตัวอักษร")
    .max(2000),
})

export type ContactFormValues = z.infer<typeof contactSchema>
