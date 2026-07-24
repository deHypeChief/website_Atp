import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Radio, Save, TicketCheck, Trash2, Users } from 'lucide-react'
import Header from '@/components/blocks/header/header'
import InfoCard from '@/components/blocks/infoCard/infoCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { toast } from '@/hooks/use-toast'
import { columns } from '@/assets/tables/matches/colums'
import { MatchTable } from '@/assets/tables/matches/dataTable'
import { getMatchCentreAdmin, getMatches, saveMatchCentre, verifyToken } from '../../apis/endpoints'
import '../../assets/style/routes/matches.css'

type Player = { _id: string; fullName?: string; username?: string; email?: string; level?: string }
type Tournament = { _id: string; name: string; category?: string; date?: string; registeredPlayers: Player[] }
type ScoreMatch = {
  _id?: string
  playerOne: string
  playerTwo: string
  court: string
  status: 'scheduled' | 'live' | 'finished'
  scoreOne: number[]
  scoreTwo: number[]
}
type DrawDraft = {
  stage: string
  status: 'upcoming' | 'live' | 'completed'
  published: boolean
  matches: ScoreMatch[]
}

const emptyDraft = (): DrawDraft => ({ stage: 'Main draw', status: 'upcoming', published: false, matches: [] })
const playerId = (player: Player | string | undefined) => typeof player === 'string' ? player : player?._id || ''
const parseScores = (value: string) => value.split(/[ ,]+/).filter(Boolean).map(Number).filter(Number.isFinite).map((score) => Math.max(0, Math.trunc(score)))
const playerName = (player: Player) => player.fullName || player.username || player.email || 'ATP player'

export const Route = createFileRoute('/_admin/matches')({ component: () => <Matches /> })

