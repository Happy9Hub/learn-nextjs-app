export type AdminStats = {
  todaySales: number
  todayOrders: number
  pendingOrders: number
  totalProducts: number
  totalUsers: number
}

export type RevenuePoint = {
  date: string
  revenue: number
  orders: number
}

export type AdminOrderItem = {
  id: number
  customerName: string
  status: string
  totalAmount: number
  date: string
}

export type Period = "7d" | "30d" | "90d"

export type AdminProduct = {
  id: number
  name: string
  description: string | null
  price: number
  categoryId: number
  categoryName: string
}

export type CategoryOption = {
  id: number
  name: string
}
