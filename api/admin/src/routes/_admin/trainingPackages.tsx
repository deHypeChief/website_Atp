import {
  createTrainingPackage,
  deleteTrainingPackage,
  getCoaches,
  getTrainingPackages,
  updateTrainingPackage,
} from '@/apis/endpoints'
import Header from '@/components/blocks/header/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCloudinary } from '@/hooks/use-cloudinary'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, ImagePlus, PackagePlus, Pencil, Plus, Trash2, X } from 'lucide-react'
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

    {error && <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

    {editing && <form onSubmit={submit} className="mt-6 border rounded-xl p-6 bg-card grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{editing.new ? 'Add training package' : `Edit ${editing.name}`}</h2>
        <Button type="button" variant="ghost" size="icon" onClick={close}><X /></Button>
      </div>

      <Field label="Package name"><Input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Regular Package" /></Field>

      <Field label="Category">
        <select className="border rounded-md px-3 py-2 bg-background text-sm h-10" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}>
          <option value="normal">Standard package</option>
          <option value="special">Special package</option>
        </select>
      </Field>

      <Field label="Membership page">
        <select className="border rounded-md px-3 py-2 bg-background text-sm h-10" value={form.audience} onChange={event => setForm({ ...form, audience: event.target.value })}>
          {AUDIENCES.map(audience => <option key={audience.value} value={audience.value}>{audience.label}</option>)}
        </select>
        <span className="text-xs text-muted-foreground">
          Where visitors pick this plan: {AUDIENCES.find(audience => audience.value === form.audience)?.page}
        </span>
      </Field>

      <Field label="Member discount (%)"><Input type="number" min="0" max="100" value={form.discount} onChange={event => setForm({ ...form, discount: event.target.value })} /></Field>
      <Field label="Display order"><Input type="number" min="0" value={form.order} onChange={event => setForm({ ...form, order: event.target.value })} /></Field>

      <div className="md:col-span-2 grid gap-2 text-sm">
        <p>Coach levels offered with this plan</p>
        <div className="flex flex-wrap gap-4">
          {COACH_LEVELS.map(level => <label className="flex items-center gap-2" key={level.value}>
            <input
              type="checkbox"
              checked={form.coachLevels.includes(level.value)}
              onChange={event => setForm({
                ...form,
                coachLevels: event.target.checked
                  ? [...form.coachLevels, level.value]
                  : form.coachLevels.filter((entry: string) => entry !== level.value),
              })}
            />
            {level.label}
          </label>)}
        </div>
        <span className="text-xs text-muted-foreground">
          Narrows the coaches shown at step 2 of the membership form. Tick none to offer every coach.
          {form.coachIds.length > 0 && ' Ignored while specific coaches are picked below.'}
        </span>
      </div>

      <div className="md:col-span-2 grid gap-2 text-sm">
        <p>Specific coaches offered with this plan</p>
        {!coaches.length
          ? <span className="text-xs text-muted-foreground">No coaches created yet. Add them under Coaches first.</span>
          : <div className="flex flex-wrap gap-x-4 gap-y-2">
            {coaches.map((coach: any) => <label className="flex items-center gap-2" key={coach._id}>
              <input
                type="checkbox"
                checked={form.coachIds.includes(String(coach._id))}
                onChange={event => setForm({
                  ...form,
                  coachIds: event.target.checked
                    ? [...form.coachIds, String(coach._id)]
                    : form.coachIds.filter((entry: string) => entry !== String(coach._id)),
                })}
              />
              {coach.coachName}<span className="text-xs text-muted-foreground">({coach.level})</span>
            </label>)}
          </div>}
        <span className="text-xs text-muted-foreground">
          When one or more coaches are picked, the membership form shows only these — the level filter above is not used.
        </span>
      </div>

      {editing.new
        ? <Field label="Payment reference (letters and numbers only)">
          <Input value={form.slug} onChange={event => setForm({ ...form, slug: slugify(event.target.value) })} placeholder={slugify(form.name) || 'regular'} />
          <span className="text-xs text-muted-foreground">Used on the payment record. Leave blank to build it from the name. It cannot be changed later.</span>
        </Field>
        : <Field label="Payment reference">
          <Input value={form.slug} disabled />
          <span className="text-xs text-muted-foreground">Fixed, because past payments and current subscribers point at it.</span>
        </Field>}

      <label className="flex items-end gap-2 text-sm pb-2">
        <input type="checkbox" checked={form.active} onChange={event => setForm({ ...form, active: event.target.checked })} />
        Visible on the billing page
      </label>

      <label className="grid gap-2 text-sm md:col-span-2">Description
        <Textarea required value={form.info} onChange={event => setForm({ ...form, info: event.target.value })} placeholder="Who this plan is for and where the training happens." />
      </label>

      <label className="grid gap-2 text-sm md:col-span-2">Pricing note
        <Textarea value={form.priceInfo} onChange={event => setForm({ ...form, priceInfo: event.target.value })} placeholder="Any extras included with the plan." />
      </label>

      <div className="md:col-span-2 grid gap-3">
        <p className="text-sm font-medium">Durations and prices</p>
        {/* Keyed by position, not by months — a months key would remount the input mid-edit. */}
        {form.plans.map((plan: any, index: number) => <div className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 border rounded-lg p-4 items-end" key={index}>
          <Field label="Duration (months)"><Input type="number" min="1" value={plan.months} onChange={event => setPlan(index, 'months', event.target.value)} /></Field>
          <Field label="Price (₦)"><Input type="number" min="0" value={plan.price} onChange={event => setPlan(index, 'price', event.target.value)} placeholder="Leave blank to drop" /></Field>
          <Field label="Price ($)"><Input type="number" min="0" value={plan.dollarPrice} onChange={event => setPlan(index, 'dollarPrice', event.target.value)} /></Field>
          <Button type="button" variant="ghost" size="icon" aria-label="Remove duration" disabled={form.plans.length < 2} onClick={() => removePlan(index)}><Trash2 className="h-4 w-4" /></Button>
        </div>)}
        <div>
          <Button type="button" variant="outline" size="sm" onClick={addPlan}><Plus className="h-4 w-4 mr-2" />Add duration</Button>
        </div>
        <p className="text-xs text-muted-foreground">Players pick from these durations at checkout. Leave a price blank to drop that duration.</p>
      </div>

      <div className="md:col-span-2">
        <p className="text-sm mb-2">Package image</p>
        <div className="flex items-center gap-4">
          {form.image && <div className="relative">
            <img src={form.image} className="h-28 w-44 object-cover rounded border" alt="" />
            <button type="button" aria-label="Remove image" className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6" onClick={() => setForm({ ...form, image: '' })}>×</button>
          </div>}
          <label className="h-28 w-44 border border-dashed rounded grid place-items-center cursor-pointer text-sm">
            <span className="grid justify-items-center gap-2"><ImagePlus />{uploading ? 'Uploading…' : form.image ? 'Replace image' : 'Upload image'}</span>
            <input className="hidden" type="file" accept="image/*" disabled={uploading} onChange={event => upload(event.target.files?.[0] || null)} />
          </label>
        </div>
      </div>

      <div className="md:col-span-2 flex justify-between">
        {!editing.new
          ? <Button type="button" variant="ghost" className="text-destructive" disabled={remove.isPending} onClick={() => confirm(`Delete “${editing.name}”? Players already on it keep their current plan.`) && remove.mutate(editing._id)}>
            <Trash2 className="h-4 w-4 mr-2" />{remove.isPending ? 'Deleting…' : 'Delete package'}
          </Button>
          : <span />}
        <Button disabled={save.isPending || uploading}>{save.isPending ? 'Saving…' : 'Save package'}</Button>
      </div>
    </form>}

    {isLoading ? <p className="py-12">Loading training packages…</p> : <div className="mt-8 grid gap-10">
      {sections.map(section => {
        const items = packages.filter((item: any) => item.category === section.key)
        return <section key={section.key}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="text-sm text-muted-foreground">{section.note}</p>
          </div>

          {!items.length
            ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No {section.title.toLowerCase()} yet.</div>
            : <div className="grid gap-3">{items.map((item: any, index: number) => <article className="border rounded-xl p-4 bg-card flex flex-wrap items-center gap-4" key={item._id}>
              {item.image
                ? <img src={item.image} className="w-24 h-20 object-cover rounded" alt="" />
                : <div className="w-24 h-20 bg-muted grid place-items-center font-bold rounded text-xs">NO IMAGE</div>}

              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{item.name}</h3>
                  <span className="text-xs bg-muted px-2 py-1 rounded">{item.slug}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {AUDIENCES.find(audience => audience.value === (item.audience || (item.category === 'special' ? 'combo' : 'adult')))?.label}
                  </span>
                  {!item.active && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Hidden</span>}
                  {item.discount > 0 && <span className="text-xs bg-primary/10 px-2 py-1 rounded">{item.discount}% member discount</span>}
                  {(item.coachIds || []).length > 0
                    ? <span className="text-xs bg-muted px-2 py-1 rounded">
                        {item.coachIds.length} linked coach{item.coachIds.length > 1 ? 'es' : ''}
                      </span>
                    : (item.coachLevels || []).length > 0 && <span className="text-xs bg-muted px-2 py-1 rounded">
                        {item.coachLevels.join(', ')} coaches
                      </span>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {(item.plans || []).length
                    ? item.plans.map((plan: any) => `${plan.months} month${plan.months > 1 ? 's' : ''} · ${money(plan.price)}`).join('   |   ')
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
  return <label className="grid gap-2 text-sm">{label}{children}</label>
}
