import Header from '@/components/blocks/header/header'
import { createFileRoute } from '@tanstack/react-router'
import InfoCard from '@/components/blocks/infoCard/infoCard'
import { User } from "lucide-react"
import { CoachTable } from '@/assets/tables/coaches/dataTable'
import { columns } from '@/assets/tables/coaches/columns'


import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { getCoaches } from '@/apis/endpoints'
import { useCloudinary } from '@/hooks/use-cloudinary'

export const Route = createFileRoute('/_admin/coaches')({
	component: () => <Coaches />,
})


function Coaches() {
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
				title: "Coach Created",
			})
			queryClient.invalidateQueries({ queryKey: ['coaches'] })
		},
		onError: (err) => {
			console.error(err)
			toast({
				variant: "destructive",
				title: "Error Creating Coach",
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
			.refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
                message: "Please enter a valid price greater than 0.",
            }),
		level: z
			.enum(["kids", "regular", "amateur", "professional"], {
				required_error: "The coach level is needed",
				invalid_type_error: "Please select a valid level",
			}),
	});
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			coachName: "",
			email: "",
			bioInfo: "",
			level: "kids",
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

		const coachData = {
			...data,
			imageUrl,
		};

		const response = await api.post(`/coach/createCoach`, coachData)
		console.log(response)
		form.reset()
		setFile(null)
	}

	return (
		<div className="coaches">
			<Header title='Coaches' subText='Create and manage your coaches here'>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="default" onClick={() => {
							form.reset()
							setFile(null)
						}}
						>
							Create Coach
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[375px]">
						<DialogHeader>
							<DialogTitle>Register Coach</DialogTitle>
							<DialogDescription>
								New coaches are created here.
							</DialogDescription>
						</DialogHeader>
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
											isPending ? "Creating Coach..." : "Create Coach"
										}
									</Button>
								</div>
							</form>
						</Form>

					</DialogContent>
				</Dialog>
			</Header>

			<div className="userContent">
				<div className="userrDataTop ">

					<InfoCard title="Coaches" info={data?.length} extraInfo='Registered Coaches'>
						<User className="h-4 w-4 text-muted-foreground" />
					</InfoCard>

				</div>

				<div className="userData">
					<CoachTable data={data ? data : []} columns={columns} />
				</div>
			</div>
		</div>
	)
}
