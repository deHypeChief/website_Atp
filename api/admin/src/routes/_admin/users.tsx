import Header from '@/components/blocks/header/header'
import { createFileRoute } from '@tanstack/react-router'
import { 
  useQuery
} from "@tanstack/react-query"
import { User } from "lucide-react"
import InfoCard from '@/components/blocks/infoCard/infoCard'
import { UserTable } from '@/assets/tables/users/dataTable'
import { columns } from '@/assets/tables/users/colums'
import { getUsers } from '../../apis/endpoints'


export const Route = createFileRoute('/_admin/users')({
  component: () => <Users />,
})


function Users() {
  const users = useQuery({ queryKey: ['user'], queryFn: getUsers })

  return (
    <div className="users">
      <Header title='Users' subText='Your users and their activity overview'></Header>

      <div className="userContent">
        <div className="userrDataTop ">

          <InfoCard title='Total Users' info={users?.data?.length || 0} extraInfo='Currently signed up'>
            <User className="h-4 w-4 text-muted-foreground" />
          </InfoCard>
          <InfoCard title='User Registerd Matches' info="0" extraInfo='For current tournament'>
            <User className="h-4 w-4 text-muted-foreground" />
          </InfoCard>
          <InfoCard title='Winners' info="5" extraInfo='For Current Tournament'>
            <User className="h-4 w-4 text-muted-foreground" />
          </InfoCard>
          <InfoCard title='Total Losers' info="0" extraInfo='For Current Tournament'>
            <User className="h-4 w-4 text-muted-foreground" />
          </InfoCard>
        </div>

        <div className="userData">
          <UserTable data={users?.data?.length ? users.data : []} columns={columns}/>
        </div>
      </div>
    </div>
  )
}