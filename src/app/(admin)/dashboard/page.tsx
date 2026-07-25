import { redirect } from "next/navigation"
import { getCachedSession } from "@/lib/get-session"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const session = await getCachedSession()

  if (!session || session.user.role !== "admin") {
    redirect("/")
  }

  return <DashboardClient />
}
