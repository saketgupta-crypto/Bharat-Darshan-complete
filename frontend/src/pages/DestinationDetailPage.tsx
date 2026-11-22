import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Calendar,
  IndianRupee,
  Sparkles,
  Heart,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Compass,
  Hotel,
  UserCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataState from "@/components/DataState";
import HotelCard from "@/components/HotelCard";
import GuideCard from "@/components/GuideCard";
import ReviewsSection from "@/components/ReviewsSection";
import { useToast } from "@/hooks/use-toast";

export const DestinationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [destination, setDestination] = useState<any | null>(null);
  const [relatedHotels, setRelatedHotels] = useState<any[]>([]);
  const [relatedGuides, setRelatedGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tripDays, setTripDays] = useState(4);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

    try {
      const res = await fetch(`${baseUrl}/destinations/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Destination not found");

      const destData = json?.data?.destination || json?.data || json;
      setDestination(destData);

      // Fetch nearby hotels & guides in parallel based on destination name/state
      const queryTerm = encodeURIComponent(destData?.name || destData?.state || "");
      const [hotelsRes, guidesRes] = await Promise.allSettled([
        fetch(`${baseUrl}/hotels?search=${queryTerm}&limit=4`).then((r) => r.json()),
        fetch(`${baseUrl}/guides?search=${queryTerm}&limit=4`).then((r) => r.json()),
      ]);

      if (hotelsRes.status === "fulfilled") {
        const hItems =
          hotelsRes.value?.data?.items ||
          hotelsRes.value?.data ||
          hotelsRes.value?.hotels ||
          [];
        setRelatedHotels(Array.isArray(hItems) ? hItems.slice(0, 4) : []);
      }

      if (guidesRes.status === "fulfilled") {
        const gItems =
          guidesRes.value?.data?.items ||
          guidesRes.value?.data ||
          guidesRes.value?.guides ||
          [];
        setRelatedGuides(Array.isArray(gItems) ? gItems.slice(0, 4) : []);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load destination details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Share this destination with your fellow travelers.",
    });
  };

  if (loading || error || !destination) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <DataState
          loading={loading}
          error={error}
          empty={!loading && !destination}
          count={4}
          onRetry={fetchDetails}
        />
      </div>
    );
  }

  const images: string[] =
    destination.images?.length > 0
      ? destination.images
      : [
          "/beautiful-indian-landscape-taj-mahal-golden-hour.jpg",
          "/kashi-ghat.jpeg",
          "/hawa.jpeg",
          "/varanasi.jpeg",
        ];

  const highlights: string[] =
    destination.highlights?.length > 0
      ? destination.highlights
      : [
          "Sunrise heritage walk & architectural storytelling",
          "Authentic regional culinary trail & local bazaars",
          "Sacred evening rituals & cultural performances",
          "Guided photography spots away from crowds",
        ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* TOP BREADCRUMB & ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/destinations")}
            className="rounded-xl text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Destinations
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="rounded-xl"
            >
              <Heart
                className={`mr-1.5 h-4 w-4 ${
                  isFavorite ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              {isFavorite ? "Saved" : "Save"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-xl"
            >
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
          </div>
        </div>

        {/* TITLE & METADATA HEADER */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/15 text-primary">
              {destination.category || "Cultural Heritage"}
            </Badge>
            <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {destination.state || "India"}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {Number(destination.rating || 4.8).toFixed(1)}
            </span>
          </div>

          <h1 className="mt-2 font-serif-display text-3xl font-bold tracking-tight sm:text-5xl">
            {destination.name}
          </h1>
        </div>

        {/* BENTO PHOTO GALLERY */}
        <div className="mt-6 grid h-[340px] grid-cols-1 gap-3 overflow-hidden rounded-3xl sm:h-[460px] md:grid-cols-4">
          <div className="relative h-full overflow-hidden bg-muted md:col-span-2">
            <img
              src={images[0]}
              alt={destination.name}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="hidden grid-cols-1 gap-3 md:col-span-2 md:grid md:grid-rows-2">
            <div className="relative overflow-hidden bg-muted">
              <img
                src={images[1] || images[0]}
                alt={`${destination.name} view 2`}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative overflow-hidden bg-muted">
                <img
                  src={images[2] || images[0]}
                  alt={`${destination.name} view 3`}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="relative overflow-hidden bg-muted">
                <img
                  src={images[3] || images[0]}
                  alt={`${destination.name} view 4`}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN CONTENT + STICKY AI PLANNER */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column: Overview, Highlights, Stays, Guides, Reviews */}
          <div className="space-y-10 lg:col-span-8">
            {/* Quick Fact Strip */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Best Season
                  </p>
                  <p className="text-sm font-bold">
                    {destination.bestTimeToVisit || "October – March"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Ideal Duration
                  </p>
                  <p className="text-sm font-bold">
                    {destination.idealDuration || "3 – 5 Days"}
                  </p>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Avg. Daily Cost
                  </p>
                  <p className="text-sm font-bold">
                    ₹{Number(destination.estimatedBudget || 3500).toLocaleString("en-IN")} / day
                  </p>
                </div>
              </div>
            </div>

            {/* Cultural Overview */}
            <div>
              <h2 className="font-serif-display text-2xl font-bold">
                About {destination.name}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                {destination.description ||
                  `${destination.name} is one of Bharat's most revered cultural destinations, blending centuries of architectural mastery, living traditions, and unforgettable local hospitality.`}
              </p>
            </div>

            {/* Key Experiences & Highlights */}
            <div>
              <h3 className="font-serif-display text-xl font-bold">
                Signature Experiences
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-4 text-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabbed Stays & Local Guides */}
            <Tabs defaultValue="stays" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 sm:w-[400px]">
                <TabsTrigger value="stays" className="rounded-xl">
                  <Hotel className="mr-2 h-4 w-4" /> Heritage Stays
                </TabsTrigger>
                <TabsTrigger value="guides" className="rounded-xl">
                  <UserCheck className="mr-2 h-4 w-4" /> Local Guides
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stays" className="mt-6">
                {relatedHotels.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {relatedHotels.map((hotel) => (
                      <HotelCard key={hotel._id} hotel={hotel} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Explore curated heritage hotels across {destination.state || "India"}.
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-3 rounded-xl">
                      <Link to="/hotels">Browse All Stays</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="guides" className="mt-6">
                {relatedGuides.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {relatedGuides.map((guide) => (
                      <GuideCard key={guide._id} guide={guide} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Connect with verified storytellers in {destination.name}.
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-3 rounded-xl">
                      <Link to="/guides">Find Local Guides</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Traveler Reviews Section */}
            <div className="border-t border-border/60 pt-8">
              <ReviewsSection targetType="Destination" targetId={destination._id} />
            </div>
          </div>

          {/* Sticky Right Sidebar: Instant AI Itinerary Launcher */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <Card className="overflow-hidden rounded-3xl border-border/80 shadow-xl">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
                <Badge className="border-white/30 bg-white/20 text-white">
                  <Sparkles className="mr-1 h-3 w-3" /> AI Trip Concierge
                </Badge>
                <h3 className="mt-2 font-serif-display text-2xl font-bold">
                  Plan Your {destination.name} Trip
                </h3>
                <p className="mt-1 text-xs text-white/85">
                  Generate a personalized day-by-day route with local stays & transit costs in seconds.
                </p>
              </div>

              <CardContent className="space-y-5 p-6">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Select Trip Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 4, 5, 7].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setTripDays(d)}
                        className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                          tripDays === d
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-secondary/50 hover:bg-secondary"
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() =>
                    navigate(
                      `/itinerary?destination=${encodeURIComponent(
                        destination.name
                      )}&days=${tripDays}`
                    )
                  }
                  className="w-full rounded-2xl font-bold shadow-md"
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Build {tripDays}-Day AI Itinerary
                </Button>

                <div className="space-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Compass className="h-3.5 w-3.5 text-primary" />
                    Includes morning, afternoon & evening slots
                  </p>
                  <p className="flex items-center gap-2">
                    <IndianRupee className="h-3.5 w-3.5 text-primary" />
                    Full INR budget & transit breakdown
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-border bg-background/95 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">
            Explore {destination.name}
          </p>
          <p className="font-serif-display text-base font-bold">
            Custom {tripDays}-Day Yatra
          </p>
        </div>
        <Button
          onClick={() =>
            navigate(
              `/itinerary?destination=${encodeURIComponent(
                destination.name
              )}&days=${tripDays}`
            )
          }
          className="rounded-xl font-bold"
        >
          <Sparkles className="mr-1.5 h-4 w-4" /> AI Plan Trip
        </Button>
      </div>
    </div>
  );
};

export default DestinationDetailPage;