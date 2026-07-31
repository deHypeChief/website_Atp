import { createSiteReview, deleteSiteReview, getSiteContentAdmin, getSiteCopySchema, updateSiteContent, updateSiteCopy } from '@/apis/endpoints'
import Header from '@/components/blocks/header/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCloudinary } from '@/hooks/use-cloudinary'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ImagePlus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_admin/content')({ component: SiteContentManager })
const linkFields:any = { facebookLink:'Facebook',instagramLink:'Instagram',linkedinLink:'LinkedIn',xLink:'X / Twitter',youtubeLink:'YouTube',privacyLink:'Privacy policy',termsLink:'Terms of service',cookieLink:'Cookie policy' }

/**
 * Website copy editor. Both the fields and their grouping come from the server's copy
 * registry, so adding editable text to the site needs no change here.
 */
function CopyEditor(){
  const qc=useQueryClient()
  const {data:groups=[],isLoading:loadingSchema}=useQuery({queryKey:['site-copy-schema'],queryFn:getSiteCopySchema})
  const {data,isLoading:loadingCopy}=useQuery({queryKey:['site-content-admin'],queryFn:getSiteContentAdmin})
  const [page,setPage]=useState('')
  const [draft,setDraft]=useState<Record<string,string>>({})
  const saved:Record<string,string>=data?.copy||{}

  useEffect(()=>{if(groups.length&&!page)setPage(groups[0].id)},[groups,page])

  const save=useMutation({
    mutationFn:updateSiteCopy,
    onSuccess:result=>{
      // Re-seed from the server's resolved copy so the form shows exactly what the site renders.
      qc.setQueryData(['site-content-admin'],(current:any)=>({...(current||{}),copy:result.copy}))
      qc.invalidateQueries({queryKey:['site-content']})
      setDraft({})
    },
  })

  const valueFor=(key:string)=>draft[key]??saved[key]??''
  const edit=(key:string,value:string)=>setDraft(current=>({...current,[key]:value}))
  const changedKeys=Object.keys(draft).filter(key=>draft[key]!==(saved[key]??''))
  const revert=()=>setDraft({})

  if(loadingSchema||loadingCopy)return <p className="text-sm text-muted-foreground">Loading website copy…</p>
  const active=groups.find((group:any)=>group.id===page)

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center gap-2">
      {groups.map((group:any)=><Button key={group.id} size="sm" variant={page===group.id?'default':'outline'} onClick={()=>setPage(group.id)}>{group.label}</Button>)}
      <span className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
        {changedKeys.length>0&&<>
          <span>{changedKeys.length} unsaved change{changedKeys.length===1?'':'s'}</span>
          <Button size="sm" variant="ghost" onClick={revert}>Revert</Button>
        </>}
        <Button size="sm" onClick={()=>save.mutate(Object.fromEntries(changedKeys.map(key=>[key,draft[key]])))} disabled={!changedKeys.length||save.isPending}>
          {save.isPending?'Saving…':'Save copy'}
        </Button>
      </span>
    </div>

    {save.isError&&<p className="text-sm text-destructive">That copy could not be saved. Try again.</p>}

    <div className="grid gap-5 md:grid-cols-2">
      {active?.fields.map((field:any)=>{
        const isChanged=changedKeys.includes(field.key)
        return <label key={field.key} className={`grid gap-2 text-sm font-medium ${field.type==='text'?'md:col-span-2':''}`}>
          <span className="flex items-center gap-2">
            {field.label}
            {isChanged&&<i className="not-italic text-xs font-normal text-amber-600">edited</i>}
          </span>
          {field.type==='text'
            ? <Textarea className="min-h-24" value={valueFor(field.key)} onChange={e=>edit(field.key,e.target.value)}/>
            : <Input value={valueFor(field.key)} onChange={e=>edit(field.key,e.target.value)}/>}
          <span className="text-xs font-normal text-muted-foreground">{field.key}</span>
        </label>
      })}
    </div>
    <p className="text-xs text-muted-foreground">Press Enter inside a field to add a line break where the design supports one (page headings).</p>
  </div>
}

