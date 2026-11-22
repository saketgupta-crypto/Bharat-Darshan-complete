import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Sparkles,
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  Compass,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ItineraryView from "@/components/ItineraryView";
import { useToast } from "@/hooks/use-toast";
import { errMsg } from "@/services/api";
import { itineraryService } from "@/services/itinerary.service";
import type { Itinerary } from "@/types";

// `id` values are the travel styles the backend accepts; labels keep the existing Bharat Darshan wording.
const TRAVEL_STYLES = [
  { id: "Historical", label: "🏰 Royal Heritage" },
  { id: "Spiritual", label: "🪔 Spiritual & Ghats" },
  { id: "Budget", label: "🎒 Backpacker" },
  { id: "Luxury", label: "✨ Luxury Retreat" },
];

const INTEREST_TAGS = [
  "Ancient Temples",
  "Forts & Palaces",
  "Local Street Food",
  "Ghat Aarti & Boat Rides",
  "Handicrafts & Bazaars",
  "Nature & Wildlife",
  "Photography Spots",
  "Ayurveda & Wellness",
];

const TRANSPORT = ["Any", "Train", "Bus", "Car / Taxi", "Flight", "Local transport only"];
const STAY = ["Any", "Budget", "Mid-range", "Heritage / Boutique", "Luxury", "Hostel"];
const labelCls = "mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground";
const selectCls = "h-12 w-full rounded-xl border border-input bg-background px-3 text-sm";

