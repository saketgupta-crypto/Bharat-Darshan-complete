import PDFDocument from "pdfkit";
import { Response } from "express";

interface Act { verified?: boolean; time?: string; title?: string; description?: string; estimatedCost?: number; estimatedTravelTime?: string }
interface Day { day: number; placeIds?: string[]; route?: { distanceKm: number; durationMin?: number; source: string }; title?: string; morning?: Act[]; afternoon?: Act[]; evening?: Act[]; places?: string[]; food?: string[]; transport?: string; estimatedDailyCost?: number }
export interface PdfItinerary {
  title: string; destination: string; duration: number; overview?: string; destinationSummary?: string;
  bestApproach?: string; importantInfo?: string[]; warnings?: string[]; dataQuality?: string; verifiedAt?: string | Date;
  budgetBreakdown?: Record<string, number>; foodRecommendations?: { dish: string; note?: string; place?: string }[];
  attractions?: { id: string; name: string; category?: string; address?: string; lat: number; lon: number; sourceUrl?: string }[];
  sources?: { title: string; url: string; kind?: string }[];
  dailyPlans: Day[]; accommodationSuggestions?: string[]; estimatedTotalBudget?: number; tips?: string[]; safety?: string[]; disclaimer?: string;
}

// Built-in PDF fonts lack the rupee glyph, so amounts are written as "INR 1,500".
const inr = (v?: number) => `INR ${Math.round(v ?? 0).toLocaleString("en-IN")}`;

export function streamItineraryPdf(it: PdfItinerary, res: Response, filename: string) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename.replace(/[^a-z0-9-_.]/gi, "_")}.pdf"`);
  doc.pipe(res);

  doc.fillColor("#c2410c").fontSize(11).text("BHARAT DARSHAN", { characterSpacing: 2 });
  doc.fillColor("#111").fontSize(22).text(it.title);
  doc.fontSize(11).fillColor("#555").text(`${it.destination} - ${it.duration} day${it.duration > 1 ? "s" : ""}`).moveDown();
  const section = (h: string) => doc.moveDown(0.5).fillColor("#7c2d12").fontSize(14).text(h).fillColor("#111").fontSize(10.5);
  if (it.overview) { section("Overview"); doc.text(it.overview); }
  if (it.destinationSummary) { section("About the destination"); doc.text(it.destinationSummary); }

  if (it.bestApproach) { section("Best approach"); doc.text(it.bestApproach); }
  if (it.importantInfo?.length) { section("Important information"); it.importantInfo.forEach((t) => doc.text(`- ${t}`)); }
  const byId = new Map((it.attractions ?? []).map((a) => [a.id, a]));

  for (const d of it.dailyPlans) {
    section(`Day ${d.day}: ${d.title ?? ""}`);
    for (const [label, acts] of [["Morning", d.morning], ["Afternoon", d.afternoon], ["Evening", d.evening]] as const) {
      if (!acts?.length) continue;
      doc.font("Helvetica-Bold").text(label).font("Helvetica");
      for (const a of acts) doc.text(`- ${a.time ? a.time + ": " : ""}${a.title ?? ""}${a.description ? " - " + a.description : ""}${a.estimatedCost ? ` (est. ${inr(a.estimatedCost)})` : ""}${a.estimatedTravelTime ? ` [travel ~${a.estimatedTravelTime}]` : ""}${a.verified === false ? " (unverified)" : ""}`, { indent: 8 });
    }
    for (const id of d.placeIds ?? []) { const a = byId.get(id); if (a) doc.fontSize(9).fillColor("#555").text(`Place: ${a.name}${a.address ? ", " + a.address : ""} (${a.lat.toFixed(4)}, ${a.lon.toFixed(4)})`, { indent: 8 }).fillColor("#111").fontSize(10.5); }
    if (d.route) doc.fontSize(9).fillColor("#555").text(`Approx. distance: ${d.route.distanceKm} km (${d.route.source === "osrm" ? "road estimate, not live traffic" : "straight-line"})`).fillColor("#111").fontSize(10.5);
    if (d.food?.length) doc.text(`Food: ${d.food.join(", ")}`);
    if (d.transport) doc.text(`Transport: ${d.transport}`);
    if (d.estimatedDailyCost) doc.font("Helvetica-Bold").text(`Estimated day cost: ${inr(d.estimatedDailyCost)}`).font("Helvetica");
  }
  if (it.accommodationSuggestions?.length) { section("Accommodation ideas"); it.accommodationSuggestions.forEach((a) => doc.text(`- ${a}`)); }
  if (it.estimatedTotalBudget) {
    section("Estimated total budget (estimates, not quotes)"); doc.text(inr(it.estimatedTotalBudget));
    Object.entries(it.budgetBreakdown ?? {}).forEach(([k, v]) => doc.text(`- ${k.replace(/([A-Z])/g, " $1").toLowerCase()}: ${inr(v)}`, { indent: 8 }));
  }
  if (it.foodRecommendations?.length) { section("Food to try"); it.foodRecommendations.forEach((f) => doc.text(`- ${f.dish}${f.note ? ": " + f.note : ""}${f.place ? ` (${f.place})` : ""}`)); }
  if (it.tips?.length) { section("Travel tips"); it.tips.forEach((t) => doc.text(`- ${t}`)); }
  if (it.safety?.length) { section("Safety"); it.safety.forEach((t) => doc.text(`- ${t}`)); }
  if (it.sources?.length) { section("Sources"); doc.fontSize(8.5); it.sources.slice(0, 25).forEach((x) => doc.text(`${x.title}: ${x.url}`, { link: x.url })); doc.fontSize(10.5); }
  if (it.warnings?.length) { section("Data notes"); it.warnings.forEach((t) => doc.text(`- ${t}`)); }
  doc.moveDown().fontSize(9).fillColor("#777").text((it.disclaimer ?? "Prices, opening hours and travel times are estimates. Verify before booking.") + " Map data (c) OpenStreetMap contributors (ODbL).");
  doc.end();
}
