"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
    VisibilityState,
    SortingState,
    getSortedRowModel,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DataTablePagination } from "../components/pageination"
import { useState } from "react"
import "../../style/tables.css"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createLeaders } from "@/apis/endpoints"
import { toast } from "@/hooks/use-toast"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}



export function MatchTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    // State Actions
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [sorting, setSorting] = useState<SortingState>([])
    const queryClient = useQueryClient()

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            columnFilters,
            columnVisibility,
            rowSelection,
            sorting,
        },
    })


    const { mutate, isPending } = useMutation({
		mutationFn: (data) => createLeaders(data),
		onSuccess: (data) => {
			console.log(data)
			toast({
				variant: "default",
				title: "Winners Created Valid",
				description: data.message,
			})
			queryClient.invalidateQueries({ queryKey: ['winners'] })
		},
		onError: (err) => {
			console.error(err)
			toast({
				variant: "destructive",
				title: "Winners Assigment Error",
				description: err.response.data.message,
			})
		}
	})
    const FormSchema = z.object({
        goldToken: z.string().min(6, {
			message: "The token for gold is needed",
		}),
        silverToken: z.string().min(6, {
			message: "The token for gold is needed",
		}),
        bronzeToken: z.string().min(6, {
			message: "The token for gold is needed",
		}),
    })
    const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema)
	})


    return (
        <div className="data_tableGroup">
            {/* Table Action */}
            <div className="actionWrap flex items-center py-4 gap-[15px]">
                {/* Input Sort */}
                <Input
                    placeholder="Filter title..."
                    value={(table.getColumn("tourTitle")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>{
                        console.log(table.getColumn("tourTitle"))
                        table.getColumn("tourTitle")?.setFilterValue(event.target.value)}
                    }
                    className="max-w-sm"
                />

                {/* Right Actions */}
                <div className="rightAction">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto hidden_sm">
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) => column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Assign Winners</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>Create Winners</DialogTitle>
                                <DialogDescription>
                                    Assing various winners for each tournament
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(mutate)} className="space-y-4">

                                        <FormField
                                            control={form.control}
                                            name="goldToken"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Gold Token" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="silverToken"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Silver Token" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="bronzeToken"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Bronze Token" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="bttnWrap">
                                            <Button type="submit" disabled={isPending}>
                                                {
                                                    isPending ? "Creating Winners..." : "Done"
                                                }
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Table Main */}
            <div className="rounded-md border mb-4">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Table Pagination */}
            <div className="tableBase">
                <DataTablePagination table={table} />
            </div>
        </div>
    )
}
