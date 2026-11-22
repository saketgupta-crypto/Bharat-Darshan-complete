import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  IndianRupee,
  ArrowLeft,
  Share2,
  Heart,
  Wifi,
  Coffee,
  ShieldCheck,
  Phone,
  Mail,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import DataState from "@/components/DataState";
import ReviewsSection from "@/components/ReviewsSection";
import { useToast } from "@/hooks/use-toast";

export const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [hotel, setHotel] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchHotel = async () => {
    setLoading(true);
    setError(null);
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

    try {
      const res = await fetch(`${baseUrl}/hotels/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Hotel not found");

      const data = json?.data?.hotel || json?.data || json;
      setHotel(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load hotel details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchHotel();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Share this heritage stay with your fellow travelers.",
    });
  };

  if (loading || error || !hotel) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <DataState
          loading={loading}
          error={error}
          empty={!loading && !hotel}
          count={1}
          onRetry={fetchHotel}
        />
      </div>
    );
  }

  const images: string[] =
    hotel.images?.length > 0
      ? hotel.images
      : [
          hotel.image || "/oberoi.webp",
          "/suryagarh.avif",
          "/kumarakom-lake-resort.jpg",
          "/hotel.jpg",
        ];

  const amenities: string[] = hotel.amenities || [
    "Desert View",
    "Cultural Shows",
    "Camel Safari",
    "Royal Dining",
    "Swimming Pool",
    "Free Wi-Fi",
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* TOP BREADCRUMB & ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/hotels")}
            className="rounded-xl text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Heritage Stays
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

        {/* TITLE & LOCATION HEADER */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/15 text-primary">
              <Sparkles className="mr-1 h-3 w-3" />
              {hotel.category || "Luxury Heritage Property"}
            </Badge>
            <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {[hotel.city, hotel.state].filter(Boolean).join(", ") ||
                hotel.address ||
                "India"}
            </span>
          </div>

          <h1 className="mt-2 font-serif-display text-3xl font-bold tracking-tight sm:text-5xl">
            {hotel.name}
          </h1>
        </div>

        {/* BENTO PHOTO GALLERY */}
        <div className="mt-6 grid h-[340px] grid-cols-1 gap-3 overflow-hidden rounded-3xl sm:h-[460px] md:grid-cols-4">
          <div className="relative h-full overflow-hidden bg-muted md:col-span-2">
            <img
              src={images[0]}
              alt={hotel.name}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="hidden grid-cols-1 gap-3 md:col-span-2 md:grid md:grid-rows-2">
            <div className="relative overflow-hidden bg-muted">
              <img
                src={images[1] || images[0]}
                alt={`${hotel.name} view 2`}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative overflow-hidden bg-muted">
                <img
                  src={images[2] || images[0]}
                  alt={`${hotel.name} view 3`}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="relative overflow-hidden bg-muted">
                <img
                  src={images[3] || images[0]}
                  alt={`${hotel.name} view 4`}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN LAYOUT */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column: Description, Amenities & Reviews */}
          <div className="space-y-10 lg:col-span-8">
            <div>
              <h2 className="font-serif-display text-2xl font-bold">About This Property</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                {hotel.description ||
                  `Experience royal hospitality, authentic local architecture, and world-class luxury at ${hotel.name}. Designed to offer an immersive connection to the heritage of the region while ensuring modern comfort.`}
              </p>
            </div>

            {/* Amenities Grid */}
            <div>
              <h3 className="font-serif-display text-xl font-bold">Amenities & Features</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {amenities.map((amenity: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-2xl border border-border/70 bg-secondary/40 p-4 text-sm font-medium"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-border/60 pt-8">
              <ReviewsSection targetType="Hotel" targetId={hotel._id} />
            </div>
          </div>

          {/* Right Sticky Booking Card */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <Card className="overflow-hidden rounded-3xl border-border/80 shadow-xl">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
                <Badge className="border-white/30 bg-white/20 text-white">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Verified Stay
                </Badge>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="flex items-center font-serif-display text-3xl font-extrabold">
                    <IndianRupee className="h-6 w-6" />
                    {Number(hotel.pricePerNight || 6500).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-white/80">/ night</span>
                </div>
              </div>

              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between text-sm border-b border-border/60 pb-4">
                  <span className="text-muted-foreground">Guest Rating</span>
                  <span className="flex items-center gap-1 font-bold">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {Number(hotel.rating || 4.8).toFixed(1)}
                  </span>
                </div>

                <div className="space-y-3">
                  <Button
                    size="lg"
                    onClick={() =>
                      toast({
                        title: "Enquiry Sent!",
                        description: "The property concierge will contact you shortly.",
                      })
                    }
                    className="w-full rounded-2xl font-bold shadow-md"
                  >
                    Enquire With Property
                  </Button>

                  {hotel.phone && (
                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                      className="w-full rounded-2xl font-semibold"
                    >
                      <a href={`tel:${hotel.phone}`}>
                        <Phone className="mr-2 h-4 w-4" /> Call Concierge
                      </a>
                    </Button>
                  )}
                </div>

                <p className="text-center text-[11px] text-muted-foreground">
                  Bharat Darshan facilitates direct heritage discovery. No hidden booking fees.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;