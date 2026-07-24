"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AdminOrderItem } from "@/types/admin"

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
})

const STATUS_LABEL: Record<string, string> = {
  processing: "กำลังดำเนินการ",
  received: "รับออเดอร์แล้ว",
  delivered: "จัดส่งแล้ว",
}

export function RecentOrdersTable({ orders }: { orders: AdminOrderItem[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
        ยังไม่มีออเดอร์
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>รหัสออเดอร์</TableHead>
          <TableHead>ลูกค้า</TableHead>
          <TableHead>สถานะ</TableHead>
          <TableHead>ยอดรวม</TableHead>
          <TableHead>วันที่</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">#{order.id}</TableCell>
            <TableCell>{order.customerName}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {STATUS_LABEL[order.status] ?? order.status}
              </Badge>
            </TableCell>
            <TableCell>{currencyFormatter.format(order.totalAmount)}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(order.date).toLocaleDateString("th-TH")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
