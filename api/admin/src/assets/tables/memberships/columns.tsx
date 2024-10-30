import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../components/tableHeader"

export type Memebership = {
    fullName: string
    email: string
    assignedCoach: string
    membership: string
}

export const columns: ColumnDef<Memebership>[] = [
    {
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
    },
    {
        accessorKey: "fullName",
        header: "Full Name",
    },
    {
        accessorKey: "assignedCoach",
        header: "Location",
    },
    {
        accessorKey: "membership",
        header: "Membership"
    }
]
