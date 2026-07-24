import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types/api";
import type { AdminStats } from "@/types/admin";

// GET /api/admin/stats
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const [todayAgg, pendingOrders, totalProducts, totalUsers] = await Promise.all([
      prisma.orders.aggregate({
        where: { date: { gte: startOfToday, lt: startOfTomorrow } },
        _sum: { total_amount: true },
        _count: { id: true },
      }),
      prisma.orders.count({
        where: { status: { in: ["processing", "received"] } },
      }),
      prisma.products.count(),
      prisma.user.count(),
    ]);

    const stats: AdminStats = {
      todaySales: Number(todayAgg._sum.total_amount ?? 0),
      todayOrders: todayAgg._count.id,
      pendingOrders,
      totalProducts,
      totalUsers,
    };

    return NextResponse.json<ApiResponse<AdminStats>>({ success: true, data: stats });
  } catch (error) {
    console.error("Failed to load admin stats", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "โหลดข้อมูลสถิติไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
