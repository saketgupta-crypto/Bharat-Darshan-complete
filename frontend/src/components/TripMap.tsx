import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Attraction, DailyPlan } from "@/types"

const COLORS = ["#c2410c", "#0f766e", "#7c3aed", "#b45309", "#be123c", "#1d4ed8", "#4d7c0f", "#a21caf"]
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

interface Props { attractions: Attraction[]; days: DailyPlan[]; activeDay?: number | null; height?: number }

/** Leaflet + OpenStreetMap tiles (free, no API key). Attribution is always shown. */
export default function TripMap({ attractions, days, activeDay, height = 380 }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!el.current || map.current) return
    map.current = L.map(el.current, { scrollWheelZoom: false }).setView([22.5, 79], 4)
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => { map.current?.remove(); map.current = null }
  }, [])

  useEffect(() => {
    const m = map.current, g = layer.current
    if (!m || !g) return
    g.clearLayers()
    const byId = new Map(attractions.map((a) => [a.id, a]))
    const bounds: L.LatLngTuple[] = []
    days.forEach((d, di) => {
      if (activeDay && activeDay !== d.day) return
      const color = COLORS[di % COLORS.length]
      if (d.route?.coordinates?.length) {
        L.polyline(d.route.coordinates.map(([lon, lat]) => [lat, lon] as L.LatLngTuple), { color, weight: 4, opacity: 0.75 })
          .bindTooltip(`Day ${d.day}: ~${d.route.distanceKm} km (road estimate, not live traffic)`).addTo(g)
      } else {
        const pts = (d.placeIds ?? []).flatMap((id) => (byId.get(id) ? [[byId.get(id)!.lat, byId.get(id)!.lon] as L.LatLngTuple] : []))
        if (pts.length > 1) L.polyline(pts, { color, weight: 3, opacity: 0.6, dashArray: "6 8" }).bindTooltip(`Day ${d.day}: straight-line connection`).addTo(g)
      }
      ;(d.placeIds ?? []).forEach((id, i) => {
        const a = byId.get(id); if (!a) return
        bounds.push([a.lat, a.lon])
        const icon = L.divIcon({ className: "", iconSize: [26, 26], iconAnchor: [13, 13],
          html: `<div style="background:${color};color:#fff;width:26px;height:26px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font:600 11px sans-serif;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">${d.day}.${i + 1}</div>` })
        L.marker([a.lat, a.lon], { icon }).addTo(g).bindPopup(
          `<strong>${esc(a.name)}</strong><br/><small>Day ${d.day} · ${esc(a.category ?? "place")}</small>` +
          (a.address ? `<br/>${esc(a.address)}` : "") + `<br/><small>${a.lat.toFixed(5)}, ${a.lon.toFixed(5)}</small>` +
          (a.description ? `<br/><small>${esc(a.description.slice(0, 160))}…</small>` : "") +
          `<br/><a href="${esc(a.sourceUrl)}" target="_blank" rel="noopener noreferrer">OpenStreetMap source</a>`)
      })
    })
    if (bounds.length) m.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 15 })
    setTimeout(() => m.invalidateSize(), 0)
  }, [attractions, days, activeDay])

  return <div ref={el} style={{ height }} className="w-full overflow-hidden rounded-2xl border border-border/70 z-0" role="region" aria-label="Trip map" />
}
