import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types/api";
import type { AdminOrderItem } from "@/types/admin";

// GET /api/admin/orders?limit=5
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const limitParam = Number(request.nextUrl.searchParams.get("limit"));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 5;

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        take: limit,
        orderBy: { date: "desc" },
        include: { customers: { select: { name: true } } },
      }),
      prisma.orders.count(),
    ]);

    const data: AdminOrderItem[] = orders.map((order) => ({
      id: order.id,
      customerName: order.customers?.name ?? "ไม่ระบุ",
      status: order.status ?? "processing",
      totalAmount: Number(order.total_amount ?? 0),
      date: (order.date ?? new Date()).toISOString(),
    }));

    return NextResponse.json<ApiResponse<{ orders: AdminOrderItem[]; total: number }>>({
      success: true,
      data: { orders: data, total },
    });
  } catch (error) {
    console.error("Failed to load admin orders", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "โหลดข้อมูลออเดอร์ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
