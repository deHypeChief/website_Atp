import { columns } from '@/assets/tables/matches/colums'
import { MatchTable } from '@/assets/tables/matches/dataTable'
import Header from '@/components/blocks/header/header'
import InfoCard from '@/components/blocks/infoCard/infoCard'
import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import { User } from "lucide-react"
import { getMatches, verifyToken } from '../../apis/endpoints'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form"
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import "../../assets/style/routes/matches.css"
import { toast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'



export const Route = createFileRoute('/_admin/matches')({
	component: () => <Matches />,
})


function Matches() {
	const queryClient = useQueryClient()
	const { data } = useQuery({ queryKey: ['match'], queryFn: getMatches })

	const { mutate, isPending } = useMutation({
		mutationFn: (data) => {
			// Remove ATP- prefix if it exists in the input
			const cleanToken = data.token.startsWith('ATP-') ? data.token.substring(4) : data.token;
			return verifyToken({
				token: "ATP-" + cleanToken
			});
		},
		onSuccess: (data) => {
			console.log(data)
			toast({
				variant: "default",
				title: "Token Valid",
				description: data.message,
			})
			queryClient.invalidateQueries({ queryKey: ['match'] })
		},
		onError: (err) => {
			toast({
				variant: "destructive",
				title: "Token Verification Error",
				description: err.response.data.message,
			})
		}
	})

	const FormSchema = z.object({
		token: z.string().min(6, {
			message: "Token must be 6 characters.",
		}),
	})
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			token: "",
		},
	})

	return (
		<div className="matches">
			<Header title='Matches' subText='Verify and manage your matches here'>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="default">Verify Ticket</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[375px]">
						<DialogHeader>
							<DialogTitle>Verify Ticket</DialogTitle>
							<DialogDescription>
								Add the last six chars of the ticket pin for verification
							</DialogDescription>
						</DialogHeader>
						<Form {...form}>
							<form className="w-full" onSubmit={form.handleSubmit(mutate)} >
								<div className="w-full mb-4">
									<FormField
										control={form.control}
										name="token"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														className="w-full"
														placeholder='Enter last 6 chars'
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="footerBase">
									<Button type="submit" disabled={isPending}>
										{
											isPending ? "Verifying Ticket..." : "Verify Ticket"
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

					<InfoCard title="Match" info={data?.length || 0} extraInfo='Matches created'>
						<User className="h-4 w-4 text-muted-foreground" />
					</InfoCard>

				</div>

				<div className="userData">
					<MatchTable data={data ? data : []} columns={columns} />
				</div>
			</div>
		</div>
	)
}