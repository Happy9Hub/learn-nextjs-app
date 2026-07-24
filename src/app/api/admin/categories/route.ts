import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types/api";
import type { CategoryOption } from "@/types/admin";

// GET /api/admin/categories
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const categories = await prisma.categories.findMany({
      orderBy: { name: "asc" },
    });

    const data: CategoryOption[] = categories.map((category) => ({
      id: category.id,
      name: category.name ?? "",
    }));

    return NextResponse.json<ApiResponse<CategoryOption[]>>({ success: true, data });
  } catch (error) {
    console.error("Failed to load categories", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "โหลดข้อมูลหมวดหมู่ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
