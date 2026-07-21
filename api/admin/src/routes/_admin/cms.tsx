import { deleteNewsArticle, getNewsAdmin } from '@/apis/endpoints'
import Header from '@/components/blocks/header/header'
import NewsArticleForm from '@/components/newsArticleForm'
import { Button } from '@/components/ui/button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Edit3, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_admin/cms')({ component: NewsManager })

function NewsManager() {
  const queryClient = useQueryClient()
  const { data: articles = [], isLoading } = useQuery({ queryKey:['admin-news'], queryFn:getNewsAdmin })
  const [editing, setEditing] = useState<any>(null)
  const remove = useMutation({ mutationFn:deleteNewsArticle, onSuccess:()=>queryClient.invalidateQueries({queryKey:['admin-news']}) })
  const closeEditor=()=>setEditing(null)
  const saved=()=>{ queryClient.invalidateQueries({queryKey:['admin-news']}); closeEditor() }

  return <div className="p-6 md:p-10 max-w-7xl mx-auto">
    <Header title="Tennis news" subText="Write, publish and manage stories shown on the ATP website">
      <Button asChild><Link to="/cms/new"><Plus className="mr-2 h-4 w-4"/>New article</Link></Button>
    </Header>
    {editing && <div className="mt-8 border rounded-xl bg-card p-5 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-semibold">Edit article</h2><Button variant="ghost" size="icon" onClick={closeEditor}><X/></Button></div>
      <NewsArticleForm article={editing} onSaved={saved} onCancel={closeEditor}/>
    </div>}
    <div className="mt-8 grid gap-3">
      {isLoading && <p className="text-muted-foreground py-10">Loading articles…</p>}
      {!isLoading && articles.length===0 && <div className="border border-dashed rounded-xl py-16 text-center text-muted-foreground">No stories yet. Create the first courtside report.</div>}
      {articles.map((article:any)=><article key={article._id} className="border rounded-xl bg-card p-5 flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1 min-w-0"><div className="flex gap-2 items-center mb-2"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${article.published?'bg-green-100 text-green-800':'bg-slate-100 text-slate-600'}`}>{article.published?'Published':'Draft'}</span><span className="text-xs text-muted-foreground">{article.category}</span></div><h3 className="font-semibold text-lg truncate">{article.title}</h3><p className="text-sm text-muted-foreground line-clamp-1 mt-1">{article.excerpt}</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={()=>setEditing(article)}><Edit3 className="h-4 w-4 mr-2"/>Edit</Button><Button variant="destructive" size="sm" onClick={()=>{if(confirm('Delete this article?'))remove.mutate(article._id)}}><Trash2 className="h-4 w-4 mr-2"/>Delete</Button></div>
      </article>)}
    </div>
  </div>
}
