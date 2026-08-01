import {
  archiveStoreProduct,
  createStoreProduct,
  getStoreOverview,
  updateStoreOrderStatus,
  updateStoreProduct,
  updateStoreSettings,
} from '@/apis/endpoints'
import Header from '@/components/blocks/header/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCloudinary } from '@/hooks/use-cloudinary'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Archive, ImagePlus, PackagePlus, Pencil, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_admin/store')({ component: StoreManager })

const emptyProduct = {
  name: '', category: 'Apparel', collection: 'ATP ROYALE', description: '', price: '', compareAtPrice: '',
  stock: '', images: [] as string[], sizes: '', colors: '', badge: '', featured: false, active: true,
}

const defaultSettings = {
  name: 'ATP ROYALE',
  announcement: 'Complimentary Abuja delivery on orders over ₦75,000',
  heroEyebrow: 'ATP ROYALE / Collection 01',
  heroTitle: 'Dress for the next point.',
  heroSubtitle: 'Court-built essentials and club pieces for the way you play, train and move.',
  heroImage: '',
  primaryCta: 'Shop the collection',
  secondaryCta: 'Explore court gear',
  deliveryNote: 'Abuja delivery in 1–2 working days. Nationwide delivery in 3–5 working days.',
  returnsNote: 'Easy exchanges on unworn items within 7 days.',
}

const money = (value:number) => `₦${Number(value || 0).toLocaleString('en-NG')}`
const listToString = (value:unknown) => Array.isArray(value) ? value.join(', ') : String(value || '')
const stringToList = (value:unknown) => String(value || '').split(',').map(item => item.trim()).filter(Boolean)

