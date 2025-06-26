import { ColumnDef, FilterFn } from "@tanstack/react-table"
import { format } from "date-fns"

interface Match {
    matchId: string;
    matchType: "1v1" | "2v2";
    totalParticipants: number;
    winners: string[]; // array of userIds or names
    createdAt: string | Date;
}

const arrayIncludesText: FilterFn<any> = (row, columnId, filterValue) => {
    const values = row.getValue(columnId) as string[] | undefined;
    if (!values || !Array.isArray(values)) return false;

    return values.some((val) =>
        val.toLowerCase().includes((filterValue as string).toLowerCase())
    );
};
export const columns: ColumnDef<Match>[] = [
    {
        accessorKey: "matchId",
        header: "Match ID",
    },
    {
        accessorKey: "matchType",
        header: "Match Type",
    },
    {
        accessorKey: "totalParticipants",
        header: "Total Participants",
    },
    {
        id: "winners",
        accessorKey: "winners",
        header: "Winners",
        filterFn: arrayIncludesText,
        cell: ({ row }) => {
            const winners = row?.original?.winners;
            return winners && winners.length
                ? winners.join(", ")
                : "None";
        }
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
            const date = new Date(row?.original?.createdAt);
            return format(date, "dd MMM yyyy, HH:mm");
        }
    }
]