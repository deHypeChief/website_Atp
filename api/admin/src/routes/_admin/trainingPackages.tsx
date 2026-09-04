import {
  createTrainingPackage,
  deleteTrainingPackage,
  getCoaches,
  getTrainingPackages,
  updateTrainingPackage,
} from '@/apis/endpoints'
import Header from '@/components/blocks/header/header'
import InfoCard from '@/components/blocks/infoCard/infoCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useCloudinary } from '@/hooks/use-cloudinary'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, Eye, ImagePlus, Layers, PackagePlus, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_admin/trainingPackages')({ component: TrainingPackages })

/**
 * The training packages players buy on the billing page.
 *
 * "Normal" packages sit in the main grid; "special" ones get their own section below it,
 * which is where the family and couples plans live.
 */

const emptyPackage = {
  name: '', slug: '', category: 'normal', audience: 'adult', coachLevels: [] as string[], coachIds: [] as string[],
  discount: '0', info: '', priceInfo: '', image: '',
  order: '0', active: true,
  plans: [{ months: '1', price: '', dollarPrice: '' }, { months: '3', price: '', dollarPrice: '' }],
}

/** Which public membership page a package is offered on. */
const AUDIENCES = [
  { value: 'adult', label: 'Adult membership', page: '/membership/adult' },
  { value: 'children', label: 'Children membership', page: '/membership/children' },
  { value: 'combo', label: 'Combo membership', page: '/membership/combo' },
]

