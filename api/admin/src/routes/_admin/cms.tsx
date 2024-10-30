import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/cms')({
  component: () => <div>Hello /_admin/cms!</div>,
})
