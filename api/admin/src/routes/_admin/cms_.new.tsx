import Header from '@/components/blocks/header/header'
import NewsArticleForm from '@/components/newsArticleForm'
import { Button } from '@/components/ui/button'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_admin/cms/new')({
  component: NewArticle,
})

function NewArticle() {
  const navigate = useNavigate()
  const back = () => navigate({ to: '/cms' })
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <Button variant="ghost" asChild className="mb-6 -ml-3">
        <Link to="/cms">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to news
        </Link>
      </Button>
      <Header
        title="New article"
        subText="Create a story for the ATP website"
      />
      <div className="mt-8 rounded-xl border bg-card p-5 shadow-sm md:p-8">
        <NewsArticleForm onSaved={back} onCancel={back} />
      </div>
    </div>
  )
}
