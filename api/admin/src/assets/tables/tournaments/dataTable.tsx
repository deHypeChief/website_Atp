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
import { Label } from "@/components/ui/label"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DataTablePagination } from "../components/pageination"
import { useState } from "react"
import "../../style/tables.css"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import api from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCloudinary } from '@/hooks/use-cloudinary'
import { useError } from "@/hooks/use-error"


interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function TourTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    // State Actions
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [file, setFile] = useState<File | null>(null);
    const queryClient = useQueryClient()
    const { uploadFile } = useCloudinary()
    const { error } = useError()


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

    // Step 1: Use useState to manage dialog open/close state
    const [isOpen, setIsOpen] = useState(false);

    // Step 2: Function to close the dialog
    const closeDialog = () => {
        setIsOpen(false);
    };

    // Zod Schema for Validation
    const FormSchema = z.object({
        name: z.string()
            .min(5, { message: "Tour title must be at least 5 characters long." })
            .max(100, { message: "Tour title cannot exceed 100 characters." }), // Added max length
        category: z.string()
            .min(1, { message: "Please select a category." }), // Ensures non-empty string
        location: z.string()
            .min(1, { message: "Please add a location." }), // Ensures non-empty string
        price: z.string()
            .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
                message: "Please enter a valid price greater than 0.",
            }),
        date: z.date({
            required_error: "Please add a date.",
        }).refine((date) => date >= new Date(), {
            message: "Date cannot be in the past.",
        }),
        time: z
            .string()
            .regex(
                /^(0?[1-9]|1[0-2]):[0-5][0-9](AM|PM) - (0?[1-9]|1[0-2]):[0-5][0-9](AM|PM)$/i,
                { message: "Please enter a valid time range in the format HH:MMAM - HH:MMPM." }
            ),
    });

    // Using the enhanced schema in useForm
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            category: "",
            location: "",
            price: "",
            date: new Date(), // Correctly set default as Date object
            time: "8:00AM - 10:00AM"
        },
    });


    const mutation = useMutation({
        mutationFn: handleFile,
        onSuccess: (data) => {
            closeDialog()
            queryClient.invalidateQueries({ queryKey: ['tour'] })
        }
    })

    // Handle file input separately from Zod form
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]); // Set the selected file
            console.log(e.target.files[0])
        }
    };

    async function handleFile(data: z.infer<typeof FormSchema>) {
        const imageUrl = await uploadFile(file)

        // Send tournament data to backend
        const tournamentData = {
            ...data,
            tournamentImgURL: imageUrl, // Cloudinary URL from the image upload
        };

        try {
            const response = await api.post('/tour/createTour', tournamentData);
            console.log(response)
        } catch (err) {
            error(err, "Error Uploading Tornament")
        }
    }



    return (
        <div className="data_tableGroup">
            {/* Table Action */}
            <div className="actionWrap flex items-center py-4 gap-[10px]">
                {/* Input Sort */}
                <Input
                    placeholder="Filter title..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />

                {/* Right Actions */}
                <div className="rightAction">
                    <DropdownMenu >
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

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => { form.reset() }}>Create Tournament</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>Create Tournament</DialogTitle>
                                <DialogDescription>
                                    Create new tournament here. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">

                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Tournament Title" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="fromWrapTour">
                                            <FormField
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a category" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="kids amatuer">Kids Amatuer</SelectItem>
                                                                <SelectItem value="kids mid-level">Kids Mid-level</SelectItem>
                                                                <SelectItem value="kids professional">Kids Professional</SelectItem>
                                                                <SelectItem value="adult amatuer">Adult Amatuer</SelectItem>
                                                                <SelectItem value="adult mid-level">Adult Mid-level</SelectItem>
                                                                <SelectItem value="adult professional">Adult Professional</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="price"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Price" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="fromWrapTour">
                                            <FormField
                                                control={form.control}
                                                name="time"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Time" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="date"
                                                render={({ field }) => (
                                                    <FormItem className="">
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "w-full pl-3 text-left font-normal",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {field.value ? (
                                                                            format(field.value, "PPP")
                                                                        ) : (
                                                                            <span>Pick a date</span>
                                                                        )}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value}
                                                                    onSelect={field.onChange}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Location" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormItem>
                                            <FormLabel>Upload Image</FormLabel>
                                            <Input type="file" onChange={handleFileChange} />
                                            <FormDescription>
                                                Upload an image for the tournament.
                                            </FormDescription>
                                        </FormItem>

                                        <div className="bttnWrap">
                                            <Button type="submit" disabled={mutation.isPending}>
                                                {
                                                    mutation.isPending ? "Uploading..." : "Create Tournament"
                                                }
                                            </Button>
                                            <DialogFooter className="sm:justify-start">
                                                <DialogClose asChild>
                                                    <Button type="button">Close</Button>
                                                </DialogClose>
                                            </DialogFooter>
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