/** The levels a coach can be given, which is what the membership builder filters on. */
const COACH_LEVELS = [
  { value: 'kids', label: 'Kids' },
  { value: 'regular', label: 'Regular' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
]

const money = (value: number) => `₦${Number(value || 0).toLocaleString('en-NG')}`

/**
 * The slug travels inside the Paystack reference, which the payment webhook splits on "-".
 * Anything but letters and numbers would break that, so it is stripped here and on the server.
 */
const slugify = (value: string) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')

function TrainingPackages() {
  const qc = useQueryClient()
  const { uploadFile } = useCloudinary()
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyPackage)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const { data: packages = [], isLoading } = useQuery({ queryKey: ['training-packages'], queryFn: getTrainingPackages })
  const { data: coaches = [] } = useQuery({ queryKey: ['coaches'], queryFn: getCoaches })

  const close = () => { setEditing(null); setForm(emptyPackage); setError('') }
  const refresh = () => qc.invalidateQueries({ queryKey: ['training-packages'] })

  const save = useMutation({
    mutationFn: (payload: any) => editing?.new ? createTrainingPackage(payload) : updateTrainingPackage({ id: editing._id, payload }),
    onSuccess: () => { refresh(); close() },
    onError: (err: any) => setError(err?.response?.data?.message || 'The package could not be saved.'),
  })
  const remove = useMutation({
    mutationFn: deleteTrainingPackage,
    onSuccess: () => { refresh(); close() },
    onError: (err: any) => setError(err?.response?.data?.message || 'The package could not be deleted.'),
  })

  const add = () => {
    setError('')
    setEditing({ new: true })
    setForm({ ...emptyPackage, order: String(packages.length) })
  }

  const edit = (item: any) => {
    setError('')
    setEditing(item)
    setForm({
      ...emptyPackage,
      ...item,
      // Packages created before these fields existed fall back to the form's defaults.
      audience: item.audience || (item.category === 'special' ? 'combo' : 'adult'),
      coachLevels: item.coachLevels || [],
      coachIds: (item.coachIds || []).map(String),
      discount: String(item.discount ?? 0),
      order: String(item.order ?? 0),
      // The package's own tiers, so a custom duration survives a round trip through this form.
      plans: (item.plans?.length ? item.plans : emptyPackage.plans).map((plan: any) => ({
        months: String(plan.months ?? ''),
        price: String(plan.price ?? ''),
        dollarPrice: String(plan.dollarPrice ?? ''),
      })),
    })
  }

  const upload = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile(file)
      if (url) setForm((old: any) => ({ ...old, image: url }))
    } finally { setUploading(false) }
  }

  const setPlan = (index: number, field: string, value: string) => setForm((old: any) => ({
    ...old,
    plans: old.plans.map((plan: any, planIndex: number) => planIndex === index ? { ...plan, [field]: value } : plan),
  }))
  const addPlan = () => setForm((old: any) => ({ ...old, plans: [...old.plans, { months: '', price: '', dollarPrice: '' }] }))
  const removePlan = (index: number) => setForm((old: any) => ({
    ...old,
    plans: old.plans.filter((_: any, planIndex: number) => planIndex !== index),
  }))

  const move = (item: any, direction: -1 | 1) => {
    const siblings = packages.filter((entry: any) => entry.category === item.category)
    const index = siblings.findIndex((entry: any) => entry._id === item._id)
    if (index + direction < 0 || index + direction >= siblings.length) return

    const reordered = [...siblings]
    ;[reordered[index], reordered[index + direction]] = [reordered[index + direction], reordered[index]]

    // Orders are rewritten from the resulting positions rather than swapped, so packages
    // that ended up sharing an order value still settle into a stable sequence.
    setError('')
    Promise.all(reordered
      .map((entry: any, position: number) => ({ entry, position }))
      .filter(({ entry, position }) => entry.order !== position)
      .map(({ entry, position }) => updateTrainingPackage({ id: entry._id, payload: { ...entry, order: position } })))
      .then(refresh)
      .catch(() => setError('The packages could not be reordered.'))
  }

  const submit = (event: any) => {
    event.preventDefault()
    setError('')
    // Tiers left blank are dropped, so a package can sell a single duration.
    const plans = form.plans
      .filter((plan: any) => String(plan.price).trim() !== '')
      .map((plan: any) => ({ months: Number(plan.months), price: Number(plan.price), dollarPrice: Number(plan.dollarPrice) || 0 }))

    if (!plans.length) return setError('Add a price for at least one duration.')
    if (plans.some((plan: any) => !plan.months || plan.months < 1)) return setError('Every priced duration needs a length in months.')
    // Checkout picks a tier by its length, so two tiers cannot share the same number of months.
    if (new Set(plans.map((plan: any) => plan.months)).size !== plans.length) return setError('Each duration can only be listed once.')

    save.mutate({
      name: form.name,
      slug: slugify(form.slug || form.name),
      category: form.category,
      audience: form.audience,
      coachLevels: form.coachIds.length ? [] : form.coachLevels,
      coachIds: form.coachIds,
      discount: Number(form.discount) || 0,
      info: form.info,
      priceInfo: form.priceInfo,
      image: form.image,
      order: Number(form.order) || 0,
      active: form.active,
      plans,
    })
  }

  const sections = [
    { key: 'normal', title: 'Standard packages', note: 'Shown in the main training grid on the billing page.' },
    { key: 'special', title: 'Special packages', note: 'Shown under the “Special training plans” heading.' },
  ]

  return <div className="p-6 md:p-10 max-w-7xl mx-auto">
    <Header title="Training packages" subText="Create, price and publish the plans shown on the public membership pages and bought on a player's billing page">
      <Button onClick={add}><PackagePlus className="h-4 w-4 mr-2" />Add package</Button>
    </Header>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
      <InfoCard title="Total packages" info={packages.length} extraInfo="Across every membership page">
        <Layers className="h-4 w-4 text-muted-foreground" />
      </InfoCard>
      <InfoCard title="Visible" info={packages.filter((item: any) => item.active).length} extraInfo="Shown on the billing page">
        <Eye className="h-4 w-4 text-muted-foreground" />
      </InfoCard>
      <InfoCard title="Standard" info={packages.filter((item: any) => item.category === 'normal').length} extraInfo="In the main training grid">
        <PackagePlus className="h-4 w-4 text-muted-foreground" />
      </InfoCard>
      <InfoCard title="Special" info={packages.filter((item: any) => item.category === 'special').length} extraInfo="Family & couples style plans">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
      </InfoCard>
    </div>

    <Dialog open={Boolean(editing)} onOpenChange={isOpen => { if (!isOpen) close() }}>
      <DialogContent className="max-w-2xl max-h-[88vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 pr-10 border-b shrink-0">
          <DialogTitle>{editing?.new ? 'Add training package' : editing?.name}</DialogTitle>
          <DialogDescription>{editing?.new ? 'Set up a new plan for the billing page.' : 'Update pricing, coaches and visibility for this plan.'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 grid gap-6">
            {error && <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

            <FormSection title="Basics">
              <Field label="Package name"><Input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Regular Package" /></Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <Select value={form.category} onValueChange={value => setForm({ ...form, category: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Standard package</SelectItem>
                      <SelectItem value="special">Special package</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Membership page">
                  <Select value={form.audience} onValueChange={value => setForm({ ...form, audience: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AUDIENCES.map(audience => <SelectItem key={audience.value} value={audience.value}>{audience.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <p className="text-xs text-muted-foreground -mt-3">
                Shown to visitors on {AUDIENCES.find(audience => audience.value === form.audience)?.page}
              </p>

              {editing?.new
                ? <Field label="Payment reference">
                  <Input value={form.slug} onChange={event => setForm({ ...form, slug: slugify(event.target.value) })} placeholder={slugify(form.name) || 'regular'} />
                  <p className="text-xs text-muted-foreground">Letters and numbers only. Leave blank to build it from the name — it cannot be changed later.</p>
                </Field>
                : <Field label="Payment reference">
                  <Input value={form.slug} disabled />
                  <p className="text-xs text-muted-foreground">Fixed, because past payments and current subscribers point at it.</p>
                </Field>}
            </FormSection>

            <Separator />

            <FormSection title="Pricing">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Member discount (%)"><Input type="number" min="0" max="100" value={form.discount} onChange={event => setForm({ ...form, discount: event.target.value })} /></Field>
                <Field label="Display order"><Input type="number" min="0" value={form.order} onChange={event => setForm({ ...form, order: event.target.value })} /></Field>
              </div>

              <div className="grid gap-2">
                <Label>Durations and prices</Label>
                {/* Keyed by position, not by months — a months key would remount the input mid-edit. */}
                {form.plans.map((plan: any, index: number) => <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 border rounded-lg bg-muted/30 p-3 items-end" key={index}>
                  <Field label="Months"><Input type="number" min="1" value={plan.months} onChange={event => setPlan(index, 'months', event.target.value)} /></Field>
                  <Field label="Price (₦)"><Input type="number" min="0" value={plan.price} onChange={event => setPlan(index, 'price', event.target.value)} placeholder="Blank to drop" /></Field>
                  <Field label="Price ($)"><Input type="number" min="0" value={plan.dollarPrice} onChange={event => setPlan(index, 'dollarPrice', event.target.value)} /></Field>
                  <Button type="button" variant="ghost" size="icon" aria-label="Remove duration" disabled={form.plans.length < 2} onClick={() => removePlan(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>)}
                <div><Button type="button" variant="outline" size="sm" onClick={addPlan}><Plus className="h-4 w-4 mr-2" />Add duration</Button></div>
                <p className="text-xs text-muted-foreground">Players pick from these durations at checkout. Leave a price blank to drop that duration.</p>
              </div>
            </FormSection>

            <Separator />

            <FormSection title="Coaches">
              <div className="grid gap-2">
                <Label>Coach levels offered with this plan</Label>
                <div className="flex flex-wrap gap-2">
                  {COACH_LEVELS.map(level => {
                    const active = form.coachLevels.includes(level.value)
                    return <button type="button" key={level.value}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-muted'}`}
                      onClick={() => setForm({
                        ...form,
                        coachLevels: active ? form.coachLevels.filter((entry: string) => entry !== level.value) : [...form.coachLevels, level.value],
                      })}
                    >{level.label}</button>
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Narrows the coaches shown at step 2 of the membership form. Leave none selected to offer every coach.
                  {form.coachIds.length > 0 && ' Ignored while specific coaches are picked below.'}
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Specific coaches offered with this plan</Label>
                {!coaches.length
                  ? <p className="text-xs text-muted-foreground">No coaches created yet. Add them under Coaches first.</p>
                  : <div className="border rounded-lg divide-y max-h-44 overflow-y-auto">
                    {coaches.map((coach: any) => {
                      const checked = form.coachIds.includes(String(coach._id))
                      return <label className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-muted/50" key={coach._id}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={value => setForm({
                            ...form,
                            coachIds: value
                              ? [...form.coachIds, String(coach._id)]
                              : form.coachIds.filter((entry: string) => entry !== String(coach._id)),
                          })}
                        />
                        <span className="flex-1">{coach.coachName}</span>
                        <Badge variant="secondary" className="font-normal">{coach.level}</Badge>
                      </label>
                    })}
                  </div>}
                <p className="text-xs text-muted-foreground">When one or more coaches are picked, the membership form shows only these.</p>
              </div>
            </FormSection>

            <Separator />

            <FormSection title="Description">
              <Field label="Plan description">
                <Textarea required value={form.info} onChange={event => setForm({ ...form, info: event.target.value })} placeholder="Who this plan is for and where the training happens." />
              </Field>
              <Field label="Pricing note">
                <Textarea value={form.priceInfo} onChange={event => setForm({ ...form, priceInfo: event.target.value })} placeholder="Any extras included with the plan." />
              </Field>
            </FormSection>

            <Separator />

            <FormSection title="Media & visibility">
              <div className="flex items-center gap-4">
                {form.image && <div className="relative shrink-0">
                  <img src={form.image} className="h-24 w-36 object-cover rounded-lg border" alt="" />
                  <button type="button" aria-label="Remove image" className="absolute -top-2 -right-2 bg-foreground text-background rounded-full w-6 h-6 grid place-items-center text-sm leading-none" onClick={() => setForm({ ...form, image: '' })}>×</button>
                </div>}
                <label className="h-24 w-36 shrink-0 border border-dashed rounded-lg grid place-items-center cursor-pointer text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                  <span className="grid justify-items-center gap-1.5"><ImagePlus className="h-4 w-4" />{uploading ? 'Uploading…' : form.image ? 'Replace image' : 'Upload image'}</span>
                  <input className="hidden" type="file" accept="image/*" disabled={uploading} onChange={event => upload(event.target.files?.[0] || null)} />
                </label>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Visible on the billing page</p>
                  <p className="text-xs text-muted-foreground">Hide it to pull the plan from sale without deleting it.</p>
                </div>
                <Switch checked={form.active} onCheckedChange={checked => setForm({ ...form, active: checked })} />
              </div>
            </FormSection>
          </div>

          <div className="flex items-center justify-between gap-3 border-t px-6 py-4 shrink-0 bg-muted/20">
            {!editing?.new
              ? <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" disabled={remove.isPending} onClick={() => confirm(`Delete “${editing?.name}”? Players already on it keep their current plan.`) && remove.mutate(editing._id)}>
                <Trash2 className="h-4 w-4 mr-2" />{remove.isPending ? 'Deleting…' : 'Delete package'}
              </Button>
              : <span />}
            <Button disabled={save.isPending || uploading}>{save.isPending ? 'Saving…' : 'Save package'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {isLoading ? <p className="py-12 text-sm text-muted-foreground">Loading training packages…</p> : <div className="mt-8 grid gap-10">
      {sections.map(section => {
        const items = packages.filter((item: any) => item.category === section.key)
        return <section key={section.key}>
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="text-sm text-muted-foreground">{section.note}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{items.length} package{items.length === 1 ? '' : 's'}</span>
          </div>

          {!items.length
            ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No {section.title.toLowerCase()} yet.</div>
            : <div className="grid gap-3">{items.map((item: any, index: number) => <article className="border rounded-xl p-4 bg-card shadow-sm flex flex-wrap items-center gap-4 transition-colors hover:border-primary/30" key={item._id}>
              {item.image
                ? <img src={item.image} className="w-24 h-20 object-cover rounded-lg border" alt="" />
                : <div className="w-24 h-20 bg-muted grid place-items-center rounded-lg text-muted-foreground">
                    <PackagePlus className="h-6 w-6" />
                  </div>}

              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-semibold mr-1">{item.name}</h3>
                  <Badge variant="outline" className="font-mono font-normal text-muted-foreground">{item.slug}</Badge>
                  <Badge variant="secondary">
                    {AUDIENCES.find(audience => audience.value === (item.audience || (item.category === 'special' ? 'combo' : 'adult')))?.label}
                  </Badge>
                  {!item.active && <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Hidden</Badge>}
                  {item.discount > 0 && <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">{item.discount}% member discount</Badge>}
                  {(item.coachIds || []).length > 0
                    ? <Badge variant="secondary">{item.coachIds.length} linked coach{item.coachIds.length > 1 ? 'es' : ''}</Badge>
                    : (item.coachLevels || []).length > 0 && <Badge variant="secondary">{item.coachLevels.join(', ')} coaches</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {(item.plans || []).length
                    ? item.plans.map((plan: any) => `${plan.months} month${plan.months > 1 ? 's' : ''} · ${money(plan.price)}`).join('   ·   ')
                    : 'No prices set'}
                </p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.info}</p>
              </div>

              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" aria-label="Move up" disabled={index === 0} onClick={() => move(item, -1)}><ArrowUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" aria-label="Move down" disabled={index === items.length - 1} onClick={() => move(item, 1)}><ArrowDown className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => edit(item)}><Pencil className="h-4 w-4 mr-2" />Edit</Button>
              </div>
            </article>)}</div>}
        </section>
      })}
    </div>}
  </div>
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm"><span className="font-medium">{label}</span>{children}</label>
}

function FormSection({ title, children }: { title: string, children: React.ReactNode }) {
  return <section className="grid gap-4">
    <h3 className="text-sm font-semibold">{title}</h3>
    {children}
  </section>
}
