import { getSubedPlayers } from '@/apis/endpoints'
import { columns } from '@/assets/tables/subscriptions/columns'
import { SubTable } from '@/assets/tables/subscriptions/dataTable'
import Header from '@/components/blocks/header/header'
import InfoCard from '@/components/blocks/infoCard/infoCard'
import { CardStackPlusIcon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/subscriptions')({
    component: () => <Subscriptions />,
})


function Subscriptions() {
    const { data } = useQuery({
        queryFn: () => getSubedPlayers(),
        queryKey: ["subedPlayers"]
    })

    return (
        <div>
            <Header title='Subscriptions' subText='Manage your subscriptions here.'>

            </Header>
            <div className="userContent">
                <div className="userrDataTop ">

                    <InfoCard title="Subscriptions Done" info={data?.payments?.length} extraInfo=' Subscription transactions made on the platform.'>
                        <CardStackPlusIcon className="h-4 w-4 text-muted-foreground" />
                    </InfoCard>

                </div>
                <div className="userData">
                    <SubTable columns={columns} data={data ? data.payments : []} />
                </div>
            </div>

        </div>
    )
}