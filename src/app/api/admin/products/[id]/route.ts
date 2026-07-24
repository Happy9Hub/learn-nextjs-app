import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import type { ApiResponse } from "@/types/api";
import type { AdminProduct } from "@/types/admin";

function serialize(product: {
  id: number;
  name: string | null;
  description: string | null;
  price: unknown;
  category_id: number | null;
  categories: { id: number; name: string | null } | null;
}): AdminProduct {
  return {
    id: product.id,
    name: product.name ?? "",
    description: product.description,
    price: Number(product.price ?? 0),
    categoryId: product.category_id ?? 0,
    categoryName: product.categories?.name ?? "ไม่มีหมวดหมู่",
  };
}

// PUT /api/admin/products/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "รหัสสินค้าไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: message },
        { status: 400 }
      );
    }

    const { name, description, price, categoryId } = parsed.data;

    const product = await prisma.products.update({
      where: { id: productId },
      data: {
        name,
        description: description || null,
        price,
        category_id: Number(categoryId),
      },
      include: { categories: { select: { id: true, name: true } } },
    });

    return NextResponse.json<ApiResponse<AdminProduct>>({
      success: true,
      data: serialize(product),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "ไม่พบสินค้านี้" },
        { status: 404 }
      );
    }
    console.error("Failed to update product", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "แก้ไขสินค้าไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "รหัสสินค้าไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  try {
    const orderItemCount = await prisma.order_items.count({
      where: { product_id: productId },
    });
    if (orderItemCount > 0) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: `ไม่สามารถลบสินค้านี้ได้ เนื่องจากมีคำสั่งซื้อที่เกี่ยวข้อง ${orderItemCount} รายการ`,
        },
        { status: 409 }
      );
    }

    await prisma.products.delete({ where: { id: productId } });

    return NextResponse.json<ApiResponse<null>>({ success: true, data: null });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "ไม่พบสินค้านี้" },
        { status: 404 }
      );
    }
    console.error("Failed to delete product", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "ลบสินค้าไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
