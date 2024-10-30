import Header from '@/components/blocks/header/header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/settings')({
  component: () => <Settings />,
})

function Settings() {
  const { adminLogout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    adminLogout()
    navigate({ to: "/" })
  }
  return (
    <div className="settings">
      <Header title='Settings' subText='Create and manage your settings here'></Header>

      <div className="userContent">
        <Button variant={"destructive"} onClick={handleLogout}>Logout Admin</Button>
      </div>
    </div>
  )
}