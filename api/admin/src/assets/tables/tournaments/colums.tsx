import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../components/tableHeader"

export type Tour = {
  name: string
  category: string
  location: string
  date: string
  tournamentImgURL: string
  price:string
}

export const columns: ColumnDef<Tour>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tour Title" />
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "date",
    header: "Tour Date",
    cell: ({row})=><>{row.original.date.split("T")[0]}</>
  },
  {
    accessorKey: "price",
    header: "Tour Price"
  }
]
