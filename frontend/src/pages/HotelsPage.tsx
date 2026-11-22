import React, { useState, useEffect } from "react";
import { Search, Hotel, Sparkles, SlidersHorizontal, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import HotelCard from "@/components/HotelCard";
import DataState from "@/components/DataState";
import { api, errMsg } from "@/services/api";

const PRICE_FILTERS = [
  { label: "All Stays", min: 0, max: 999999 },
  { label: "Budget (₹0 - ₹10k)", min: 0, max: 10000 },
  { label: "Mid-Range (₹10k - ₹20k)", min: 10000, max: 20000 },
  { label: "Luxury (₹20k+)", min: 20000, max: 999999 },
];

export const HotelsPage: React.FC = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);

  // const fetchHotels = async () => {
  //   setLoading(true);
  //   setError(null);
  //   const baseUrl =
  //     import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

  //   try {
  //     const res = await fetch(`${baseUrl}/hotels`);
  //     const json = await res.json();
  //     if (!res.ok) throw new Error(json?.message || "Failed to fetch hotels");

  //     const items = json?.data?.items || json?.data?.hotels || json?.hotels || json;
  //     setHotels(Array.isArray(items) ? items : []);
  //   } catch (err: any) {
  //     setError(err?.message || "Failed to load heritage stays");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchHotels();
  // }, []);

  // const fetchHotels = async () => {
  //   setLoading(true);
  //   setError(null);
  //   const baseUrl =
  //     import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

  //   try {
  //     const res = await fetch(`${baseUrl}/hotels`);
  //     const json = await res.json();
  //     if (!res.ok) throw new Error(json?.message || "Failed to fetch hotels");

  //     // Debug: Check your browser console to see the exact structure from MongoDB
  //     console.log("API Hotels Response:", json);

  //     // Handle all possible backend response wrapper patterns
  //     const items =
  //       json?.data?.items ||
  //       json?.data?.hotels ||
  //       json?.hotels ||
  //       json?.data ||
  //       json;

  //     setHotels(Array.isArray(items) ? items : []);
  //   } catch (err: any) {
  //     setError(err?.message || "Failed to load heritage stays");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

    const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      // API returns { success, data: Hotel[], meta }. Max page size is 50.
      const res = await api.get("/hotels", { params: { limit: 50 } });
      const items = res.data?.data;
      setHotels(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(errMsg(err, "Failed to load heritage stays"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // const activeFilter = PRICE_FILTERS[selectedPriceIndex];
  // const filteredHotels = hotels.filter((hotel) => {
  //   const matchesSearch =
  //     hotel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     hotel.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     hotel.state?.toLowerCase().includes(searchQuery.toLowerCase());

  //   const price = Number(hotel.pricePerNight || 5000);
  //   const matchesPrice = price >= activeFilter.min && price <= activeFilter.max;

  //   return matchesSearch && matchesPrice;
  // });

  const activeFilter = PRICE_FILTERS[selectedPriceIndex];
  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      !searchQuery ||
      hotel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.address?.toLowerCase().includes(searchQuery.toLowerCase());

    // Support multiple possible property keys from backend models
    const hotelPrice = Number(
      hotel.pricePerNight ?? hotel.price ?? hotel.costPerNight ?? 5000
    );
    
    // If "All Stays" is selected (index 0), ignore price bounds
    const matchesPrice =
      selectedPriceIndex === 0 ||
      (hotelPrice >= activeFilter.min && hotelPrice <= activeFilter.max);

    return matchesSearch && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HERO BANNER */}
      <section className="relative flex min-h-[42vh] items-center justify-center overflow-hidden px-4 py-16 text-center">
        <img
          src="/oberoi.webp"
          alt="Luxury Heritage Stays"
          className="absolute inset-0 h-full w-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-background" />

        <div className="relative z-10 mx-auto max-w-3xl text-white">
          <Badge className="mb-4 border-amber-400/40 bg-amber-500/20 px-4 py-1 text-xs uppercase tracking-widest text-amber-200 backdrop-blur-md">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-300" /> Royal Hospitality
          </Badge>
          <h1 className="font-serif-display text-4xl font-bold tracking-tight sm:text-6xl">
            Heritage Stays & Palaces
          </h1>
          <p className="mx-auto mt-3 text-sm text-white/85 sm:text-base">
            Experience timeless architecture, royal service, and authentic regional luxury across India's finest destinations.
          </p>
        </div>
      </section>

      {/* FLOATING SEARCH & FILTER CONSOLE */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-xl backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hotels by name, city, or palace..."
                className="h-12 pl-10 rounded-2xl border-border/80 bg-background text-sm"
              />
            </div>

            {/* Price Range Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground pr-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" /> Price:
              </span>
              {PRICE_FILTERS.map((filter, idx) => {
                const active = selectedPriceIndex === idx;
                return (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={() => setSelectedPriceIndex(idx)}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* HOTEL GRID / DATA STATE */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <DataState
          loading={loading}
          error={error}
          empty={!loading && filteredHotels.length === 0}
          emptyTitle="No heritage stays found"
          emptyMessage="Try clearing your search query or adjusting the price range filter."
          variant="hotel"
          count={8}
          onRetry={fetchHotels}
          onResetFilters={() => {
            setSearchQuery("");
            setSelectedPriceIndex(0);
          }}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredHotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        </DataState>
      </section>
    </div>
  );
};

export default HotelsPage;