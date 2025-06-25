import { getLinkedPlayers } from '@/apis/endpoints'
import { columns } from '@/assets/tables/linkedPlayers/colums'
import { CoachAssignTable } from '@/assets/tables/linkedPlayers/dataTable'
import Header from '@/components/blocks/header/header'
import InfoCard from '@/components/blocks/infoCard/infoCard'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Link2 } from 'lucide-react'

export const Route = createFileRoute('/_admin/linkedPlayers')({
  component: () => <LinkedPlayer />,
})

function LinkedPlayer() {
  const { data } = useQuery({
    queryFn: () => getLinkedPlayers(),
    queryKey: ["linkedPlayers"]
  })

  console.log(data)
  return (
    <div>
      <Header title='Linked Players' subText='All players linked to a coach'>

      </Header>
      <div className="userContent">
        <div className="userrDataTop">

          <InfoCard title="Players On Traning" info={data?.assignments?.length} extraInfo=' Players currently linked to a coach.'>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </InfoCard>

        </div>

        <div className="userData">
          <CoachAssignTable columns={columns} data={data ? data.assignments : []} />
        </div>
      </div>
    </div>
  )
}