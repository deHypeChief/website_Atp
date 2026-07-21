import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../components/tableHeader"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AtSign, CreditCard, Mail, Phone, Trophy, UserRound } from "lucide-react"
import type { ReactNode } from "react"

export type Users = {
  _id: string
  email: string
  username: string
  level: string
  phoneNumber: string
  membership: string
  fullName: string
  picture: string
}

export const columns: ColumnDef<Users>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "level",
    header: "Level",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "membership",
    header: "Membership",
    cell: ({ row }) => {
      const user = row.original
      return (
        <>
          {
            user.membership == "" ? "--" : user.membership
          }
        </>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className="dropRight float-right">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">
                View Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="overflow-hidden p-0 sm:max-w-[560px]">
              <DialogHeader className="relative bg-[#0b3353] px-7 pb-7 pt-8 text-left text-white">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[#8bd000]" />
                <div className="flex items-center gap-5">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white/15 bg-[#7895ad] text-3xl font-black uppercase shadow-lg">
                    {user.picture ? <img src={user.picture} alt={`${user.fullName || user.username} profile`} className="h-full w-full object-cover" /> : (user.fullName || user.username || "A").charAt(0)}
                  </div>
                  <div className="min-w-0 pr-6">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#8bd000] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.14em] text-[#0b3353]">ATP player</span>
                      <span className="rounded-full border border-white/25 px-2.5 py-1 text-[10px] font-bold capitalize tracking-wide">{user.membership || "Free membership"}</span>
                    </div>
                    <DialogTitle className="truncate text-2xl font-bold text-white">{user.fullName || user.username}</DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-white/65">Member profile and account information</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-7">
                <div className="mb-5 flex items-center justify-between border-b pb-4">
                  <div><p className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Playing level</p><p className="mt-1 text-lg font-bold capitalize">{user.level || "Not specified"}</p></div>
                  <Trophy className="h-9 w-9 text-[#8bd000]" strokeWidth={1.6} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ProfileField icon={<Mail />} label="Email address" value={user.email || "Not provided"} />
                  <ProfileField icon={<AtSign />} label="Username" value={user.username ? `@${user.username}` : "Not provided"} />
                  <ProfileField icon={<Phone />} label="Phone number" value={user.phoneNumber || "Not provided"} />
                  <ProfileField icon={<CreditCard />} label="Membership" value={user.membership || "Free"} capitalize />
                </div>
                <div className="mt-5 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground"><UserRound className="h-4 w-4"/><span>Account ID</span><code className="ml-auto rounded bg-muted px-2 py-1 font-mono">{user._id.slice(-8).toUpperCase()}</code></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )
    },
  },
]

function ProfileField({ icon, label, value, capitalize = false }: { icon: ReactNode, label: string, value: string, capitalize?: boolean }) {
  return <div className="flex min-w-0 items-start gap-3 rounded-lg border bg-muted/25 p-3.5">
    <span className="mt-0.5 text-[#2d719f] [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
    <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-muted-foreground">{label}</p><p className={`mt-1 break-words text-sm font-semibold ${capitalize ? "capitalize" : ""}`}>{value}</p></div>
  </div>
}
