import { getSiteContentAdmin, updateSiteContent } from '@/apis/endpoints'
import Header from '@/components/blocks/header/header'
import { Button } from '@/components/ui/button'
import { useCloudinary } from '@/hooks/use-cloudinary'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_admin/gallery')({ component: GalleryManager })

/**
 * The photo gallery shown at /gallery on the website.
 *
 * Images live on the site content document, so uploading here publishes straight to the
 * public page. Order is the display order — the arrows move a photograph in the grid.
 */
function GalleryManager() {
  const qc = useQueryClient()
  const { uploadFile } = useCloudinary()
  const { data, isLoading } = useQuery({ queryKey: ['site-content-admin'], queryFn: getSiteContentAdmin })
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  // Local order is only "unsaved" while it differs from what the server last returned.
  const saved: string[] = data?.gallery || []
  const dirty = images.length !== saved.length || images.some((url, index) => url !== saved[index])

  useEffect(() => { if (data) setImages(data.gallery || []) }, [data])

  const save = useMutation({
    mutationFn: (gallery: string[]) => updateSiteContent({ gallery }),
    onSuccess: content => {
      qc.setQueryData(['site-content-admin'], content)
      qc.invalidateQueries({ queryKey: ['site-content'] })
    },
  })

  const upload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile(file)
      if (url) setImages(current => [...current, url])
    } finally {
      setUploading(false)
    }
  }

  const move = (index: number, direction: -1 | 1) => setImages(current => {
    const target = index + direction
    if (target < 0 || target >= current.length) return current
    const next = [...current]
    ;[next[index], next[target]] = [next[target], next[index]]
    return next
  })

  if (isLoading) return <div className="p-10">Loading gallery…</div>

  return <div className="p-6 md:p-10 max-w-7xl mx-auto">
    <Header title="Gallery" subText="Photographs shown on the website gallery page">
      <div className="flex gap-3">
        <Button variant="outline" asChild disabled={uploading}>
          <label className="cursor-pointer">
            <ImagePlus className="mr-2 h-4 w-4" />{uploading ? 'Uploading…' : 'Upload image'}
            <input className="sr-only" type="file" accept="image/*" onChange={event => upload(event.target.files?.[0])} />
          </label>
        </Button>
        <Button onClick={() => save.mutate(images)} disabled={!dirty || save.isPending}>
          {save.isPending ? 'Saving…' : 'Save gallery'}
        </Button>
      </div>
    </Header>

    <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
      <span>{images.length} {images.length === 1 ? 'photograph' : 'photographs'}</span>
      {dirty && <span className="text-amber-600">Unsaved changes</span>}
      {save.isError && <span className="text-destructive">The gallery could not be saved. Try again.</span>}
    </div>

    {!images.length
      ? <div className="rounded-xl border border-dashed p-14 text-center text-sm text-muted-foreground">
        No photographs yet. Upload an image to start the gallery.
      </div>
      : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((url, index) => <figure key={`${url}-${index}`} className="relative overflow-hidden rounded-xl border">
          <img src={url} className="h-44 w-full object-cover" alt="" />
          <Button className="absolute right-2 top-2" size="icon" variant="destructive" aria-label="Remove photograph" onClick={() => setImages(current => current.filter((_, i) => i !== index))}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-muted-foreground">
            <span>#{index + 1}</span>
            <span className="flex gap-1">
              <Button size="icon" variant="ghost" aria-label="Move earlier" disabled={index === 0} onClick={() => move(index, -1)}><ArrowLeft className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" aria-label="Move later" disabled={index === images.length - 1} onClick={() => move(index, 1)}><ArrowRight className="h-4 w-4" /></Button>
            </span>
          </figcaption>
        </figure>)}
      </div>}
  </div>
}
