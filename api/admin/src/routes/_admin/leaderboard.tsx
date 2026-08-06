import Header from '@/components/blocks/header/header'
import { Input } from '@/components/ui/input'
import { getLeaders } from '@/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays, MapPin, Search, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/_admin/leaderboard')({ component: Leaderboard })

/**
 * Podium results, one entry per tournament.
 *
 * A leaderboard record is created when an admin assigns the three medals, so this page is a
 * read-only history: the interesting question is who won what and when, which the previous
 * layout could not answer because it showed three unlabelled faces and no names.
 */

const PODIUMS = [
  { key: 'gold', label: 'Gold', place: '1st', ring: 'ring-amber-400', chip: 'bg-amber-400/15 text-amber-600 dark:text-amber-400' },
  { key: 'silver', label: 'Silver', place: '2nd', ring: 'ring-slate-400', chip: 'bg-slate-400/15 text-slate-600 dark:text-slate-300' },
  { key: 'bronze', label: 'Bronze', place: '3rd', ring: 'ring-orange-700', chip: 'bg-orange-700/15 text-orange-700 dark:text-orange-500' },
] as const

const playerName = (player: any) => player?.fullName || player?.username || 'Unknown player'
const initial = (player: any) => playerName(player).trim().charAt(0).toUpperCase() || '?'

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date not set'
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Avatar({ player, className = '' }: { player: any, className?: string }) {
  return player?.picture
    ? <img src={player.picture} alt="" className={`object-cover bg-muted ${className}`} />
    : <span className={`grid place-items-center bg-muted font-semibold text-muted-foreground ${className}`}>{initial(player)}</span>
}

function Leaderboard() {
  const [search, setSearch] = useState('')
  const { data: leaders = [], isLoading, isError } = useQuery({ queryKey: ['leaders'], queryFn: getLeaders })

  // Newest tournament first. The API returns them reversed already, but a record with no
  // date should not be able to jump the list.
  const sorted = useMemo(() => [...leaders].sort(
    (a: any, b: any) => new Date(b?.tour?.date || 0).getTime() - new Date(a?.tour?.date || 0).getTime(),
  ), [leaders])

  const results = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return sorted
    // Searching by player matters as much as by tournament — "where did this player medal?"
    return sorted.filter((item: any) => [
      item?.tour?.name, item?.tour?.location, item?.tour?.category,
      ...PODIUMS.map(podium => playerName(item?.[podium.key])),
      ...PODIUMS.map(podium => item?.[podium.key]?.username),
    ].some(field => String(field || '').toLowerCase().includes(term)))
  }, [sorted, search])

  // How many distinct players have ever stood on a podium, and who has done it most.
  const { medallists, mostDecorated } = useMemo(() => {
    const counts = new Map<string, { name: string, total: number }>()
    for (const item of leaders as any[]) {
      for (const podium of PODIUMS) {
        const player = item?.[podium.key]
        if (!player?._id) continue
        const existing = counts.get(player._id)
        counts.set(player._id, { name: playerName(player), total: (existing?.total || 0) + 1 })
      }
    }
    const top = [...counts.values()].sort((a, b) => b.total - a.total)[0]
    return { medallists: counts.size, mostDecorated: top }
  }, [leaders])

  const stats = [
    { label: 'Tournaments recorded', value: leaders.length },
    { label: 'Players medalled', value: medallists },
    { label: 'Most decorated', value: mostDecorated ? mostDecorated.name : '—', note: mostDecorated ? `${mostDecorated.total} medal${mostDecorated.total > 1 ? 's' : ''}` : undefined },
  ]

  return <div className="p-6 md:p-10 max-w-7xl mx-auto">
    <Header title="Tournament Leaderboard" subText="Podium results from every tournament, newest first">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 w-full sm:w-72"
          placeholder="Search tournament or player…"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </div>
    </Header>

    <div className="grid gap-3 sm:grid-cols-3 mt-8">
      {stats.map(stat => <div className="rounded-xl border bg-card p-5" key={stat.label}>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
        <strong className="mt-2 block truncate text-2xl">{stat.value}</strong>
        {stat.note && <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>}
      </div>)}
    </div>

    {isLoading && <p className="py-14 text-center text-sm text-muted-foreground">Loading results…</p>}

    {isError && <p className="mt-8 rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
      The leaderboard could not be loaded. Refresh to try again.
    </p>}

    {!isLoading && !isError && !results.length && <div className="mt-8 rounded-xl border border-dashed p-14 text-center">
      <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold">{leaders.length ? 'No matching results' : 'No results recorded yet'}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {leaders.length
          ? 'No tournament or player matches that search.'
          : 'Assign gold, silver and bronze on a tournament and the podium will appear here.'}
      </p>
    </div>}

    <div className="mt-8 grid gap-4">
      {results.map((item: any) => <article className="overflow-hidden rounded-xl border bg-card" key={item._id}>
        <div className="flex flex-wrap items-center gap-4 border-b p-5">
          {item?.tour?.tournamentImgURL
            ? <img src={item.tour.tournamentImgURL} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
            : <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold">ATP</div>}

          <div className="min-w-[200px] flex-1">
            <h2 className="font-semibold">{item?.tour?.name || 'Tournament removed'}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(item?.tour?.date)}</span>
              {item?.tour?.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{item.tour.location}</span>}
            </p>
          </div>

          {item?.tour?.category && <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{item.tour.category}</span>}
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-3">
          {PODIUMS.map(podium => {
            const player = item?.[podium.key]
            return <div className="flex items-center gap-3 bg-card p-5" key={podium.key}>
              <Avatar player={player} className={`h-12 w-12 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-card ${podium.ring}`} />
              <div className="min-w-0">
                <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${podium.chip}`}>
                  {podium.place} · {podium.label}
                </span>
                <p className="mt-1 truncate font-medium">{playerName(player)}</p>
                {player?.username && <p className="truncate text-xs text-muted-foreground">@{player.username}</p>}
              </div>
            </div>
          })}
        </div>
      </article>)}
    </div>
  </div>
}
