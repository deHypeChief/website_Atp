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
    FilterFn,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { DataTablePagination } from "../components/pageination"
import { useState } from "react"
import "../../style/tables.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import api from "@/lib/axios"
import { getUsers } from "@/apis/endpoints"
import { useQuery } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query";


interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}



export function CustomMatchesTab<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const { toast } = useToast()
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [sorting, setSorting] = useState<SortingState>([])

    const users = useQuery({ queryKey: ['user'], queryFn: getUsers })


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

    const [open, setOpen] = useState(false);
    const [matchType, setMatchType] = useState<"1v1" | "2v2">("1v1");
    const [status, setStatus] = useState("completed");
    const [participants, setParticipants] = useState([
        { userId: "", winner: false, score: undefined as number | undefined }
    ]);
    const [selectedMatch, setSelectedMatch] = useState<TData | null>(null)
    const [viewOpen, setViewOpen] = useState(false)



    const handleParticipantChange = (index: number, key: "userId" | "winner" | "score", value: any) => {
        const updated = [...participants];
        updated[index][key] = value;
        setParticipants(updated);
    };

    const addParticipant = () => {
        if (participants.length < (matchType === "1v1" ? 2 : 4)) {
            setParticipants([...participants, { userId: "", winner: false, score: undefined }]);
        }
    };

    const removeParticipant = (index: number) => {
        setParticipants(participants.filter((_, i) => i !== index));
    };

    const queryClient = useQueryClient();
    const handleSubmit = async () => {
        try {
            const res = await api.post("/matchCustom/create", { status, matchType, participants })
            console.log(res.data)

            setOpen(false);
            setParticipants([{
                userId: "",
                winner: false,
                score: 0
            }]);
            console.log({ status, matchType, participants })
            queryClient.invalidateQueries({ queryKey: ['customMatches'] });
            toast({
                variant: "default",
                title: "match saved",
            });
        } catch (err: any) {
            console.error("Error creating custom match:", err);
            toast({
                variant: "destructive",
                title: "Error Creating Custom Match",
                description: err.response.data.error ? err.response.data.error : err.message,
            });
        }
    };

    //  toast({
    //             variant: "destructive",
    //             title: "Error Creating Custom Match",
    //             description: err.response.data.message ? err.response.data.message : err.message,
    //         });

    //  toast({
    //             variant: "default",
    //             title: "match saved",
    //         });
    return (
        <div className="data_tableGroup">
            {/* Table Action */}
            <div className="actionWrap flex items-center py-4 gap-[15px]">
                {/* Input Sort */}
                <Input
                    placeholder="Filter player name..."
                    value={(table.getColumn("winners")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("winners")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="default">+ New Match</Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-md max-h-[90vh] p-8 overflow-hidden">
                        <DialogHeader>
                            <DialogTitle>Create Custom Match</DialogTitle>
                        </DialogHeader>

                        {/* Scrollable Body */}
                        <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
                            {/* Match Type */}
                            <Select
                                value={matchType}
                                onValueChange={(val) => {
                                    setMatchType(val as any);
                                    setParticipants([{ userId: "", winner: false, score: undefined }]);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select match type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1v1">1v1</SelectItem>
                                    <SelectItem value="2v2">2v2</SelectItem>
                                </SelectContent>
                            </Select>

                            <p className="mt-2 mb-2 font-semibold">Participants</p>

                            {/* Participants */}
                            <div className="space-y-3">
                                {participants.map((p, index) => (
                                    <div key={index} className="space-y-3 gap-2">
                                        <Select
                                            value={p.userId}
                                            onValueChange={(val) => handleParticipantChange(index, "userId", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={`Select player ${index + 1}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.data?.map((user) => (
                                                    <SelectItem
                                                        key={user._id}
                                                        value={user._id}
                                                        disabled={participants.some((pt, i) => pt.userId === user._id && i !== index)}
                                                    >
                                                        {user.username}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="flex items-center justify-between space-x-2">
                                            <div className="flex items-center space-x-7">
                                                <Input
                                                    placeholder="Score"
                                                    type="number"
                                                    value={p.score ?? ""}
                                                    onChange={(e) => handleParticipantChange(index, "score", parseInt(e.target.value))}
                                                    className="w-20"
                                                />

                                                <div className="flex items-center space-x-1">
                                                    <label className="text-sm">Winner</label>
                                                    <Switch
                                                        checked={p.winner}
                                                        onCheckedChange={(val) => handleParticipantChange(index, "winner", val)}
                                                    />
                                                </div>
                                            </div>

                                            {participants.length > 1 && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => removeParticipant(index)}
                                                >
                                                    ❌
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {participants.length < (matchType === "1v1" ? 2 : 4) && (
                                    <Button variant="outline" onClick={addParticipant}>
                                        + Add Participant
                                    </Button>
                                )}
                            </div>

                            <Button className="w-full mt-4" onClick={handleSubmit}>
                                Submit
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

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
                                    className="cursor-pointer hover:bg-muted"
                                    onClick={() => {
                                        setSelectedMatch(row.original)
                                        setViewOpen(true)
                                    }}
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
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="max-w-lg p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">📝 Match Details</DialogTitle>
                    </DialogHeader>

                    {selectedMatch && (
                        <div className="space-y-5 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-muted-foreground">Match ID</span>
                                    <p className="font-mono text-xs text-primary">{(selectedMatch as any).matchId}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Match Type</span>
                                    <p className="capitalize font-medium">{(selectedMatch as any).matchType}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Status</span>
                                    <p className="capitalize font-semibold">
                                        {(selectedMatch as any).status === "completed" && "✅ Completed"}
                                        {(selectedMatch as any).status === "active" && "🔥 Active"}
                                        {(selectedMatch as any).status === "draft" && "📝 Draft"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Participants</span>
                                    <p className="font-medium">{(selectedMatch as any).totalParticipants}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Created At</span>
                                    <p>{new Date((selectedMatch as any).createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Winners</span>
                                    <p className="text-green-600 font-semibold">
                                        {(selectedMatch as any).winners.length
                                            ? (selectedMatch as any).winners.join(", ")
                                            : "None"}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-base mb-2">👥 Participants</h4>
                                <ul className="space-y-2">
                                    {(selectedMatch as any).participants.map((p: any, i: number) => (
                                        <li key={i} className="flex items-center justify-between px-3 py-2 rounded bg-muted/50">
                                            <span className="font-medium text-primary">{p.username}</span>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span>🎯 {p.score ?? "N/A"}</span>
                                                {p.winner && <span className="text-yellow-500 font-bold">🏆</span>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="tableBase">
                <DataTablePagination table={table} />
            </div>
        </div>
    )
}