// import { useEffect, useState } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Link } from "react-router-dom"
// import { destinationService } from "@/services/destination.service"
// import { useAsync, useDebounced } from "@/hooks/useAsync"
// import Pager from "@/components/Pager"
// import { LoadingBlock, ErrorBlock } from "@/components/DataState"
// import Header from "@/components/Header"
// import Footer from "@/components/Footer"
// import DestinationCard from "@/components/DestinationCard"
// import { Search, Filter, MapPin } from "lucide-react"

// export default function DestinationsPage() {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedType, setSelectedType] = useState<string>("All")

//   const destinationTypes = ["All", "Heritage", "Adventure", "Cultural", "Nature"]

//   const [page, setPage] = useState(1)
//   const debouncedSearch = useDebounced(searchTerm)
//   useEffect(() => { setPage(1) }, [debouncedSearch, selectedType])
//   const { data, loading, error, reload } = useAsync(
//     () => destinationService.list({ q: debouncedSearch, category: selectedType, page, limit: 12 }),
//     [debouncedSearch, selectedType, page],
//   )
//   const filteredDestinations = data?.items ?? []
//   const total = data?.meta.total ?? 0

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />

//       {/* Hero Section */}
//       <section className="relative h-96 flex items-center justify-center overflow-hidden mt-16">
//         <div
//           className="absolute inset-0 bg-cover bg-center bg-no-repeat"
//           style={{
//             backgroundImage: `url('/123.jpg')`,
//           }}
//         />
//         <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />

//         <motion.div
//           className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//         >
//           <h1 className="text-4xl md:text-6xl font-serif mb-4 gold-accent">Discover Destinations</h1>
//           <p className="text-lg md:text-xl text-white/90 leading-relaxed">
//             Explore the incredible diversity of India - from ancient heritage sites to breathtaking natural wonders
//           </p>
//         </motion.div>
//       </section>

//       {/* Search and Filter Section */}
//       <section className="py-12 px-4 bg-muted/30">
//         <div className="max-w-7xl mx-auto">
//           <motion.div
//             className="bg-card rounded-2xl p-6 shadow-lg"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//           >
//             <div className="flex flex-col lg:flex-row gap-6 items-center">
//               {/* Search Input */}
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                 <Input
//                   placeholder="Search destinations, locations, or experiences..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 h-12 text-base border-border focus:border-primary"
//                 />
//               </div>

//               {/* Filter Buttons */}
//               <div className="flex flex-wrap gap-2">
//                 <div className="flex items-center gap-2 mr-4">
//                   <Filter className="w-5 h-5 text-muted-foreground" />
//                   <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
//                 </div>
//                 {destinationTypes.map((type) => (
//                   <Button
//                     key={type}
//                     variant={selectedType === type ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setSelectedType(type)}
//                     className={`rounded-full ${
//                       selectedType === type
//                         ? "bg-primary text-primary-foreground"
//                         : "border-border hover:border-primary"
//                     }`}
//                   >
//                     {type}
//                   </Button>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Destinations Grid */}
//       <section className="py-16 px-4">
//         <div className="max-w-7xl mx-auto">
//           {/* Results Header */}
//           <motion.div
//             className="flex items-center justify-between mb-8"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//           >
//             <div className="flex items-center gap-3">
//               <MapPin className="w-6 h-6 text-primary" />
//               <h2 className="text-2xl md:text-3xl font-serif text-foreground">
//                 {selectedType === "All" ? "All Destinations" : `${selectedType} Destinations`}
//               </h2>
//             </div>
//             <div className="text-muted-foreground">
//               {total} destination{total !== 1 ? "s" : ""} found
//             </div>
//           </motion.div>

//           {/* Destinations Grid */}
//           {loading && !data ? (
//             <LoadingBlock label="Loading destinations..." />
//           ) : error ? (
//             <ErrorBlock message={error} onRetry={reload} />
//           ) : filteredDestinations.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//               {filteredDestinations.map((destination, index) => (
//                 <motion.div
//                   key={destination._id}
//                   initial={{ opacity: 0, y: 50 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.6, delay: index * 0.1 }}
//                 >
//                   <DestinationCard destination={destination} />
//                 </motion.div>
//               ))}
//             </div>
//           ) : (
//             <motion.div
//               className="text-center py-16"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.6 }}
//             >
//               <div className="text-6xl mb-4">🔍</div>
//               <h3 className="text-2xl font-semibold text-foreground mb-2">No destinations found</h3>
//               <p className="text-muted-foreground mb-6">
//                 Try adjusting your search terms or filters to find what you're looking for.
//               </p>
//               <Button
//                 onClick={() => {
//                   setSearchTerm("")
//                   setSelectedType("All")
//                 }}
//                 variant="outline"
//               >
//                 Clear Filters
//               </Button>
//             </motion.div>
//           )}
//           <Pager meta={data?.meta} onPage={setPage} />
//         </div>
//       </section>

