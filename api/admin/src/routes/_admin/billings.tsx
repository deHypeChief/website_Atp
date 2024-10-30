import { createFileRoute } from '@tanstack/react-router'


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

import { User } from "lucide-react"
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import InfoCard from '@/components/blocks/infoCard/infoCard'
import Header from '@/components/blocks/header/header'
import { columns } from '@/assets/tables/memberships/columns'
import { MembershipTable } from '@/assets/tables/memberships/dataTable'


export const Route = createFileRoute('/_admin/billings')({
  component: () => <Billings />,
})


function Billings() {

    const FormSchema = z.object({
		name: z.string({
			required_error: "A name is needed",
		}),
	})
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: "",
		},
	})
    return (
        <div className="bills">
            <Header title='Memberships' subText='An overview of users memeberships here'>
                
            </Header>
            <div className="userContent">
				<div className="userrDataTop ">

					<InfoCard title="Members" extraInfo='Active Members'>
						<User className="h-4 w-4 text-muted-foreground" />
					</InfoCard>

				</div>

				<div className="userData">
					<MembershipTable data={[]} columns={columns}/>
				</div>
			</div>
        </div>
    )
}