function StoreManager() {
  const qc = useQueryClient()
  const { uploadFile } = useCloudinary()
  const [tab, setTab] = useState<'products'|'orders'|'settings'>('products')
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyProduct)
  const [settings, setSettings] = useState<any>(defaultSettings)
  const [uploading, setUploading] = useState(false)
  const { data = { products: [], orders: [], revenue: 0, paidOrders: 0, settings: null }, isLoading } = useQuery({ queryKey: ['store-overview'], queryFn: getStoreOverview })
  const refresh = () => qc.invalidateQueries({ queryKey: ['store-overview'] })

  useEffect(() => { if (data.settings) setSettings({ ...defaultSettings, ...data.settings }) }, [data.settings])

  const save = useMutation({
    mutationFn: (payload:any) => editing?.new ? createStoreProduct(payload) : updateStoreProduct({ id: editing._id, payload }),
    onSuccess: () => { refresh(); setEditing(null); setForm(emptyProduct) },
  })
  const saveSettings = useMutation({ mutationFn: updateStoreSettings, onSuccess: refresh })
  const archive = useMutation({ mutationFn: archiveStoreProduct, onSuccess: refresh })
  const status = useMutation({ mutationFn: updateStoreOrderStatus, onSuccess: refresh })

  const edit = (product:any) => {
    setEditing(product)
    setForm({ ...emptyProduct, ...product, price: String(product.price), compareAtPrice: String(product.compareAtPrice || ''), stock: String(product.stock), sizes: listToString(product.sizes), colors: listToString(product.colors) })
  }
  const upload = async (file:File|null, target:'product'|'hero' = 'product') => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile(file)
      if (!url) return
      if (target === 'hero') setSettings((old:any) => ({ ...old, heroImage: url }))
      else setForm((old:any) => ({ ...old, images: [...old.images, url] }))
    } finally { setUploading(false) }
  }
  const submit = (event:any) => {
    event.preventDefault()
    save.mutate({ ...form, price: Number(form.price), compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined, stock: Number(form.stock), sizes: stringToList(form.sizes), colors: stringToList(form.colors) })
  }
  const lowStock = data.products.filter((product:any) => product.active && product.stock <= 5).length

  return <div className="p-6 md:p-10 max-w-7xl mx-auto">
    <Header title="ATP ROYALE" subText="Manage the storefront campaign, products, stock, payments and fulfilment">
      <Button onClick={() => { setEditing({ new: true }); setForm(emptyProduct); setTab('products') }}><PackagePlus className="h-4 w-4 mr-2" />Add product</Button>
    </Header>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
      {([['Products', data.products.length], ['Low stock', lowStock], ['Paid orders', data.paidOrders], ['Revenue', money(data.revenue)]] as any[]).map(([label, value]) => <div className="border rounded-xl p-5 bg-card" key={label}><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><strong className="text-2xl mt-2 block">{value}</strong></div>)}
    </div>

    <div className="flex gap-2 mt-8 border-b overflow-x-auto">
      {([['products', 'Products & stock'], ['orders', 'Orders'], ['settings', 'Storefront settings']] as const).map(([value, label]) => <button key={value} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${tab === value ? 'border-b-2 border-primary' : ''}`} onClick={() => setTab(value)}>{label}</button>)}
    </div>

    {editing && tab === 'products' && <form onSubmit={submit} className="mt-6 border rounded-xl p-6 bg-card grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2 flex justify-between"><h2 className="text-xl font-semibold">{editing.new ? 'Add product' : 'Edit product'}</h2><Button type="button" variant="ghost" size="icon" onClick={() => setEditing(null)}><X /></Button></div>
      <Field label="Product name"><Input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></Field>
      <Field label="Category"><Input required placeholder="Apparel, Equipment, Accessories" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} /></Field>
      <Field label="Collection"><Input value={form.collection} onChange={event => setForm({ ...form, collection: event.target.value })} /></Field>
      <Field label="Badge"><Input placeholder="New drop, Member pick" value={form.badge} onChange={event => setForm({ ...form, badge: event.target.value })} /></Field>
      <Field label="Price (₦)"><Input required min="0" type="number" value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} /></Field>
      <Field label="Compare-at price (₦)"><Input min="0" type="number" value={form.compareAtPrice} onChange={event => setForm({ ...form, compareAtPrice: event.target.value })} /></Field>
      <Field label="Stock count"><Input required min="0" type="number" value={form.stock} onChange={event => setForm({ ...form, stock: event.target.value })} /></Field>
      <Field label="Sizes (comma separated)"><Input placeholder="XS, S, M, L, XL" value={form.sizes} onChange={event => setForm({ ...form, sizes: event.target.value })} /></Field>
      <Field label="Colours (comma separated)"><Input placeholder="Royale blue, White" value={form.colors} onChange={event => setForm({ ...form, colors: event.target.value })} /></Field>
      <label className="grid gap-2 text-sm md:col-span-2">Description<Textarea required value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
      <div className="md:col-span-2"><p className="text-sm mb-2">Product images</p><div className="flex gap-3 flex-wrap">{form.images.map((image:string, index:number) => <div className="relative" key={`${image}-${index}`}><img src={image} className="h-24 w-24 object-cover rounded border" /><button type="button" aria-label="Remove image" className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6" onClick={() => setForm({ ...form, images: form.images.filter((_:string, imageIndex:number) => imageIndex !== index) })}>×</button></div>)}<label className="h-24 w-24 border border-dashed rounded grid place-items-center cursor-pointer"><ImagePlus /><input className="hidden" type="file" accept="image/*" disabled={uploading} onChange={event => upload(event.target.files?.[0] || null)} /></label></div></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={event => setForm({ ...form, featured: event.target.checked })} />Featured on landing page</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={event => setForm({ ...form, active: event.target.checked })} />Visible in shop</label>
      <div className="md:col-span-2 flex justify-end"><Button disabled={save.isPending || uploading}>{save.isPending ? 'Saving…' : 'Save product'}</Button></div>
    </form>}

    {tab === 'settings' && <form className="mt-6 border rounded-xl p-6 bg-card grid md:grid-cols-2 gap-4" onSubmit={event => { event.preventDefault(); saveSettings.mutate(settings) }}>
      <div className="md:col-span-2"><h2 className="text-xl font-semibold">Storefront campaign</h2><p className="text-sm text-muted-foreground mt-1">These fields control the ATP ROYALE landing page and service messages.</p></div>
      <Field label="Store name"><Input value={settings.name} onChange={event => setSettings({ ...settings, name: event.target.value })} /></Field>
      <Field label="Announcement bar"><Input value={settings.announcement} onChange={event => setSettings({ ...settings, announcement: event.target.value })} /></Field>
      <Field label="Hero eyebrow"><Input value={settings.heroEyebrow} onChange={event => setSettings({ ...settings, heroEyebrow: event.target.value })} /></Field>
      <Field label="Hero title"><Input value={settings.heroTitle} onChange={event => setSettings({ ...settings, heroTitle: event.target.value })} /></Field>
      <label className="grid gap-2 text-sm md:col-span-2">Hero description<Textarea value={settings.heroSubtitle} onChange={event => setSettings({ ...settings, heroSubtitle: event.target.value })} /></label>
      <Field label="Primary button"><Input value={settings.primaryCta} onChange={event => setSettings({ ...settings, primaryCta: event.target.value })} /></Field>
      <Field label="Secondary button"><Input value={settings.secondaryCta} onChange={event => setSettings({ ...settings, secondaryCta: event.target.value })} /></Field>
      <label className="grid gap-2 text-sm md:col-span-2">Delivery note<Textarea value={settings.deliveryNote} onChange={event => setSettings({ ...settings, deliveryNote: event.target.value })} /></label>
      <label className="grid gap-2 text-sm md:col-span-2">Returns note<Textarea value={settings.returnsNote} onChange={event => setSettings({ ...settings, returnsNote: event.target.value })} /></label>
      <div className="md:col-span-2"><p className="text-sm mb-2">Hero image</p><div className="flex items-center gap-4">{settings.heroImage && <img src={settings.heroImage} className="h-28 w-44 object-cover rounded border" />}<label className="h-28 w-44 border border-dashed rounded grid place-items-center cursor-pointer text-sm"><span className="grid justify-items-center gap-2"><ImagePlus />{settings.heroImage ? 'Replace image' : 'Upload image'}</span><input className="hidden" type="file" accept="image/*" disabled={uploading} onChange={event => upload(event.target.files?.[0] || null, 'hero')} /></label></div></div>
      <div className="md:col-span-2 flex justify-end"><Button disabled={saveSettings.isPending || uploading}><Save className="h-4 w-4 mr-2" />{saveSettings.isPending ? 'Saving…' : 'Save storefront'}</Button></div>
    </form>}

    {isLoading ? <p className="py-12">Loading store…</p> : tab === 'products' ? <div className="mt-6 grid gap-3">{data.products.map((product:any) => <article className="border rounded-xl p-4 bg-card flex items-center gap-4" key={product._id}>{product.images?.[0] ? <img src={product.images[0]} className="w-20 h-20 object-cover rounded" /> : <div className="w-20 h-20 bg-muted grid place-items-center font-bold">ATP</div>}<div className="flex-1"><div className="flex items-center gap-2"><h3 className="font-semibold">{product.name}</h3>{product.featured && <span className="text-xs bg-primary/10 px-2 py-1 rounded">Featured</span>}{!product.active && <span className="text-xs bg-muted px-2 py-1 rounded">Archived</span>}</div><p className="text-sm text-muted-foreground">{product.category} · {money(product.price)}</p><p className={`text-sm font-semibold mt-1 ${product.stock <= 5 ? 'text-orange-600' : ''}`}>{product.stock} in stock</p></div><Button variant="outline" size="sm" onClick={() => edit(product)}><Pencil className="h-4 w-4 mr-2" />Edit</Button>{product.active && <Button variant="ghost" size="sm" onClick={() => confirm('Archive this product?') && archive.mutate(product._id)}><Archive className="h-4 w-4" /></Button>}</article>)}</div> : tab === 'orders' ? <div className="mt-6 grid gap-3">{!data.orders.length && <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground">No store orders yet.</div>}{data.orders.map((order:any) => <article className="border rounded-xl p-5 bg-card grid md:grid-cols-[1fr_auto_auto] gap-5 items-center" key={order._id}><div><div className="flex gap-2 items-center"><strong>{order.orderNumber}</strong><span className={`text-xs px-2 py-1 rounded ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{order.paymentStatus}</span></div><p className="text-sm mt-2">{order.user?.fullName || 'Customer'} · {order.user?.email}</p><p className="text-sm text-muted-foreground">{order.items.map((item:any) => `${item.quantity}× ${item.name}${item.size ? ` / ${item.size}` : ''}${item.color ? ` / ${item.color}` : ''}`).join(', ')}</p></div><strong>{money(order.total)}</strong><select className="border rounded px-3 py-2 bg-background" value={order.status} disabled={order.paymentStatus !== 'Paid'} onChange={event => status.mutate({ id: order._id, status: event.target.value })}>{['Awaiting payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(value => <option key={value}>{value}</option>)}</select></article>)}</div> : null}
  </div>
}

function Field({ label, children }:{ label:string, children:React.ReactNode }) { return <label className="grid gap-2 text-sm">{label}{children}</label> }
