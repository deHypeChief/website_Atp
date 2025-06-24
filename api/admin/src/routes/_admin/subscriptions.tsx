import Header from '@/components/blocks/header/header'
import InfoCard from '@/components/blocks/infoCard/infoCard'
import { CardStackPlusIcon } from '@radix-ui/react-icons'
import { createFileRoute } from '@tanstack/react-router'
import { User } from 'lucide-react'

export const Route = createFileRoute('/_admin/subscriptions')({
    component: () => <Subscriptions />,
})


function Subscriptions() {
    return (
        <div>
            <Header title='Subscriptions' subText='Manage your subscriptions here.'>

            </Header>
            <div className="userContent">
                <div className="userrDataTop ">

                    <InfoCard title="Subscriptions Done" info={[].length} extraInfo=' Subscription transactions made on the platform.'>
                        <CardStackPlusIcon className="h-4 w-4 text-muted-foreground" />
                    </InfoCard>

                </div>
            </div>
        </div>
    )
}