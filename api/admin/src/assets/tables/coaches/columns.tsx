import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../components/tableHeader"
import { Button } from "@/components/ui/button";
import { deleteCoach, getCoaches } from "@/apis/endpoints";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCloudinary } from "@/hooks/use-cloudinary";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export type Coaches = {
	_id: string;
	coachName: string;
	email: string;
	imageUrl: string;
	avgRate: number;
	bioInfo: string;
	level: string;
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
	},
	{
		// accessorKey: "action",
		header: "Action",
		cell: ({ row }) => {
			const user = row.original
			const [file, setFile] = useState<File | null>(null);
			const { toast } = useToast()
			const { uploadFile } = useCloudinary()

			const queryClient = useQueryClient()
			const { data } = useQuery({
				queryFn: getCoaches,
				queryKey: ["coaches"]
			})
			const { mutate, isPending } = useMutation({
				mutationFn: handleFile,
				onSuccess: () => {
					toast({
						variant: "default",
						title: "Coach Updated",
					})
					queryClient.invalidateQueries({ queryKey: ['coaches'] })
				},
				onError: (err) => {
					console.error(err)
					toast({
						variant: "destructive",
						title: "Error Updating Coach",
						description: err.response.data.message ? err.response.data.message : err.message,
					})
				}
			})

			const FormSchema = z.object({
				coachName: z
					.string()
					.min(2, { message: "Name should be at least 2 characters long" })
					.max(50, { message: "Name should not exceed 50 characters" })
					.nonempty({ message: "A name is needed" }),
				email: z
					.string()
					.email({ message: "Please enter a valid email address" })
					.nonempty({ message: "Add an email" }),
				bioInfo: z
					.string()
					.min(6, { message: "Profile info should be at least 6 characters" })
					.max(500, { message: "Profile info should not exceed 500 characters" })
					.nonempty({ message: "Talk about the coach" }),
				price: z
					.string()
					.optional(),
				level: z
					.enum(["kids", "regular", "amateur", "professional"], {
						required_error: "The coach level is needed",
						invalid_type_error: "Please select a valid level",
					}),
			});
			const form = useForm<z.infer<typeof FormSchema>>({
				resolver: zodResolver(FormSchema),
				defaultValues: {
					coachName: user.coachName,
					email: user.email,
					bioInfo: user.bioInfo,
					level: user.level,
				},
			})
			const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
				if (e.target.files && e.target.files[0]) {
					setFile(e.target.files[0]); // Set the selected file
					console.log(e.target.files[0])
				}
			};
			async function handleFile(data: z.infer<typeof FormSchema>) {
				const imageUrl = await uploadFile(file)
				console.log(imageUrl)

				const coachData = {
					...data,
					imageUrl: imageUrl || "",
				};
				window.location.reload()

				const response = await api.post(`/coach/updateCoach/${user._id}`, coachData)
				console.log(response)
				form.reset()
				setFile(null)
			}
			return (
				<>
					<div className="coachAction">
						<Dialog>
							<DialogTrigger asChild>
								<div className="coachActions" onClick={() => {
									form.reset()
									setFile(null)
								}}>
									<svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24">
										<path fill="#fff" d="M18.925 3.137a3.027 3.027 0 0 0-4.283.001l-9.507 9.52a3.03 3.03 0 0 0-.885 2.139V18c0 .414.336.75.75.75h3.223c.803 0 1.573-.32 2.14-.887l9.5-9.506a3.03 3.03 0 0 0 0-4.28zM4 20.25a.75.75 0 0 0 0 1.5h16a.75.75 0 0 0 0-1.5z"></path>
									</svg>
								</div>
							</DialogTrigger>
							{/* <div className="boxCoach"> */}
							<DialogContent className="sm:max-w-[375px] coachData">
								<DialogHeader>
									<DialogTitle>Update Coach Data</DialogTitle>
									<DialogDescription>
										Update {user.coachName}'s data. Only change important fields.
									</DialogDescription>
								</DialogHeader>

								<br />
								<Form {...form}>
									<form className="space-y-4" onSubmit={form.handleSubmit(mutate)} >
										<FormField
											control={form.control}
											name="coachName"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input placeholder="Coach Name" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input placeholder="Coach Email" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="fromWrapTour">
											<FormField
												control={form.control}
												name="level"
												render={({ field }) => (
													<FormItem>
														<Select onValueChange={field.onChange} defaultValue={field.value}>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Coach Level" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{/* kids, regular,amateur, pro */}
																<SelectItem value="kids">Kids</SelectItem>
																<SelectItem value="regular">Regular</SelectItem>
																<SelectItem value="standard">Standard </SelectItem>
																<SelectItem value="premium">Premium</SelectItem>
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
															<Input placeholder="Price pre month" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={form.control}
											name="bioInfo"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Textarea placeholder="Coach Info"{...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormItem>
											<FormLabel>Upload Image</FormLabel>
											<Input type="file" onChange={handleFileChange} />
											<FormDescription>
												Upload an image of the coach.
											</FormDescription>
										</FormItem>

										<div className="footerBase">
											<Button type="submit" disabled={isPending}>
												{
													isPending ? "Updating Coach..." : "Update Coach"
												}
											</Button>
										</div>
									</form>
								</Form>

							</DialogContent>
							{/* </div> */}
						</Dialog>

						<div className="coachActions" onClick={() => {
							deleteCoach(user._id)
						}}>
							<svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24">
								<path fill="#de0f0f" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"></path>
							</svg>
						</div>
					</div>
				</>
			)
		}
	}
]