//       {/* Call to Action */}
//       <section className="py-16 bg-primary text-primary-foreground">
//         <div className="max-w-4xl mx-auto text-center px-4">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-3xl md:text-4xl font-serif mb-4">Ready to Start Your Indian Adventure?</h2>
//             <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed">
//               Let our expert guides help you create unforgettable memories across incredible India
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button asChild
//                 size="lg"
//                 variant="secondary"
//                 className="bg-white text-primary hover:bg-white/90 px-8 py-3 font-semibold rounded-full"
//               ><Link to="/itinerary">Plan Your Trip</Link></Button>
//               <Button asChild
//                 size="lg"
//                 variant="outline"
//                 className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 font-semibold rounded-full bg-transparent"
//               ><Link to="/contact">Contact Us</Link></Button>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       <Footer />
//     </div>
//   )
// }


import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Compass, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DestinationCard from "@/components/DestinationCard";
import DataState from "@/components/DataState";

const CATEGORY_CHIPS = [
  "All",
  "Spiritual",
  "Heritage",
  "Nature",
  "Desert",
  "Wildlife",
  "Beach",
];

const STATE_CHIPS = [
  "All States",
  "Uttar Pradesh",
  "Rajasthan",
  "Kerala",
  "Uttarakhand",
  "Maharashtra",
  "Tamil Nadu",
];

export const DestinationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedState, setSelectedState] = useState("All States");
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchDestinations = async () => {
    setLoading(true);
    setError(null);
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

    try {
      const res = await fetch(`${baseUrl}/destinations?limit=50`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch destinations");

      const items = json?.data?.items || json?.data || json?.destinations || [];
      setDestinations(Array.isArray(items) ? items : []);
    } catch (err: any) {
      setError(err?.message || "Could not load destinations from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter logic across search query, category chips, and state pills
  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      !searchQuery.trim() ||
      dest.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      dest.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesState =
      selectedState === "All States" ||
      dest.state?.toLowerCase() === selectedState.toLowerCase();

    return matchesSearch && matchesCategory && matchesState;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedState("All States");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HERO BANNER */}
      <section className="border-b border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Badge className="mb-3 bg-primary/15 text-primary">
            <Compass className="mr-1.5 h-3.5 w-3.5" /> Incredible India Explorer
          </Badge>
          <h1 className="font-serif-display text-3xl font-bold tracking-tight sm:text-5xl">
            Discover Sacred Sites & Royal Heritage
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Explore meticulously curated destinations across Bharat with verified traveler reviews and estimated budgets.
          </p>

          {/* Search Bar */}
          <div className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by monument, city, or state..."
                className="h-12 border-border/80 bg-background pl-10 text-sm"
              />
            </div>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="h-12 rounded-xl"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* STICKY FILTER CHIPS BAR */}
      <div className="sticky top-20 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORY_CHIPS.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-secondary-foreground hover:bg-primary/15"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* State Filter Dropdown/Select */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                aria-label="Filter destinations by state"
                className="rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold"
              >
                {STATE_CHIPS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Showing {filteredDestinations.length} Destinations
          </p>
        </div>

        <DataState
          loading={loading}
          error={error}
          empty={!loading && filteredDestinations.length === 0}
          emptyTitle="No destinations match your criteria"
          emptyMessage="Try selecting 'All' categories or clearing your search term."
          onRetry={fetchDestinations}
          onResetFilters={handleResetFilters}
          count={8}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest._id}
                destination={dest}
                isFavorite={favorites.includes(dest._id)}
                onToggleFavorite={() => handleToggleFavorite(dest._id)}
              />
            ))}
          </div>
        </DataState>
      </section>
    </div>
  );
};

export default DestinationsPage;