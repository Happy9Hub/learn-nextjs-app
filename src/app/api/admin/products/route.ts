import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import type { ApiResponse } from "@/types/api";
import type { AdminProduct } from "@/types/admin";

const PAGE_SIZE = 10;

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

// GET /api/admin/products?search=&page=
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const search = request.nextUrl.searchParams.get("search")?.trim() || undefined;
    const pageParam = Number(request.nextUrl.searchParams.get("page"));
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

    const where = search ? { name: { contains: search } } : {};

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        include: { categories: { select: { id: true, name: true } } },
        orderBy: { id: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.products.count({ where }),
    ]);

    return NextResponse.json<ApiResponse<{ products: AdminProduct[]; total: number }>>({
      success: true,
      data: { products: products.map(serialize), total },
    });
  } catch (error) {
    console.error("Failed to load products", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "โหลดข้อมูลสินค้าไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
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

    const product = await prisma.products.create({
      data: {
        name,
        description: description || null,
        price,
        category_id: Number(categoryId),
      },
      include: { categories: { select: { id: true, name: true } } },
    });

    return NextResponse.json<ApiResponse<AdminProduct>>(
      { success: true, data: serialize(product) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create product", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "เพิ่มสินค้าไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
