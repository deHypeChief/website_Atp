import { ColumnDef } from "@tanstack/react-table"

export type Users = {
    _id: string
    membership: {
        plan: string
    }
    training: {
        plan: string
    }
    user: {
        fullName: string
    }
}

export const columns: ColumnDef<Users>[] = [
    {
        accessorKey: "_id",
        header: "Id",
    },
    {
        id: "player",
        accessorKey: "user.fullName",
        header: "Player Name",
    },
    {
        id: "playerUser",
        accessorKey: "user.username",
        header: "Username",
    },
    {
        accessorKey: "membership.plan",
        header: "Membership Plan",
    },
    {
        accessorKey: "training.plan",
        header: "Training Plan",
    }
]