function Matches() {
  const queryClient = useQueryClient()
  const { data: registrations = [] } = useQuery({ queryKey: ['match'], queryFn: getMatches })
  const { data: desk, isLoading: deskLoading } = useQuery({ queryKey: ['match-centre-admin'], queryFn: getMatchCentreAdmin })
  const tournaments: Tournament[] = desk?.tournaments || []
  const draws = desk?.draws || []
  const [selectedTournamentId, setSelectedTournamentId] = useState('')
  const [draft, setDraft] = useState<DrawDraft>(emptyDraft)

  useEffect(() => {
    if (!selectedTournamentId && tournaments.length) setSelectedTournamentId(tournaments[0]._id)
  }, [selectedTournamentId, tournaments])

  const selectedTournament = useMemo(
    () => tournaments.find((tournament) => tournament._id === selectedTournamentId),
    [selectedTournamentId, tournaments],
  )

  useEffect(() => {
    if (!selectedTournamentId) return
    const saved = draws.find((draw: any) => playerId(draw.tournament) === selectedTournamentId)
    if (!saved) {
      setDraft(emptyDraft())
      return
    }
    setDraft({
      stage: saved.stage || 'Main draw',
      status: saved.status || 'upcoming',
      published: Boolean(saved.published),
      matches: (saved.matches || []).map((match: any) => ({
        _id: match._id,
        playerOne: playerId(match.playerOne),
        playerTwo: playerId(match.playerTwo),
        court: match.court || 'FT',
        status: match.status || 'scheduled',
        scoreOne: match.scoreOne || [],
        scoreTwo: match.scoreTwo || [],
      })),
    })
  }, [selectedTournamentId, desk])

  const saveMutation = useMutation({
    mutationFn: () => saveMatchCentre({ tournamentId: selectedTournamentId, payload: draft }),
    onSuccess: (result) => {
      toast({ title: draft.published ? 'Match centre published' : 'Draft saved', description: result.message })
      queryClient.invalidateQueries({ queryKey: ['match-centre-admin'] })
    },
    onError: (error: any) => toast({
      variant: 'destructive',
      title: 'Match centre not saved',
      description: error.response?.data?.message || 'Check the pairings and try again.',
    }),
  })

  const addPairing = () => {
    const players = selectedTournament?.registeredPlayers || []
    if (players.length < 2) return
    const used = new Set(draft.matches.flatMap((match) => [match.playerOne, match.playerTwo]))
    const available = players.filter((player) => !used.has(player._id))
    const pair = available.length >= 2 ? available : players
    setDraft((current) => ({
      ...current,
      matches: [...current.matches, {
        playerOne: pair[0]._id,
        playerTwo: pair[1]._id,
        court: `C${current.matches.length + 1}`,
        status: 'scheduled',
        scoreOne: [],
        scoreTwo: [],
      }],
    }))
  }

  const pairAllPlayers = () => {
    const players = selectedTournament?.registeredPlayers || []
    const pairings: ScoreMatch[] = []
    for (let index = 0; index + 1 < players.length; index += 2) {
      pairings.push({
        playerOne: players[index]._id,
        playerTwo: players[index + 1]._id,
        court: `C${pairings.length + 1}`,
        status: 'scheduled',
        scoreOne: [],
        scoreTwo: [],
      })
    }
    setDraft((current) => ({ ...current, matches: pairings }))
  }

  const updatePairing = (index: number, patch: Partial<ScoreMatch>) => {
    setDraft((current) => ({
      ...current,
      matches: current.matches.map((match, matchIndex) => matchIndex === index ? { ...match, ...patch } : match),
    }))
  }

  const removePairing = (index: number) => {
    setDraft((current) => ({ ...current, matches: current.matches.filter((_, matchIndex) => matchIndex !== index) }))
  }

  return (
    <div className="matches">
      <Header title="Matches & live draw" subText="Verify tickets, pair registered players and publish scores to the player desk.">
        <TicketVerifier queryClient={queryClient} />
      </Header>

      <section className="matchCentreDesk">
        <header className="matchCentreMasthead">
          <div>
            <span><i /> LIVE OPERATIONS</span>
            <h2>Match Centre</h2>
            <p>Build the draw from paid registrations, then publish every court update to players.</p>
          </div>
          <div className="matchCentreSignal">
            <Radio />
            <span>{draft.published ? 'PLAYER DESK LIVE' : 'ADMIN DRAFT'}</span>
          </div>
        </header>

        <div className="matchCentreToolbar">
          <label>
            Tournament
            <select value={selectedTournamentId} onChange={(event) => setSelectedTournamentId(event.target.value)} disabled={deskLoading}>
              {!tournaments.length && <option value="">No tournaments available</option>}
              {tournaments.map((tournament) => <option key={tournament._id} value={tournament._id}>{tournament.name}</option>)}
            </select>
          </label>
          <label>
            Draw stage
            <input value={draft.stage} onChange={(event) => setDraft({ ...draft, stage: event.target.value })} placeholder="Quarter-finals" />
          </label>
          <label>
            Tournament status
            <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as DrawDraft['status'] })}>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label className="publishToggle">
            <input type="checkbox" checked={draft.published} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} />
            <span><strong>Publish to players</strong><small>Show this draw in Match Centre</small></span>
          </label>
        </div>

        <div className="matchCentreSummary">
          <div><Users /><strong>{selectedTournament?.registeredPlayers.length || 0}</strong><span>registered players</span></div>
          <div><Radio /><strong>{draft.matches.filter((match) => match.status === 'live').length}</strong><span>live courts</span></div>
          <nav>
            <button onClick={pairAllPlayers} disabled={(selectedTournament?.registeredPlayers.length || 0) < 2}>Pair all players</button>
            <button onClick={addPairing} disabled={(selectedTournament?.registeredPlayers.length || 0) < 2}><Plus /> Add match</button>
          </nav>
        </div>

        <div className="pairingBoard">
          {!draft.matches.length ? (
            <div className="pairingEmpty">
              <Radio />
              <h3>No courts in this draw.</h3>
              <p>Pair registered players to start the match centre.</p>
            </div>
          ) : draft.matches.map((match, index) => (
            <article className={`pairingRow ${match.status}`} key={match._id || `${match.playerOne}-${match.playerTwo}-${index}`}>
              <div className="courtNumber">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <input aria-label={`Court ${index + 1}`} value={match.court} onChange={(event) => updatePairing(index, { court: event.target.value })} />
              </div>
              <div className="pairingPlayers">
                <label>
                  Player one
                  <select value={match.playerOne} onChange={(event) => updatePairing(index, { playerOne: event.target.value })}>
                    {(selectedTournament?.registeredPlayers || []).map((player) => <option key={player._id} value={player._id}>{playerName(player)}</option>)}
                  </select>
                </label>
                <label>
                  Player two
                  <select value={match.playerTwo} onChange={(event) => updatePairing(index, { playerTwo: event.target.value })}>
                    {(selectedTournament?.registeredPlayers || []).map((player) => <option key={player._id} value={player._id}>{playerName(player)}</option>)}
                  </select>
                </label>
              </div>
              <div className="pairingScores">
                <label>Player one sets<input inputMode="numeric" value={match.scoreOne.join(' ')} onChange={(event) => updatePairing(index, { scoreOne: parseScores(event.target.value) })} placeholder="6 4 6" /></label>
                <label>Player two sets<input inputMode="numeric" value={match.scoreTwo.join(' ')} onChange={(event) => updatePairing(index, { scoreTwo: parseScores(event.target.value) })} placeholder="4 6 2" /></label>
              </div>
              <div className="pairingState">
                <label>Status
                  <select value={match.status} onChange={(event) => updatePairing(index, { status: event.target.value as ScoreMatch['status'] })}>
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="finished">Finished</option>
                  </select>
                </label>
                <button aria-label={`Remove match ${index + 1}`} onClick={() => removePairing(index)}><Trash2 /></button>
              </div>
            </article>
          ))}
        </div>

        <footer className="matchCentreFooter">
          <p>{draft.published ? 'Saved updates reach the player drawer on its next refresh (within 15 seconds).' : 'This draw remains private until publishing is enabled.'}</p>
          <Button onClick={() => saveMutation.mutate()} disabled={!selectedTournamentId || saveMutation.isPending}>
            <Save /> {saveMutation.isPending ? 'Saving…' : draft.published ? 'Save & publish' : 'Save draft'}
          </Button>
        </footer>
      </section>

      <div className="userContent matchRegistrationArchive">
        <div className="userrDataTop">
          <InfoCard title="Registrations" info={registrations.length} extraInfo="Tournament tickets created"><Users className="h-4 w-4 text-muted-foreground" /></InfoCard>
          <InfoCard title="Published draws" info={draws.filter((draw: any) => draw.published).length} extraInfo="Visible in player Match Centre"><Radio className="h-4 w-4 text-muted-foreground" /></InfoCard>
        </div>
        <div className="userData"><MatchTable data={registrations} columns={columns} /></div>
      </div>
    </div>
  )
}

