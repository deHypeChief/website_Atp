import Header from '@/components/blocks/header/header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/dashboard')({
  component: () => <Dashboard />,
})


function Dashboard() {
  return (
    <div className="dashboard">
      <Header title='Dashboard' subText='A quick overview on the activities of ATP'></Header>
    </div>
  )
}