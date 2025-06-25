import { ColumnDef } from "@tanstack/react-table"

export type Users = {
    _id: string
    playerId: {
        fullName: string
    }
    coachId: {
        coachName: string
        level: string
        imageUrl: string
    }
}

export const columns: ColumnDef<Users>[] = [
    {
        accessorKey: "coachId.imageUrl",
        header: "Coach Profile",
        size: 80,
		cell: ({ row }) => {
			const user = row.original
			return (
				<>
					<div className="proBoxImg">
						<img src={user.coachId.imageUrl} alt="" />
					</div>
				</>
			)
		}
    },
    {
        accessorKey: "_id",
        header: "Id",
    },
    {
        accessorKey: "coachId.coachName",
        header: "Coach Name",
    },
    {
        accessorKey: "coachId.level",
        header: "Coach Level",
    },
    {
        id: "player",
        accessorKey: "playerId.fullName",
        header: "Player Name",
    },
]
