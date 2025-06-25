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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"
import { getCoaches, getPaidUsers } from "@/apis/endpoints"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}



export function CoachTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    // State Actions
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [sorting, setSorting] = useState<SortingState>([])
    // const [file, setFile] = useState<File | null>(null);
    // const [loading, setLoading] = useState(false)


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
    const { toast } = useToast()
    const [open, setOpen] = useState(false);


    const FormSchema = z.object({
        player: z.string().min(5, { message: "Please selete a player" }),
        coach: z.string().min(5, { message: "Please selete a coach" })
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            player: "",
            coach: ""
        },
    });

    const parringData = useQuery({
        queryKey: ["pairCoach"],
        queryFn: async () => {
            const coaches = await getCoaches();
            const subUsers = await getPaidUsers();
            return {
                coaches,
                subUsers
            }
        },
    });
    const assignCoach = useMutation({
        mutationFn: async ({ player, coach }: { player?: string; coach?: string; }) => {
            const res = await api.get(`/assigncoach/${player}/${coach}`);
            console.log(res)
            return res.data;
        },
        onSuccess: () => {
            toast({
                variant: "default",
                title: "Coach paring completed",
            })
            setOpen(false);
        },
        onError: (err: unknown) => {
            console.error("Assignment failed:", err);
            toast({
                variant: "destructive",
                title: "Error during Coach Assigment",
                description: err.response.data.message ? err.response.data.message : err.message,
            })
        }
    });

    function submitForm(data: { player?: string; coach?: string; }) {
        assignCoach.mutate(data);
    }


    return (
        <div className="data_tableGroup">
            {/* Table Action */}
            <div className="actionWrap flex items-center py-4 gap-[15px]">
                {/* Input Sort */}
                <Input
                    placeholder="Filter name..."
                    value={(table.getColumn("coachName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => {
                        console.log(table.getColumn("coachName"))
                        table.getColumn("coachName")?.setFilterValue(event.target.value)
                    }
                    }
                    className="max-w-sm"
                />

                {/* Right Actions */}
                <div className="rightAction">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default">
                                Assign Coaches
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[375px]">
                            <DialogHeader>
                                <DialogTitle>Link Players to their coaches</DialogTitle>
                                <DialogDescription>
                                    Players on a training plan will be shown here.
                                </DialogDescription>
                            </DialogHeader>

                            <Form {...form}>
                                <form className="space-y-4" onSubmit={form.handleSubmit(submitForm)}>
                                    <FormField
                                        control={form.control}
                                        name="player"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a Player" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {
                                                            parringData?.data?.subUsers?.payments?.map((item) => {
                                                                return (
                                                                    <SelectItem key={item.user._id} value={item.user._id}>{item.user.fullName}</SelectItem>
                                                                )
                                                            })
                                                        }
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="coach"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a Coach" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {
                                                            parringData?.data?.coaches?.map((item) => {
                                                                return (
                                                                    <SelectItem key={item._id} value={item._id}>{item.coachName}</SelectItem>
                                                                )
                                                            })
                                                        }
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit">Assign</Button>
                                    </DialogFooter>
                                </form>
                            </Form>

                        </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
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
