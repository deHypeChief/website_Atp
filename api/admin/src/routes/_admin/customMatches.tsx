import { getMatchCustom } from '@/apis/endpoints'
import { columns } from '@/assets/tables/customMatches/colums'
import { CustomMatchesTab } from '@/assets/tables/customMatches/dataTable'
import Header from '@/components/blocks/header/header'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/customMatches')({
    component: () => <CustomMatches />,
})


function CustomMatches() {
    const { data } = useQuery({
        queryFn: () => getMatchCustom(),
        queryKey: ["customMatches"]
    })
    return (
        <div className="matches">
            <Header title='Custom matches' subText='Manage your custom matches here'></Header>

            <div className="userData">
                <CustomMatchesTab data={data?.matches || []} columns={columns} />
            </div>
        </div>
    )
}