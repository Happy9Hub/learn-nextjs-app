"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import {
  WalletIcon,
  ShoppingCartIcon,
  ClockIcon,
  PackageIcon,
  UsersIcon,
  RefreshCwIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { KpiCard, KpiCardSkeleton } from "@/components/admin/kpi-card"
import { PeriodSelector } from "@/components/admin/period-selector"
import { RecentOrdersTable } from "@/components/admin/recent-orders-table"
import type {
  AdminOrderItem,
  AdminStats,
  Period,
  RevenuePoint,
} from "@/types/admin"
import type { ApiResponse } from "@/types/api"

const RevenueChart = dynamic(
  () => import("@/components/admin/revenue-chart").then((mod) => mod.RevenueChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
)

const REFRESH_INTERVAL_MS = 30_000

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
})
const numberFormatter = new Intl.NumberFormat("th-TH")

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCwIcon />
        ลองใหม่
      </Button>
    </div>
  )
}

export function DashboardClient() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  const [orders, setOrders] = useState<AdminOrderItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  // Bumped by the 30s interval and by the stats/orders retry buttons —
  // drives both the stats and orders effects below so they refetch together.
  const [statsOrdersTick, setStatsOrdersTick] = useState(0)

  const [revenue, setRevenue] = useState<RevenuePoint[]>([])
  const [revenueLoading, setRevenueLoading] = useState(true)
  const [revenueError, setRevenueError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>("30d")
  const [revenueRetryKey, setRevenueRetryKey] = useState(0)

  useEffect(() => {
    let ignore = false
    async function loadStats() {
      setStatsLoading(true)
      setStatsError(null)
      try {
        const res = await fetch("/api/admin/stats")
        const json: ApiResponse<AdminStats> = await res.json()
        if (!json.success) throw new Error(json.error)
        if (!ignore) setStats(json.data)
      } catch {
        if (!ignore) setStatsError("โหลดข้อมูลสถิติไม่สำเร็จ")
      } finally {
        if (!ignore) setStatsLoading(false)
      }
    }
    loadStats()
    return () => {
      ignore = true
    }
  }, [statsOrdersTick])

  useEffect(() => {
    let ignore = false
    async function loadOrders() {
      setOrdersLoading(true)
      setOrdersError(null)
      try {
        const res = await fetch("/api/admin/orders?limit=5")
        const json: ApiResponse<{ orders: AdminOrderItem[]; total: number }> =
          await res.json()
        if (!json.success) throw new Error(json.error)
        if (!ignore) setOrders(json.data.orders)
      } catch {
        if (!ignore) setOrdersError("โหลดข้อมูลออเดอร์ไม่สำเร็จ")
      } finally {
        if (!ignore) setOrdersLoading(false)
      }
    }
    loadOrders()
    return () => {
      ignore = true
    }
  }, [statsOrdersTick])

  useEffect(() => {
    let ignore = false
    async function loadRevenue() {
      setRevenueLoading(true)
      setRevenueError(null)
      try {
        const res = await fetch(`/api/admin/revenue?period=${period}`)
        const json: ApiResponse<RevenuePoint[]> = await res.json()
        if (!json.success) throw new Error(json.error)
        if (!ignore) setRevenue(json.data)
      } catch {
        if (!ignore) setRevenueError("โหลดข้อมูลรายได้ไม่สำเร็จ")
      } finally {
        if (!ignore) setRevenueLoading(false)
      }
    }
    loadRevenue()
    return () => {
      ignore = true
    }
  }, [period, revenueRetryKey])

  useEffect(() => {
    const id = setInterval(() => {
      setStatsOrdersTick((tick) => tick + 1)
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 lg:px-6">
        {statsError ? (
          <ErrorState
            message={statsError}
            onRetry={() => setStatsOrdersTick((tick) => tick + 1)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-5 dark:*:data-[slot=card]:bg-card">
            {statsLoading || !stats ? (
              Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)
            ) : (
              <>
                <KpiCard
                  label="ยอดขายวันนี้"
                  value={currencyFormatter.format(stats.todaySales)}
                  icon={<WalletIcon className="size-4 text-muted-foreground" />}
                />
                <KpiCard
                  label="ออเดอร์วันนี้"
                  value={numberFormatter.format(stats.todayOrders)}
                  icon={<ShoppingCartIcon className="size-4 text-muted-foreground" />}
                />
                <KpiCard
                  label="ออเดอร์ที่รอดำเนินการ"
                  value={numberFormatter.format(stats.pendingOrders)}
                  icon={<ClockIcon className="size-4 text-muted-foreground" />}
                />
                <KpiCard
                  label="สินค้าทั้งหมด"
                  value={numberFormatter.format(stats.totalProducts)}
                  icon={<PackageIcon className="size-4 text-muted-foreground" />}
                />
                <KpiCard
                  label="ผู้ใช้ทั้งหมด"
                  value={numberFormatter.format(stats.totalUsers)}
                  icon={<UsersIcon className="size-4 text-muted-foreground" />}
                />
              </>
            )}
          </div>
        )}
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>รายได้</CardTitle>
            <PeriodSelector value={period} onChange={setPeriod} />
          </CardHeader>
          <CardContent>
            {revenueError ? (
              <ErrorState
                message={revenueError}
                onRetry={() => setRevenueRetryKey((key) => key + 1)}
              />
            ) : revenueLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <RevenueChart data={revenue} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>ออเดอร์ล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersError ? (
              <ErrorState
                message={ordersError}
                onRetry={() => setStatsOrdersTick((tick) => tick + 1)}
              />
            ) : ordersLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <RecentOrdersTable orders={orders} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
