import Header from '@/components/blocks/header/header'
import InfoCard from '@/components/blocks/infoCard/infoCard'
import { createFileRoute } from '@tanstack/react-router'
import { Link2 } from 'lucide-react'

export const Route = createFileRoute('/_admin/linkedPlayers')({
  component: () => <LinkedPlayer />,
})

function LinkedPlayer() {
  return (
    <div>
      <Header title='Linked Players' subText='All players linked to a coach'>

      </Header>
      <div className="userContent">
        <div className="userrDataTop">

          <InfoCard title="Players On Traning" info={[].length} extraInfo=' Players currently linked to a coach.'>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </InfoCard>

        </div>

        <div className="userData">

        </div>
      </div>
    </div>
  )
}