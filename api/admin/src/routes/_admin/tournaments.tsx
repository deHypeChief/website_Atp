import { getTours } from '@/apis/endpoints'
import { columns } from '@/assets/tables/tournaments/colums'
import { TourTable } from '@/assets/tables/tournaments/dataTable'
import Header from '@/components/blocks/header/header'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/tournaments')({
  component: () => <Tournaments/>,
})

function Tournaments() {
  const tour = useQuery({ queryKey: ['tour'], queryFn: getTours })
  return (
    <div className="tournament">
      <Header title='Tournament' subText='Create and manage tournaments here'></Header>

      <div className="tourtable">
        <TourTable data={tour?.data?.length ? tour.data : []} columns={columns}/>
      </div>
    </div>
  )
}