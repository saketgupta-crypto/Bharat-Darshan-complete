import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Sparkles,
  Compass,
  Hotel,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Map,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DestinationCard from "@/components/DestinationCard";

const QUICK_CATEGORIES = [
  { label: "Spiritual & Ghats", query: "Spiritual", image: "/kashi-ghat.jpeg" },
  { label: "Royal Forts & Palaces", query: "Heritage", image: "/hawa.jpeg" },
  { label: "Serene Backwaters", query: "Nature", image: "/kerala.jpeg" },
  { label: "Thar Desert Safaris", query: "Desert", image: "/desert.jpeg" },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"destinations" | "hotels" | "guides" | "ai">("destinations");
  const [searchQuery, setSearchQuery] = useState("");
  const [days, setDays] = useState("5");
  const [featuredDestinations, setFeaturedDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
    fetch(`${baseUrl}/destinations?limit=4`)
      .then((res) => res.json())
      .then((resData) => {
        const items = resData?.data?.items || resData?.data || resData?.destinations || [];
        setFeaturedDestinations(Array.isArray(items) ? items.slice(0, 4) : []);
      })
      .catch(() => setFeaturedDestinations([]))
      .finally(() => setLoading(false));
  }, []);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = encodeURIComponent(searchQuery.trim());
    if (activeTab === "ai") {
      navigate(`/itinerary?destination=${q}&days=${days}`);
    } else if (activeTab === "hotels") {
      navigate(`/hotels${q ? `?search=${q}` : ""}`);
    } else if (activeTab === "guides") {
      navigate(`/guides${q ? `?search=${q}` : ""}`);
    } else {
      navigate(`/destinations${q ? `?search=${q}` : ""}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden px-4 py-20">
        <img
          src="/beautiful-indian-landscape-taj-mahal-golden-hour.jpg"
          alt="Bharat Darshan Golden Hour"
          className="absolute inset-0 h-full w-full object-cover object-center scale-105 animate-in fade-in duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />

        <div className="relative z-10 mx-auto max-w-4xl text-center text-white">
          <Badge className="mb-5 border-amber-400/40 bg-amber-500/20 px-4 py-1.5 text-xs uppercase tracking-widest text-amber-200 backdrop-blur-md">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-300" />
            AI-Powered Cultural Travel Companion
          </Badge>

          <h1 className="font-serif-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Experience the Timeless Soul of{" "}
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
              Bharat
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
            Discover sacred ghats, royal palaces, verified local storytellers, and bespoke AI-crafted itineraries tailored to your budget.
          </p>

          {/* FLOATING MULTI-MODE SEARCH CONSOLE */}
          <div className="mt-8 rounded-2xl border border-white/20 bg-white/95 p-3 text-foreground shadow-2xl backdrop-blur-xl dark:bg-slate-900/95 sm:p-4">
            {/* Mode Tabs */}
            <div className="mb-3 flex flex-wrap gap-1.5 border-b border-border/60 pb-3">
              {[
                { id: "destinations", label: "Explore Places", icon: Compass },
                { id: "ai", label: "AI Trip Planner", icon: Sparkles },
                { id: "hotels", label: "Heritage Stays", icon: Hotel },
                { id: "guides", label: "Local Guides", icon: UserCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleHeroSubmit} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === "ai"
                      ? "Where in India do you want your AI itinerary? (e.g., Varanasi, Jaipur, Kerala)"
                      : `Search ${activeTab} by city, state, or theme...`
                  }
                  className="h-12 border-border/80 bg-background pl-10 text-sm"
                />
              </div>

              {activeTab === "ai" && (
                <select
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="h-12 rounded-xl border border-border/80 bg-background px-4 text-sm font-medium"
                >
                  <option value="3">3 Days Trip</option>
                  <option value="5">5 Days Trip</option>
                  <option value="7">7 Days Trip</option>
                  <option value="10">10 Days Trip</option>
                </select>
              )}

              <Button type="submit" size="lg" className="h-12 rounded-xl px-8 font-semibold">
                {activeTab === "ai" ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Plan
                  </>
                ) : (
                  <>Search</>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* CURATED HERITAGE THEMES */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Curated Trails
            </p>
            <h2 className="mt-1 font-serif-display text-3xl font-bold">
              Explore Bharat by Mood
            </h2>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            View all destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {QUICK_CATEGORIES.map((item) => (
            <Link
              key={item.label}
              to={`/destinations?category=${encodeURIComponent(item.query)}`}
              className="group relative h-44 overflow-hidden rounded-2xl border border-border/50"
            >
              <img
                src={item.image}
                alt={item.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="font-serif-display text-lg font-semibold">{item.label}</p>
                <span className="text-xs text-amber-300">Explore trail →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED DESTINATIONS WITH SHIMMER SKELETON FALLBACK */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Iconic Landmarks
            </p>
            <h2 className="mt-1 font-serif-display text-3xl font-bold">
              Trending Destinations
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="aspect-[4/5] w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDestinations.map((dest) => (
              <DestinationCard key={dest._id} destination={dest} />
            ))}
          </div>
        )}
      </section>

      {/* VALUE PROPOSITION BANNER */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-3xl border border-border/60 bg-secondary/50 p-8 md:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-bold">AI Day-by-Day Routes</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Smart morning, afternoon, and evening schedules with realistic local transit & budget splits.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-bold">Verified Local Guides</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect directly with vetted regional experts fluent in your preferred language.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-bold">Instant PDF & Share Links</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Export your custom itinerary for offline travel or share a live link with family and friends.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;