export const ItineraryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [destination, setDestination] = useState(
    searchParams.get("destination") || ""
  );
  const [days, setDays] = useState(Number(searchParams.get("days")) || 4);
  const [budget, setBudget] = useState("25000");
  const [travelers, setTravelers] = useState("2");
  const [travelStyle, setTravelStyle] = useState("Historical");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Ancient Temples",
    "Local Street Food",
  ]);
  // Optional extras (all may stay empty)
  const [startingLocation, setStartingLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [children, setChildren] = useState("0");
  const [transportation, setTransportation] = useState("Any");
  const [accommodation, setAccommodation] = useState("Any");
  const [dietary, setDietary] = useState("");
  const [extra, setExtra] = useState("");

  const [loading, setLoading] = useState(false);
  // Real progress messages streamed from the backend (no simulated percentages).
  const [progress, setProgress] = useState<string[]>([]);
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);

  const toggleInterest = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      toast({
        title: "Destination required",
        description: "Please enter an Indian city, state, or circuit (e.g., Varanasi, Rajasthan).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgress([]);
    setGeneratedItinerary(null);

    try {
      const plan = await itineraryService.generateWithProgress(
        {
          destination: destination.trim(),
          startingLocation: startingLocation.trim(),
          duration: Math.min(15, Math.max(1, Number(days) || 1)),
          budget: Math.max(0, Number(budget) || 0),
          adults: Math.max(1, Number(travelers) || 1),
          children: Math.max(0, Number(children) || 0),
          travelStyle,
          interests: selectedInterests,
          transportation,
          accommodation,
          dietary: dietary.trim(),
          specialRequirements: extra.trim(),
          ...(startDate ? { startDate } : {}),
        },
        (msg) => setProgress((p) => (p[p.length - 1] === msg ? p : [...p, msg]))
      );
      setGeneratedItinerary(plan);
    } catch (err) {
      toast({
        title: "Could not generate your itinerary",
        description: errMsg(err, "Please make sure you are signed in and try again shortly."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* TOP BANNER */}
      <section className="relative overflow-hidden border-b border-border/60 bg-secondary/40 py-12">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <Badge className="mb-3 bg-primary/15 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Bharat Darshan AI Studio
          </Badge>
          <h1 className="font-serif-display text-3xl font-bold tracking-tight sm:text-5xl">
            Craft Your Bespoke Indian Yatra
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Tell us where you want to go, your pace, and your budget. Our cultural AI builds a day-by-day route from real, map-verified places with local dining and cost estimates.
          </p>
        </div>
      </section>

      <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SHOW BUILDER FORM WHEN NO ITINERARY IS ACTIVE */}
        {!generatedItinerary && !loading && (
          <Card className="mx-auto max-w-3xl rounded-3xl border-border/70 shadow-lg">
            <CardContent className="p-6 sm:p-10">
              <form onSubmit={handleGenerate} className="space-y-7">
                {/* Destination & Days Row */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> Destination / Circuit
                    </label>
                    <Input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g., Varanasi, Jaipur & Udaipur, Kerala"
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> Duration (Days)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={15}
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                {/* Budget & Travelers Row */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <IndianRupee className="h-3.5 w-3.5 text-primary" /> Total Budget (INR)
                    </label>
                    <Input
                      type="number"
                      step="1000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="25000"
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" /> Travelers
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={travelers}
                      onChange={(e) => setTravelers(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                {/* Travel Style Selector */}
                <div>
                  <label className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Compass className="h-3.5 w-3.5 text-primary" /> Travel Style
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {TRAVEL_STYLES.map((style) => {
                      const active = travelStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setTravelStyle(style.id)}
                          className={`rounded-2xl border p-3 text-center text-xs font-semibold transition-all ${
                            active
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : "border-border/70 bg-background hover:bg-secondary"
                          }`}
                        >
                          {style.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cultural Interests Multi-Select */}
                <div>
                  <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                     Must-Have Experiences
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_TAGS.map((tag) => {
                      const selected = selectedInterests.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleInterest(tag)}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                            selected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-secondary text-secondary-foreground hover:bg-primary/15"
                          }`}
                        >
                          {selected ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional details (collapsed by default) */}
                <details className="group rounded-2xl border border-border/70 bg-secondary/30 p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    More options (optional)
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Starting Location</label>
                      <Input value={startingLocation} onChange={(e) => setStartingLocation(e.target.value)} placeholder="e.g., Lucknow" className="h-12 rounded-xl" maxLength={100} />
                    </div>
                    <div>
                      <label className={labelCls}>Travel Start Date</label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 rounded-xl" />
                    </div>
                    <div>
                      <label className={labelCls}>Children</label>
                      <Input type="number" min={0} max={20} value={children} onChange={(e) => setChildren(e.target.value)} className="h-12 rounded-xl" />
                    </div>
                    <div>
                      <label className={labelCls}>Transportation</label>
                      <select value={transportation} onChange={(e) => setTransportation(e.target.value)} className={selectCls}>
                        {TRANSPORT.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Accommodation</label>
                      <select value={accommodation} onChange={(e) => setAccommodation(e.target.value)} className={selectCls}>
                        {STAY.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Dietary Preferences</label>
                      <Input value={dietary} onChange={(e) => setDietary(e.target.value)} placeholder="e.g., Vegetarian, Jain" className="h-12 rounded-xl" maxLength={80} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Additional Requirements</label>
                      <Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="e.g., elderly parents, wheelchair access" className="h-12 rounded-xl" maxLength={500} />
                    </div>
                  </div>
                </details>

                <Button
                  type="submit"
                  size="lg"
                  className="h-13 w-full rounded-2xl text-base font-bold shadow-md"
                >
                  <Sparkles className="mr-2 h-5 w-5" /> Generate My Bharat Itinerary
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* MULTI-STEP ANIMATED LOADING SCREEN */}
        {loading && (
          <div className="mx-auto my-12 max-w-xl rounded-3xl border border-border/70 bg-card p-8 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="mt-5 font-serif-display text-2xl font-bold">
              Designing Your {days}-Day {destination} Odyssey...
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              This can take up to a minute: we look up real places first, then plan your days.
            </p>

            <div className="mt-6 space-y-3 text-left" aria-live="polite">
              {progress.length === 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-xs font-medium">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                  <span>Connecting...</span>
                </div>
              )}
              {progress.map((stepText, idx) => {
                const isCurrent = idx === progress.length - 1;
                return (
                  <div
                    key={stepText}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-xs font-medium transition-all ${
                      isCurrent
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground"
                    }`}
                  >
                    {isCurrent ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    )}
                    <span>{stepText}...</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GENERATED ITINERARY VIEW */}
        {generatedItinerary && !loading && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGeneratedItinerary(null)}
                className="rounded-xl"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Plan Another Trip
              </Button>
            </div>

            <ItineraryView itinerary={generatedItinerary} editable onChange={setGeneratedItinerary} onDeleted={() => setGeneratedItinerary(null)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryPage;