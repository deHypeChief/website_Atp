import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../components/tableHeader"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { delTour } from "@/apis/endpoints"
import { useQueryClient } from "@tanstack/react-query"



export type Tour = {
	_id: string
	name: string
	category: string
	location: string
	date: string
	tournamentImgURL: string
	price: string
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
		cell: ({ row }) => <>{row.original.date.split("T")[0]}</>
	},
	{
		accessorKey: "price",
		header: "Tour Price"
	},
	{
		accessorKey: "actionDel",
		header: "Action",
		cell: ({ row }) => {
			return (
				<DelTourComponent row={row} />
			)
		}
	}
]


function DelTourComponent({ row }) {
	const queryClient = useQueryClient()

	return (
		<>
			<Button onClick={async () => {
				toast({
					variant: "default",
					title: "Deleting Tournament ....",
				})
				try {
					await delTour(row.original._id)
					queryClient.invalidateQueries(['tour'])
					toast({
						variant: "default",
						title: "Tournament deleted",
					})
				} catch (err) {
					// console.log(err)
					toast({
						variant: "destructive",
						title: "Error deleting Tournament",
						description: err?.data?.message
					})
				}
			}}>Delete</Button>
		</>
	)
}