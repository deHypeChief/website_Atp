import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/forgotPassword')({
  component: () => <div>Hello /_auth/forgotPassword!</div>,
})
