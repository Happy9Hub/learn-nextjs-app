"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { CheckCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  contactSchema,
  type ContactFormValues,
} from "@/lib/validations/contact"
import type { ApiResponse } from "@/types/api"

export function ContactForm() {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  function onSubmit(values: ContactFormValues) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
        const json: ApiResponse<null> = await res.json()

        if (!json.success) {
          toast.error(json.error)
          return
        }

        form.reset()
        setSubmitted(true)
      } catch {
        toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
      }
    })
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircleIcon className="size-12 text-primary" />
        <div>
          <p className="font-medium">ส่งข้อความสำเร็จ</p>
          <p className="text-sm text-muted-foreground">
            ขอบคุณสำหรับข้อความ ทีมงานจะติดต่อกลับโดยเร็วที่สุด
          </p>
        </div>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          ส่งข้อความอีกครั้ง
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-name">ชื่อ</FieldLabel>
              <Input
                {...field}
                id="contact-name"
                aria-invalid={fieldState.invalid}
                placeholder="กรอกชื่อของคุณ"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-email">Email</FieldLabel>
              <Input
                {...field}
                id="contact-email"
                type="email"
                aria-invalid={fieldState.invalid}
                placeholder="example@email.com"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-message">ข้อความ</FieldLabel>
              <Textarea
                {...field}
                id="contact-message"
                rows={5}
                aria-invalid={fieldState.invalid}
                placeholder="พิมพ์ข้อความที่ต้องการ..."
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "กำลังส่ง..." : "ส่งข้อความ"}
        </Button>
      </FieldGroup>
    </form>
  )
}