function TicketVerifier({ queryClient }: { queryClient: ReturnType<typeof useQueryClient> }) {
  const mutation = useMutation({
    mutationFn: (data: { token?: string }) => {
      const token = data.token || ''
      const cleanToken = token.startsWith('ATP-') ? token.substring(4) : token
      return verifyToken({ token: `ATP-${cleanToken}` })
    },
    onSuccess: (data) => {
      toast({ title: 'Token valid', description: data.message })
      queryClient.invalidateQueries({ queryKey: ['match'] })
    },
    onError: (error: any) => toast({ variant: 'destructive', title: 'Token verification error', description: error.response?.data?.message }),
  })
  const FormSchema = z.object({ token: z.string().min(6, { message: 'Token must be 6 characters.' }) })
  const form = useForm<z.infer<typeof FormSchema>>({ resolver: zodResolver(FormSchema), defaultValues: { token: '' } })

  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="default"><TicketCheck /> Verify ticket</Button></DialogTrigger>
      <DialogContent className="sm:max-w-[375px]">
        <DialogHeader><DialogTitle>Verify ticket</DialogTitle><DialogDescription>Add the last six characters of the ticket pin.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form className="w-full" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <FormField control={form.control} name="token" render={({ field }) => <FormItem><FormControl><Input className="w-full" placeholder="Enter last 6 characters" {...field} /></FormControl><FormMessage /></FormItem>} />
            <div className="footerBase"><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Verifying…' : 'Verify ticket'}</Button></div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
