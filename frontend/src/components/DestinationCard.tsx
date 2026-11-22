// import { motion } from "framer-motion"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { MapPin, Clock, Star } from "lucide-react"
// import { Link, useNavigate } from "react-router-dom"
// import type { Destination } from "@/types"
// import { useAuth } from "@/context/AuthContext"
// import { userService } from "@/services/user.service"
// import { errMsg } from "@/services/api"
// import { toast } from "@/hooks/use-toast"

// interface DestinationCardProps {
//   destination: Destination
// }

// const DestinationCard = ({ destination }: DestinationCardProps) => {
//   const { user, setUser } = useAuth()
//   const navigate = useNavigate()
//   const favIds = (user?.favoriteDestinations ?? []).map((d) => (typeof d === "string" ? d : d._id))
//   const isFav = favIds.includes(destination._id)
//   const toggleFav = async () => {
//     if (!user) { navigate("/auth/login", { state: { from: "/destinations" } }); return }
//     try {
//       const r = await userService.toggleFavorite(destination._id)
//       setUser({ ...user, favoriteDestinations: r.favorited ? [...favIds, destination._id] : favIds.filter((i) => i !== destination._id) })
//     } catch (e) { toast({ title: "Error", description: errMsg(e), variant: "destructive" }) }
//   }
//   const getTypeColor = (type: string) => {
//     switch (type) {
//       case "Heritage":
//         return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
//       case "Adventure":
//         return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
//       case "Cultural":
//         return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
//       case "Nature":
//         return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
//     }
//   }

//   return (
//     <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3, ease: "easeOut" }} className="h-full">
//       <Card className="h-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-card group">
//         <div className="relative h-56 overflow-hidden">
//           <img
//             src={destination.images?.[0] || "/placeholder.svg"}
//             alt={destination.name}
//             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//           />
//           <div className="absolute top-4 left-4">
//             <Badge className={`${getTypeColor(destination.category)} font-medium transition-colors duration-200`}>
//               {destination.category}
//             </Badge>
//           </div>
//           <div className="absolute top-4 right-4">
//             <div className="bg-black/70 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1">
//               <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
//               <span>{destination.reviewCount ? destination.avgRating.toFixed(1) : "New"}</span>
//             </div>
//           </div>
//           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

//           {/* Overlay content */}
//           <div className="absolute bottom-4 left-4 right-4">
//             <div className="text-white">
//               <h3 className="text-xl font-serif font-bold mb-1 line-clamp-1">{destination.name}</h3>
//               <div className="flex items-center text-white/90 text-sm">
//                 <MapPin className="w-4 h-4 mr-1" />
//                 <span>{destination.state}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <CardContent className="p-6">
//           <div className="space-y-4">
//             <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{destination.description}</p>

//             <div className="flex items-center justify-between text-sm text-muted-foreground">
//               <div className="flex items-center gap-1">
//                 <Clock className="w-4 h-4" />
//                 <span>{destination.recommendedDuration || "Flexible"}</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <span className="text-primary font-semibold">{destination.averageBudget ? `Avg. ₹${destination.averageBudget.toLocaleString("en-IN")}` : "Budget varies"}</span>
//               </div>
//             </div>

//             <div className="flex gap-2 pt-2">
//               <Button asChild
//                 className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 hover:shadow-md"
//                 size="sm"
//               ><Link to={`/destinations/${destination.slug}`}>View Details</Link></Button>
//               <Button onClick={toggleFav} aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
//                 variant="outline"
//                 size="sm"
//                 className="px-4 border-border hover:border-primary hover:text-primary transition-colors duration-200 bg-transparent"
//               >{isFav ? "♥" : "♡"}</Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   )
// }

// export default DestinationCard


import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Calendar, Heart, ArrowUpRight, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface DestinationCardProps {
  destination: {
    _id: string;
    name: string;
    state?: string;
    category?: string;
    description?: string;
    images?: string[];
    rating?: number;
    reviewsCount?: number;
    bestTimeToVisit?: string;
    estimatedBudget?: number | string;
  };
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const coverImage =
    destination.images?.[0] || "/beautiful-indian-landscape-taj-mahal-golden-hour.jpg";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl">
      {/* 4:5 Portrait Image Container */}
      <Link
        to={`/destinations/${destination._id}`}
        className="relative aspect-[4/5] w-full overflow-hidden bg-muted"
      >
        <img
          src={coverImage}
          alt={destination.name}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/Taj.jpeg";
          }}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Multi-stop gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Top Bar: Category & Favorite Button */}
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <Badge className="border-white/20 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md hover:bg-black/60">
            {destination.category || "Heritage"}
          </Badge>

          {onToggleFavorite && (
            <button
              type="button"
              aria-label="Toggle favorite"
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(destination._id, e);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-black/55"
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? "fill-rose-500 text-rose-500" : "text-white"
                }`}
              />
            </button>
          )}
        </div>

        {/* Bottom Overlay Content */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 text-white">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-amber-300">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {destination.state || "Incredible India"}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-white backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {Number(destination.rating || 4.8).toFixed(1)}
            </span>
          </div>

          <h3 className="font-serif-display text-2xl font-bold leading-tight tracking-tight text-white">
            {destination.name}
          </h3>

          {destination.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/80">
              {destination.description}
            </p>
          )}

          {/* Metadata Footer Strip */}
          <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-xs text-white/85">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              {destination.bestTimeToVisit || "Oct – Mar"}
            </span>

            {destination.estimatedBudget ? (
              <span className="flex items-center font-semibold text-amber-300">
                <IndianRupee className="h-3.5 w-3.5" />
                {destination.estimatedBudget}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-300 group-hover:underline">
                Explore <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DestinationCard;