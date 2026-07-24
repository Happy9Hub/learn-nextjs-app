import { Suspense } from "react"
import { connection } from "next/server"
import { prisma } from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircleIcon, CircleIcon } from "lucide-react"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

async function UsersTable() {
  await connection()
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  if (users.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
        No users found.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Verified</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage src={user.image ?? undefined} alt={user.name} />
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === "admin" ? "default" : "outline"}>
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              {user.emailVerified ? (
                <Badge variant="outline" className="text-muted-foreground">
                  <CheckCircleIcon className="fill-green-500 dark:fill-green-400" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <CircleIcon />
                  Unverified
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {user.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function UsersTableSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

export default function UsersPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          All registered users.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Suspense fallback={<UsersTableSkeleton />}>
          <UsersTable />
        </Suspense>
      </div>
    </div>
  )
}