function SiteContentManager(){
  const qc=useQueryClient(); const {uploadFile}=useCloudinary(); const {data,isLoading}=useQuery({queryKey:['site-content-admin'],queryFn:getSiteContentAdmin})
  const [tab,setTab]=useState('pages'); const [pages,setPages]=useState<any>({}); const [links,setLinks]=useState<any>({}); const [gallery,setGallery]=useState<string[]>([]); const [sponsors,setSponsors]=useState<string[]>([])
  const [review,setReview]=useState<any>({name:'',role:'Student Member',reviewContent:'',imageUrl:''}); const [uploading,setUploading]=useState('')
  useEffect(()=>{if(data){setPages(data.pages||{});setLinks(data.links||{});setGallery(data.gallery||[]);setSponsors(data.sponsors||[])}},[data])
  const refresh=(content:any)=>{qc.setQueryData(['site-content-admin'],content);qc.invalidateQueries({queryKey:['site-content']})}
  const save=useMutation({mutationFn:updateSiteContent,onSuccess:refresh}); const addReview=useMutation({mutationFn:createSiteReview,onSuccess:(c)=>{refresh(c);setReview({name:'',role:'Student Member',reviewContent:'',imageUrl:''})}}); const removeReview=useMutation({mutationFn:deleteSiteReview,onSuccess:refresh})
  const upload=async(file:File|undefined,target:string)=>{if(!file)return;setUploading(target);try{const url=await uploadFile(file);if(!url)return;if(target==='gallery')setGallery(v=>[...v,url]);else if(target==='sponsors')setSponsors(v=>[...v,url]);else if(target==='review')setReview((v:any)=>({...v,imageUrl:url}));else setPages((v:any)=>({...v,[target]:url}))}finally{setUploading('')}}
  const saveAll=()=>save.mutate({pages,links,gallery,sponsors})
  const tabs=[['pages','Website copy'],['images','Page images'],['reviews','Testimonials'],['gallery','Gallery'],['sponsors','Sponsors'],['links','Footer links']]
  if(isLoading)return <div className="p-10">Loading site content…</div>
  return <div className="p-6 md:p-10 max-w-7xl mx-auto"><Header title="Site content" subText="Manage website copy, images, testimonials and links">{tab!=='pages'&&<Button onClick={saveAll} disabled={save.isPending}>{save.isPending?'Saving…':'Save changes'}</Button>}</Header>
    <div className="my-8 flex flex-wrap gap-2">{tabs.map(([id,label])=><Button key={id} variant={tab===id?'default':'outline'} onClick={()=>setTab(id)}>{label}</Button>)}</div>
    {/* Copy has its own save button so an editor never overwrites the whole document by accident. */}
    {tab==='pages'&&<CopyEditor/>}
    {tab==='images'&&<div className="grid gap-5 md:grid-cols-3">{[['homePageAboutImg','Home about'],['homePageCoachImg','Home coach'],['aboutPageImg','About page']].map(([key,label])=><div key={key} className="rounded-xl border p-4"><p className="mb-3 font-medium">{label}</p>{pages[key]&&<img src={pages[key]} className="mb-3 h-40 w-full rounded object-cover"/>}<Button variant="outline" asChild disabled={uploading===key}><label className="cursor-pointer"><ImagePlus className="mr-2 h-4 w-4"/>{uploading===key?'Uploading…':'Upload image'}<input className="sr-only" type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0],key)}/></label></Button></div>)}</div>}
    {tab==='reviews'&&<div className="space-y-6"><div className="grid gap-4 rounded-xl border p-5 md:grid-cols-2"><Input placeholder="Name" value={review.name} onChange={e=>setReview({...review,name:e.target.value})}/><Input placeholder="Role" value={review.role} onChange={e=>setReview({...review,role:e.target.value})}/><Textarea className="md:col-span-2" placeholder="Testimonial" value={review.reviewContent} onChange={e=>setReview({...review,reviewContent:e.target.value})}/><div className="flex gap-3"><Button variant="outline" asChild><label className="cursor-pointer"><ImagePlus className="mr-2 h-4 w-4"/>Add photo<input className="sr-only" type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0],'review')}/></label></Button><Button onClick={()=>addReview.mutate(review)} disabled={!review.name||!review.reviewContent}><Plus className="mr-2 h-4 w-4"/>Add testimonial</Button></div></div>{data?.reviews?.map((r:any)=><div key={r._id} className="flex items-center gap-4 rounded-xl border p-4">{r.imageUrl&&<img src={r.imageUrl} className="h-14 w-14 rounded-full object-cover"/>}<div className="flex-1"><b>{r.name}</b><p className="text-sm text-muted-foreground">{r.reviewContent}</p></div><Button size="icon" variant="destructive" onClick={()=>removeReview.mutate(r._id)}><Trash2 className="h-4 w-4"/></Button></div>)}</div>}
    {(tab==='gallery'||tab==='sponsors')&&<MediaList title={tab==='gallery'?'Gallery images':'Sponsor logos'} items={tab==='gallery'?gallery:sponsors} uploading={uploading===tab} onUpload={file=>upload(file,tab)} onRemove={index=>tab==='gallery'?setGallery(gallery.filter((_,i)=>i!==index)):setSponsors(sponsors.filter((_,i)=>i!==index))}/>} 
    {tab==='links'&&<div className="grid gap-5 md:grid-cols-2">{Object.entries(linkFields).map(([key,label]:any)=><label key={key} className="grid gap-2 text-sm font-medium">{label}<Input type="url" value={links[key]||''} onChange={e=>setLinks({...links,[key]:e.target.value})}/></label>)}</div>}
  </div>
}
function MediaList({title,items,uploading,onUpload,onRemove}:any){return <div><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">{title}</h2><Button variant="outline" asChild><label className="cursor-pointer"><ImagePlus className="mr-2 h-4 w-4"/>{uploading?'Uploading…':'Upload'}<input className="sr-only" type="file" accept="image/*" onChange={e=>onUpload(e.target.files?.[0])}/></label></Button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((url:string,index:number)=><div key={`${url}-${index}`} className="relative overflow-hidden rounded-xl border"><img src={url} className="h-44 w-full object-cover"/><Button className="absolute right-2 top-2" size="icon" variant="destructive" onClick={()=>onRemove(index)}><Trash2 className="h-4 w-4"/></Button></div>)}</div></div>}
