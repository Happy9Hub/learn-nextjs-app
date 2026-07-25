import { redirect } from "next/navigation"
import { getCachedSession } from "@/lib/get-session"
import { ProductsClient } from "./products-client"

export default async function ProductsPage() {
  const session = await getCachedSession()

  if (!session || session.user.role !== "admin") {
    redirect("/")
  }

  return <ProductsClient />
}
