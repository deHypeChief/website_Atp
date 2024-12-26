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
import { FormLabel } from "@/components/ui/form"

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
            <DialogContent className="sm:max-w-[375px]">
              <DialogHeader>
                <DialogTitle>{user.fullName}</DialogTitle>
                <DialogDescription>
                  An overview of {user.fullName.split(" ")[0]}'s profile
                </DialogDescription>
              </DialogHeader>

              <div className="profileContent">
                <div className="userImage" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}>
                  {
                    user.picture !== "" ? <img src={user.picture} alt="user" /> : <h2 style={{
                      fontSize: "3rem",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}>{user.fullName.split("")[0]}</h2>
                  }
                </div>

                <div className="profileContentList">
                  <div className="spacWrap">
                    <div className="proInfo">
                      <p className="pLabel">Email</p>
                      <p>{user.email}</p>
                    </div>
                    <div className="proInfo">
                      <p className="pLabel">Username</p>
                      <p>{user.username}</p>
                    </div>
                  </div>
                  <div className="proInfo">
                    <p className="pLabel">Phone Number</p>
                    <p>{user.phoneNumber}</p>
                  </div>
                  <div className="proInfo">
                    <p className="pLabel">Level</p>
                    <p>{user.level}</p>
                  </div>
                </div>
              </div>

            </DialogContent>
          </Dialog>
        </div>
      )
    },
  },
]
