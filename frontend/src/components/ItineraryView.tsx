import React, { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, BadgeCheck, Calendar, CheckCircle2, ChevronDown, Download, ExternalLink, IndianRupee, Lightbulb, Loader2, MapPin, Moon, Pencil, RefreshCw, Route as RouteIcon, Save, Share2, ShieldAlert, Sparkles, Sun, Sunset, Trash2, Utensils, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TripMap from "@/components/TripMap"
import { useToast } from "@/hooks/use-toast"
import { errMsg } from "@/services/api"
import { itineraryService } from "@/services/itinerary.service"
import type { Activity, DailyPlan, Itinerary } from "@/types"

export interface ItineraryViewProps {
  itinerary: Itinerary
  /** Owner view: enables regenerate / edit / share / delete. */
  editable?: boolean
  onChange?: (it: Itinerary) => void
  onDeleted?: () => void
}

const SLOTS = [
  { key: "morning", label: "Morning", Icon: Sun, tone: "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300" },
  { key: "afternoon", label: "Afternoon", Icon: Sunset, tone: "text-orange-600 bg-orange-100 dark:bg-orange-950 dark:text-orange-300" },
  { key: "evening", label: "Evening", Icon: Moon, tone: "text-indigo-600 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300" },
] as const
const BUDGET_LABELS: Record<string, string> = { accommodation: "Stay", food: "Food & dining", localTransport: "Local transport", intercityTransport: "Intercity transport", tickets: "Entry tickets", activities: "Activities", miscellaneous: "Miscellaneous" }
const inr = (n?: number) => `₹${Math.round(n ?? 0).toLocaleString("en-IN")}`

export const ItineraryView: React.FC<ItineraryViewProps> = ({ itinerary: it, editable, onChange, onDeleted }) => {
  const { toast } = useToast()
  const days = it.dailyPlans ?? []
  const [open, setOpen] = useState<Set<number>>(() => new Set(days.slice(0, 1).map((d) => d.day)))
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState<DailyPlan | null>(null)
  const [instruction, setInstruction] = useState("")
  const [shareToken, setShareToken] = useState<string | null>(it.isShared ? it.shareToken ?? null : null)
  const byId = useMemo(() => new Map((it.attractions ?? []).map((a) => [a.id, a])), [it.attractions])

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label)
    try { await fn() } catch (e) { toast({ title: "Something went wrong", description: errMsg(e), variant: "destructive" }) } finally { setBusy(null) }
  }
  const toggle = (d: number) => setOpen((s) => { const n = new Set(s); n.has(d) ? n.delete(d) : n.add(d); return n })
  const jump = (d: number) => { setActiveDay(d); setOpen((s) => new Set(s).add(d)); document.getElementById(`itinerary-day-${d}`)?.scrollIntoView({ behavior: "smooth", block: "start" }) }

  const regenDay = (d: number) => run(`day-${d}`, async () => { onChange?.(await itineraryService.regenerate(it._id, d)); toast({ title: `Day ${d} regenerated` }) })
  const regenAll = () => { if (!confirm("Regenerate the whole itinerary? Manual edits will be replaced.")) return; run("all", async () => { onChange?.(await itineraryService.regenerate(it._id)); toast({ title: "Itinerary regenerated" }) }) }
  const modify = () => instruction.trim().length >= 3 && run("modify", async () => { onChange?.(await itineraryService.modify(it._id, instruction.trim())); setInstruction(""); toast({ title: "Itinerary updated" }) })
  const saveEdit = () => draft && run("edit", async () => {
    const dailyPlans = days.map((d) => (d.day === draft.day ? draft : d))
    onChange?.(await itineraryService.update(it._id, { dailyPlans })); setEditing(null); setDraft(null); toast({ title: "Changes saved" })
  })
  const share = () => run("share", async () => {
    const r = await itineraryService.share(it._id, !shareToken)
    setShareToken(r.isShared ? r.shareToken : null)
    if (r.isShared && r.shareToken) { await navigator.clipboard?.writeText(`${location.origin}/shared-itinerary/${r.shareToken}`).catch(() => undefined); toast({ title: "Share link copied" }) } else toast({ title: "Sharing turned off" })
  })
  const remove = () => { if (!confirm("Delete this itinerary permanently?")) return; run("delete", async () => { await itineraryService.remove(it._id); onDeleted?.() }) }

  const setAct = (slot: "morning" | "afternoon" | "evening", i: number, patch: Partial<Activity>) =>
    setDraft((d) => d && { ...d, [slot]: (d[slot] ?? []).map((a, j) => (j === i ? { ...a, ...patch } : a)) })
  const delAct = (slot: "morning" | "afternoon" | "evening", i: number) => setDraft((d) => d && { ...d, [slot]: (d[slot] ?? []).filter((_, j) => j !== i) })

  const bd = it.budgetBreakdown
  const verifiedCount = it.attractions?.length ?? 0
  const travellers = (it.travellers?.adults ?? 0) + (it.travellers?.children ?? 0)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* OVERVIEW */}
      <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/15 text-primary hover:bg-primary/20"><MapPin className="mr-1 h-3.5 w-3.5" />{it.destination}</Badge>
              <Badge variant="outline"><Calendar className="mr-1 h-3.5 w-3.5" />{it.duration} {it.duration === 1 ? "Day" : "Days"}</Badge>
              {travellers > 0 && <Badge variant="outline">{travellers} traveller{travellers > 1 ? "s" : ""}</Badge>}
              {it.travelStyle && <Badge variant="secondary">{it.travelStyle}</Badge>}
              {it.estimatedTotalBudget ? <Badge variant="outline"><IndianRupee className="mr-1 h-3.5 w-3.5" />est. {inr(it.estimatedTotalBudget)}</Badge> : null}
              {editable && <Badge variant="secondary"><Save className="mr-1 h-3.5 w-3.5" />Saved to <Link to="/dashboard/trips" className="ml-1 underline">My Trips</Link></Badge>}
            </div>
            <h1 className="mt-3 font-serif-display text-2xl font-bold sm:text-4xl">{it.title}</h1>
            {it.overview && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{it.overview}</p>}
            {it.bestApproach && <p className="mt-2 max-w-3xl text-sm"><span className="font-semibold">Best approach: </span>{it.bestApproach}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {editable && it._id && <Button size="sm" className="rounded-xl" onClick={() => run("pdf", () => itineraryService.downloadPdf(it._id, it.title))} disabled={!!busy}>{busy === "pdf" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Download PDF</Button>}
            {editable && <>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={share} disabled={!!busy}><Share2 className="mr-2 h-4 w-4" />{shareToken ? "Stop sharing" : "Share link"}</Button>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={regenAll} disabled={!!busy}>{busy === "all" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}Regenerate all</Button>
              <Button variant="ghost" size="sm" className="rounded-xl text-destructive" onClick={remove} disabled={!!busy}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
            </>}
          </div>
        </div>

        <div className={`mt-5 flex items-start gap-2 rounded-2xl px-4 py-3 text-xs ${it.dataQuality === "good" ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300" : "bg-amber-500/10 text-amber-800 dark:text-amber-300"}`}>
          {it.dataQuality === "good" ? <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          <p>
            {verifiedCount > 0 ? `${verifiedCount} places are matched to real OpenStreetMap${it.verifiedAt ? ` data (checked ${new Date(it.verifiedAt).toLocaleDateString()})` : " data"}. ` : "No place could be matched to verified map data; suggestions are AI-generated and marked unverified. "}
            Prices, opening hours and travel times are estimates, not live information. {it.warnings?.join(" ")}
          </p>
        </div>
        {it.importantInfo && it.importantInfo.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{it.importantInfo.map((t, i) => <li key={i}>{t}</li>)}</ul>}
      </div>

      {editable && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-secondary/40 p-4 sm:flex-row">
          <Input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder='Ask AI to change the plan, e.g. "add more street food" or "make day 2 more relaxed"' className="rounded-xl bg-background" maxLength={500} onKeyDown={(e) => e.key === "Enter" && modify()} />
          <Button className="rounded-xl" onClick={modify} disabled={!!busy || instruction.trim().length < 3}>{busy === "modify" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Apply with AI</Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT */}
        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-2xl border-border/60">
            <CardHeader className="pb-3"><CardTitle className="text-base font-bold">Day-by-Day Jump</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {days.map((d) => <button key={d.day} type="button" onClick={() => jump(d.day)} className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${activeDay === d.day ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-secondary-foreground hover:bg-primary/15"}`}>Day {d.day}</button>)}
              <button type="button" onClick={() => { setActiveDay(null); setOpen(new Set(open.size === days.length ? [] : days.map((d) => d.day))) }} className="rounded-xl border border-dashed px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary">{open.size === days.length ? "Collapse all" : "Expand all"}</button>
            </CardContent>
          </Card>

          {(bd || it.estimatedTotalBudget) && (
            <Card className="rounded-2xl border-border/60">
              <CardHeader className="pb-3"><CardTitle className="flex items-center justify-between text-base font-bold"><span>Estimated Budget</span><span className="text-lg text-primary">{inr(it.estimatedTotalBudget)}</span></CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {bd && Object.entries(bd).filter(([, v]) => typeof v === "number").map(([k, v]) => <div key={k} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-none"><span className="text-muted-foreground">{BUDGET_LABELS[k] ?? k}</span><span className="font-semibold">{inr(v)}</span></div>)}
                {!!it.budget && <p className="pt-1 text-xs text-muted-foreground">Your budget: {inr(it.budget)}</p>}
                <p className="text-[11px] leading-snug text-muted-foreground">All amounts are AI estimates for the whole group. Opening hours and entry prices were not verified with official sources; please check before you go.</p>
              </CardContent>
            </Card>
          )}

          {it.tips && it.tips.length > 0 && (
            <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300"><Lightbulb className="h-4 w-4" /> Traveler Tips</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">{it.tips.map((t, i) => <p key={i} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /><span>{t}</span></p>)}</CardContent>
            </Card>
          )}
          {it.safety && it.safety.length > 0 && (
            <Card className="rounded-2xl border-rose-500/30 bg-rose-500/5">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-300"><ShieldAlert className="h-4 w-4" /> Safety</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">{it.safety.map((t, i) => <p key={i} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" /><span>{t}</span></p>)}</CardContent>
            </Card>
          )}
        </aside>

        {/* RIGHT */}
        <div className="space-y-6 lg:col-span-8">
          {days.map((d) => {
            const isOpen = open.has(d.day), isEditing = editing === d.day && draft
            const cur = isEditing ? draft! : d
            return (
              <div key={d.day} id={`itinerary-day-${d.day}`} className="scroll-mt-24 rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:border-primary/40">
                <button type="button" onClick={() => toggle(d.day)} className="flex w-full items-center gap-3 p-6 text-left sm:px-8" aria-expanded={isOpen}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">D{d.day}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Day {d.day}{d.estimatedDailyCost ? ` · est. ${inr(d.estimatedDailyCost)}` : ""}{d.route ? ` · ~${d.route.distanceKm} km ${d.route.source === "osrm" ? "by road" : "straight-line"}` : ""}</p>
                    <h3 className="truncate font-serif-display text-xl font-bold">{d.title}</h3>
                  </div>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="space-y-5 border-t border-border/60 px-6 pb-6 pt-5 sm:px-8">
                    {editable && (
                      <div className="flex flex-wrap justify-end gap-2">
                        {isEditing ? <>
                          <Button size="sm" className="rounded-xl" onClick={saveEdit} disabled={!!busy}>{busy === "edit" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button>
                          <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => { setEditing(null); setDraft(null) }}><X className="mr-2 h-4 w-4" />Cancel</Button>
                        </> : <>
                          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => { setEditing(d.day); setDraft(structuredClone(d)) }} disabled={!!busy}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
                          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => regenDay(d.day)} disabled={!!busy}>{busy === `day-${d.day}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}Regenerate day</Button>
                        </>}
                      </div>
                    )}
                    {isEditing && <Input value={cur.title} onChange={(e) => setDraft({ ...cur, title: e.target.value })} className="rounded-xl font-semibold" maxLength={150} />}

                    <div className="relative space-y-5 before:absolute before:bottom-3 before:left-4 before:top-3 before:w-0.5 before:bg-border">
                      {SLOTS.map(({ key, label, Icon, tone }) => {
                        const acts = (cur[key] ?? []) as Activity[]
                        if (!acts.length) return null
                        return (
                          <div key={key} className="relative pl-11">
                            <span className={`absolute left-1.5 top-1 flex h-6 w-6 items-center justify-center rounded-full ${tone}`}><Icon className="h-3.5 w-3.5" /></span>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                            <div className="mt-2 space-y-3">
                              {acts.map((a, i) => {
                                const place = a.placeId ? byId.get(a.placeId) : undefined
                                return (
                                  <div key={i} className="rounded-2xl border border-border/50 bg-background/60 p-3">
                                    {isEditing ? (
                                      <div className="space-y-2">
                                        <div className="flex gap-2"><Input value={a.title ?? ""} onChange={(e) => setAct(key, i, { title: e.target.value })} className="rounded-lg" /><Input type="number" min={0} value={a.estimatedCost ?? 0} onChange={(e) => setAct(key, i, { estimatedCost: Math.max(0, Number(e.target.value) || 0) })} className="w-28 rounded-lg" aria-label="Estimated cost" /><Button type="button" size="icon" variant="ghost" onClick={() => delAct(key, i)} aria-label="Remove activity"><Trash2 className="h-4 w-4" /></Button></div>
                                        <Input value={a.description ?? ""} onChange={(e) => setAct(key, i, { description: e.target.value })} className="rounded-lg" />
                                      </div>
                                    ) : (<>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-semibold">{a.time ? <span className="mr-1.5 font-normal text-muted-foreground">{a.time}</span> : null}{a.title}</p>
                                        {a.verified ? <Badge variant="secondary" className="gap-1 text-[10px]"><BadgeCheck className="h-3 w-3 text-emerald-600" />Verified place</Badge> : <Badge variant="outline" className="text-[10px] text-muted-foreground">Unverified suggestion</Badge>}
                                      </div>
                                      {a.description && <p className="mt-1 text-sm leading-relaxed text-foreground/85">{a.description}</p>}
                                      <p className="mt-1 text-xs text-muted-foreground">{[a.durationMinutes ? `${a.durationMinutes} min` : "", a.estimatedTravelTime ? `travel ~${a.estimatedTravelTime}` : "", a.estimatedCost ? `est. ${inr(a.estimatedCost)}` : ""].filter(Boolean).join(" · ")}</p>
                                      {place && <p className="mt-1 text-xs text-muted-foreground">📍 {place.address ? `${place.address} · ` : ""}{place.lat.toFixed(4)}, {place.lon.toFixed(4)} · <a className="inline-flex items-center gap-0.5 text-primary underline" href={place.sourceUrl} target="_blank" rel="noopener noreferrer">source <ExternalLink className="h-3 w-3" /></a></p>}
                                    </>)}
                                  </div>)
                              })}
                            </div>
                          </div>)
                      })}
                    </div>

                    {(d.food?.length || d.transport || d.route) && (
                      <div className="flex flex-col gap-2 rounded-2xl bg-secondary/60 px-4 py-3 text-xs">
                        {!!d.food?.length && <div className="flex items-center gap-2 font-medium"><Utensils className="h-4 w-4 shrink-0 text-primary" /><span>Must try: {d.food.join(" • ")}</span></div>}
                        {d.transport && <div className="flex items-center gap-2 text-muted-foreground"><RouteIcon className="h-4 w-4 shrink-0 text-primary" /><span>{d.transport}</span></div>}
                        {d.route && <p className="text-muted-foreground">{d.route.source === "osrm" ? `Road distance ≈ ${d.route.distanceKm} km${d.route.durationMin ? `, ≈ ${d.route.durationMin} min driving without traffic` : ""} (OSRM estimate, not live traffic).` : `Straight-line distance ≈ ${d.route.distanceKm} km between stops; actual road distance will be longer.`}</p>}
                      </div>
                    )}
                    <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setActiveDay(activeDay === d.day ? null : d.day)}><MapPin className="mr-2 h-4 w-4" />{activeDay === d.day ? "Show all days on map" : "Show this day on map"}</Button>
                  </div>
                )}
              </div>)
          })}
        </div>
      </div>

      {/* MAP */}
      {verifiedCount > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif-display text-2xl font-bold">Route map</h2>
          <TripMap attractions={it.attractions ?? []} days={days} activeDay={activeDay} />
          <p className="text-xs text-muted-foreground">Markers are numbered day.stop. Dashed lines are straight-line connections; solid lines are OSRM road-route estimates (no live traffic).</p>
        </section>
      )}

      {/* ATTRACTIONS */}
      {verifiedCount > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif-display text-2xl font-bold">Places on this trip</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {it.attractions!.map((a) => (
              <Card key={a.id} className="rounded-2xl border-border/60"><CardContent className="space-y-2 p-4 text-sm">
                <div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{a.name}</h3><Badge variant="secondary" className="shrink-0 text-[10px] capitalize">{a.category}</Badge></div>
                {a.description && <p className="text-xs leading-relaxed text-muted-foreground">{a.description}</p>}
                {a.address && <p className="text-xs">{a.address}</p>}
                <p className="text-[11px] text-muted-foreground">{a.lat.toFixed(5)}, {a.lon.toFixed(5)}</p>
                {a.openingHours && <p className="text-[11px] text-muted-foreground">Hours (OSM, may be outdated): {a.openingHours}</p>}
                <div className="flex flex-wrap gap-3 text-xs">
                  <a className="inline-flex items-center gap-0.5 text-primary underline" href={a.sourceUrl} target="_blank" rel="noopener noreferrer">OpenStreetMap <ExternalLink className="h-3 w-3" /></a>
                  {a.wikipediaUrl && <a className="inline-flex items-center gap-0.5 text-primary underline" href={a.wikipediaUrl} target="_blank" rel="noopener noreferrer">Wikipedia <ExternalLink className="h-3 w-3" /></a>}
                  {a.website && <a className="inline-flex items-center gap-0.5 text-primary underline" href={a.website} target="_blank" rel="noopener noreferrer">Official site <ExternalLink className="h-3 w-3" /></a>}
                </div>
              </CardContent></Card>))}
          </div>
        </section>
      )}

      {/* FOOD + STAYS */}
      {(!!it.foodRecommendations?.length || !!it.accommodationSuggestions?.length) && (
        <div className="grid gap-6 md:grid-cols-2">
          {!!it.foodRecommendations?.length && <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Utensils className="h-4 w-4 text-primary" />Food to try</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
            {it.foodRecommendations.map((f, i) => <p key={i}><span className="font-semibold">{f.dish}</span>{f.note ? ` — ${f.note}` : ""}{f.place && <> · <a className="text-primary underline" href={f.sourceUrl} target="_blank" rel="noopener noreferrer">{f.place}</a></>}</p>)}
            <p className="text-[11px] text-muted-foreground">Dishes are general regional knowledge; named restaurants come from OpenStreetMap listings (hours and prices not verified).</p></CardContent></Card>}
          {!!it.accommodationSuggestions?.length && <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-base">Where to stay</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
            {it.accommodationSuggestions.map((s, i) => <p key={i}>{s}</p>)}
            <div className="flex flex-wrap gap-3 text-xs">{it.accommodationPlaces?.map((p) => <a key={p.sourceUrl} className="text-primary underline" href={p.sourceUrl} target="_blank" rel="noopener noreferrer">{p.name} (map)</a>)}</div>
            <p className="text-[11px] text-muted-foreground">No live availability or room prices are shown. Check the hotel directly before booking.</p></CardContent></Card>}
        </div>
      )}

      {!!it.groundedNotes?.length && <Card className="rounded-2xl border-border/60"><CardHeader className="pb-2"><CardTitle className="text-base">Recent notes (AI web search, not verified)</CardTitle></CardHeader><CardContent className="space-y-1 text-xs text-muted-foreground">{it.groundedNotes.map((n, i) => <p key={i}>• {n}</p>)}</CardContent></Card>}

      {/* SOURCES */}
      {!!it.sources?.length && (
        <section className="space-y-2">
          <h2 className="font-serif-display text-xl font-bold">Sources</h2>
          <ul className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">{it.sources.map((s) => <li key={s.url} className="truncate"><a className="text-primary underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul>
          <p className="text-[11px] text-muted-foreground">Map data © OpenStreetMap contributors (ODbL). Descriptions from Wikipedia. {it.aiModel ? `Itinerary composed by ${it.aiModel}.` : ""} {it.disclaimer}</p>
        </section>
      )}
    </div>
  )
}

export default ItineraryView
