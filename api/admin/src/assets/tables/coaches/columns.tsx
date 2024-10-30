import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../components/tableHeader"

export type Coaches = {
	coachName: string;
	email: string;
	imageUrl: string;
	avgRate: number;
	comment: [];
}

export const columns: ColumnDef<Coaches>[] = [
	{
		accessorKey: "imageUrl",
		header: "Profile",
		size: 80,
		cell: ({ row }) => {
			const user = row.original
			return (
				<>
					<div className="proBoxImg">
						<img src={user.imageUrl} alt="" />
					</div>
				</>
			)
		}
	},
	{
		accessorKey: "coachName",
		header: "Coach Name"
	},
	{
		accessorKey: "email",
		header: "Email"
	},
	{
		accessorKey: "level",
		header: "Coach Level"
	},
	{
		accessorKey: "avgRate",
		header: "Rating",
		cell: ({ row }) => {
			const user = row.original
			return (
				<>
					{user.avgRate}
				</>
			)
		}
	},
	{
		accessorKey: "comment",
		header: "Comment Count",
		cell: ({ row }) => {
			const user = row.original
			return (
				<>
					{user.comment.length}
				</>
			)
		}
	}
]
