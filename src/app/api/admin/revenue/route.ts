import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types/api";
import type { Period, RevenuePoint } from "@/types/admin";

const PERIOD_DAYS: Record<Period, number> = { "7d": 7, "30d": 30, "90d": 90 };

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// GET /api/admin/revenue?period=7d|30d|90d
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const periodParam = request.nextUrl.searchParams.get("period");
    const period: Period =
      periodParam === "7d" || periodParam === "30d" || periodParam === "90d"
        ? periodParam
        : "30d";
    const days = PERIOD_DAYS[period];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(startOfToday);
    startDate.setDate(startDate.getDate() - (days - 1));

    const orders = await prisma.orders.findMany({
      where: { date: { gte: startDate } },
      select: { date: true, total_amount: true },
    });

    const buckets = new Map<string, RevenuePoint>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      buckets.set(dayKey(d), {
        date: d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit" }),
        revenue: 0,
        orders: 0,
      });
    }

    for (const order of orders) {
      if (!order.date) continue;
      const point = buckets.get(dayKey(order.date));
      if (!point) continue;
      point.revenue += Number(order.total_amount ?? 0);
      point.orders += 1;
    }

    const data = Array.from(buckets.values());

    return NextResponse.json<ApiResponse<RevenuePoint[]>>({ success: true, data });
  } catch (error) {
    console.error("Failed to load admin revenue", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "โหลดข้อมูลรายได้ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
