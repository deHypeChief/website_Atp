import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../components/tableHeader"
import { Badge } from "@/components/ui/badge"

export type Tour = {
	flutterPaymentId: string
	tournament: {
		name: string
	}
	user: {
		fullName: string
	}
	tourTitle: string
	tourCheck: string
	paid: string
	medal: string
	token: string
}

export const columns: ColumnDef<Tour>[] = [
	{
		id: 'tourTitle',
		accessorFn: row => row.tournament.name,
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Tour Title" />
		),
		cell: ({ row }) => (
			<>{row.original.tournament.name}</>
		)
	},
	{
		accessorKey: "user",
		header: "Full Name",
		cell: ({ row }) => (
			<>{row.original.user.fullName}</>
		)
	},
	{
		accessorKey: "tourCheck",
		header: () => (
			<div className="checkP">
				<div className="tourHeader">
					Ticket Checked
				</div>
			</div>
		),
		cell: ({ row }) => (
			<div className="checkP">
				<div className="pill">
					<Badge variant={row.original.tourCheck ? "default" : "destructive"}>
						{String(row.original.tourCheck)}
					</Badge>
				</div>
			</div>
		)
	},
	{
		accessorKey: "token",
		header: "Ticket Token",
		cell: ({ row }) => (
			<>{row.original.token}</>
		)
	},
	{
		accessorKey: "medal",
		header: "Match Status",
		cell: ({ row }) => (
			<>{row.original.medal}</>
		)
	},
	{
		header: "Action",
		cell: ({ row }) => (
			<>{row.original.token}</>
		)
	}
]
