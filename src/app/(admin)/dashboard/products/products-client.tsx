"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductFormModal } from "./product-form-modal"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import type { AdminProduct, CategoryOption } from "@/types/admin"
import type { ApiResponse } from "@/types/api"

const PAGE_SIZE = 10

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
})

export function ProductsClient() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const [inputVal, setInputVal] = useState("")
  const [search, setSearch] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  // debounce search input → search (300ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(inputVal)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [inputVal])

  // load categories once
  useEffect(() => {
    let ignore = false
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories")
        const json: ApiResponse<CategoryOption[]> = await res.json()
        if (!json.success) throw new Error(json.error)
        if (!ignore) setCategories(json.data)
      } catch {
        if (!ignore) toast.error("โหลดข้อมูลหมวดหมู่ไม่สำเร็จ")
      }
    }
    loadCategories()
    return () => {
      ignore = true
    }
  }, [])

  // load products on search / page / refresh change
  useEffect(() => {
    let ignore = false
    async function loadProducts() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page: String(page) })
        if (search) params.set("search", search)
        const res = await fetch(`/api/admin/products?${params.toString()}`)
        const json: ApiResponse<{ products: AdminProduct[]; total: number }> =
          await res.json()
        if (!json.success) throw new Error(json.error)
        if (!ignore) {
          setProducts(json.data.products)
          setTotal(json.data.total)
        }
      } catch {
        if (!ignore) toast.error("โหลดข้อมูลสินค้าไม่สำเร็จ")
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    loadProducts()
    return () => {
      ignore = true
    }
  }, [search, page, refreshKey])

  function handleAdd() {
    setEditProduct(null)
    setFormOpen(true)
  }

  function handleEdit(product: AdminProduct) {
    setEditProduct(product)
    setFormOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: "DELETE",
      })
      const json: ApiResponse<null> = await res.json()
      if (!json.success) {
        toast.error(json.error)
        return
      }
      toast.success("ลบสินค้าสำเร็จ")
      setDeleteTarget(null)
      setRefreshKey((key) => key + 1)
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="pl-8"
          />
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon />
          เพิ่มสินค้า
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>ราคา</TableHead>
              <TableHead className="w-24 text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  ไม่พบสินค้า
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.categoryName}
                  </TableCell>
                  <TableCell>{currencyFormatter.format(product.price)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(product)}
                      >
                        <PencilIcon />
                        <span className="sr-only">แก้ไข</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(product)}
                      >
                        <Trash2Icon />
                        <span className="sr-only">ลบ</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          ทั้งหมด {total} รายการ
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeftIcon />
            <span className="sr-only">ก่อนหน้า</span>
          </Button>
          <span className="text-sm">
            หน้า {page} จาก {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            <ChevronRightIcon />
            <span className="sr-only">ถัดไป</span>
          </Button>
        </div>
      </div>

      <ProductFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editProduct}
        categories={categories}
        onSaved={() => setRefreshKey((key) => key + 1)}
      />

      <DeleteConfirmDialog
        product={deleteTarget}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
