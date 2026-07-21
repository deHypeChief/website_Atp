import { createNewsArticle, updateNewsArticle } from '@/apis/endpoints'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCloudinary } from '@/hooks/use-cloudinary'
import { useMutation } from '@tanstack/react-query'
import { ImagePlus } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import RichTextEditor from './richTextEditor'

export const emptyNewsArticle = { title:'', slug:'', excerpt:'', body:'', imageUrl:'', category:'Tennis', author:'ATP Editorial', published:false }

type NewsArticleFormProps = {
  article?: any
  onSaved: () => void
  onCancel: () => void
}

export default function NewsArticleForm({ article, onSaved, onCancel }: NewsArticleFormProps) {
  const [form, setForm] = useState<any>(article ? {...article} : emptyNewsArticle)
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const { uploadFile } = useCloudinary()
  const save = useMutation({
    mutationFn: (payload:any) => article ? updateNewsArticle(article._id, payload) : createNewsArticle(payload),
    onSuccess: onSaved,
    onError: (err:any) => setError(err?.response?.data?.message || 'Article could not be saved'),
  })

  const uploadNewsImage=async(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0]
    event.target.value=''
    if(!file) return
    if(!file.type.startsWith('image/')) return setError('Please choose an image file')
    if(file.size > 8 * 1024 * 1024) return setError('The image must be smaller than 8 MB')
    setError('')
    setUploadingImage(true)
    try {
      const imageUrl=await uploadFile(file)
      if(imageUrl) setForm((current:any)=>({...current,imageUrl}))
    } finally { setUploadingImage(false) }
  }

  const submit=(event:FormEvent)=>{
    event.preventDefault()
    const articleText = document.createElement('div')
    articleText.innerHTML = form.body
    if (!articleText.textContent?.trim()) return setError('Article content is required')
    save.mutate(form)
  }

  return <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
    <label className="grid gap-2 text-sm font-medium md:col-span-2">Headline<Input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
    <label className="grid gap-2 text-sm font-medium">Category<Input value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label>
    <label className="grid gap-2 text-sm font-medium">Author<Input value={form.author} onChange={e=>setForm({...form,author:e.target.value})}/></label>
    <div className="grid gap-2 text-sm font-medium md:col-span-2">
      <span>Featured image</span>
      <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4 md:flex-row md:items-center">
        {form.imageUrl ? <img src={form.imageUrl} alt="Article preview" className="h-28 w-full rounded-md object-cover md:w-44"/> : <div className="grid h-28 w-full place-items-center rounded-md bg-muted text-muted-foreground md:w-44"><ImagePlus className="h-7 w-7"/></div>}
        <div className="flex-1 space-y-3">
          <Input type="url" aria-label="Featured image URL" placeholder="Paste an image URL or upload a file" value={form.imageUrl || ''} onChange={e=>setForm({...form,imageUrl:e.target.value})}/>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={uploadingImage} asChild><label className="cursor-pointer"><ImagePlus className="mr-2 h-4 w-4"/>{uploadingImage?'Uploading…':form.imageUrl?'Replace image':'Upload image'}<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadNewsImage}/></label></Button>
            {form.imageUrl && <Button type="button" variant="ghost" onClick={()=>setForm({...form,imageUrl:''})}>Remove</Button>}
          </div>
          <p className="text-xs font-normal text-muted-foreground">JPG, PNG, WebP or GIF. Maximum 8 MB.</p>
        </div>
      </div>
    </div>
    <label className="grid gap-2 text-sm font-medium md:col-span-2">Short summary<Textarea required value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})}/></label>
    <label className="grid gap-2 text-sm font-medium md:col-span-2">Article content<RichTextEditor value={form.body} onChange={body=>setForm({...form,body})}/></label>
    <label className="flex gap-3 items-center text-sm font-medium"><input className="h-4 w-4" type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/>Publish on the website</label>
    <div className="flex justify-end gap-3 md:col-span-2">{error&&<p className="text-destructive mr-auto">{error}</p>}<Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button disabled={save.isPending || uploadingImage}>{save.isPending?'Saving…':article?'Save changes':'Create article'}</Button></div>
  </form>
}
