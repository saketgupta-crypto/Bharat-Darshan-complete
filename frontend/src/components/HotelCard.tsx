import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  IndianRupee,
  Wifi,
  Coffee,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface HotelCardProps {
  hotel: {
    _id: string;
    name: string;
    city?: string;
    state?: string;
    address?: string;
    pricePerNight?: number;
    rating?: number;
    reviewsCount?: number;
    images?: string[];
    amenities?: string[];
    category?: string;
  };
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const coverImage = hotel.images?.[0] || "/oberoi.webp";
  const amenities = hotel.amenities || ["Free WiFi", "Breakfast", "Heritage View"];
  const visibleAmenities = amenities.slice(0, 3);
  const extraCount = Math.max(0, amenities.length - 3);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* 16:10 Image Header */}
      <Link
        to={`/hotels/${hotel._id}`}
        className="relative aspect-[16/10] w-full overflow-hidden bg-muted"
      >
        <img
          src={coverImage}
          alt={hotel.name}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/hotel.jpg";
          }}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between">
          <Badge className="border-white/20 bg-black/45 text-xs text-white backdrop-blur-md">
            <Sparkles className="mr-1 h-3 w-3 text-amber-300" />
            {hotel.category || "Heritage Stay"}
          </Badge>

          <span className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {Number(hotel.rating || 4.7).toFixed(1)}
          </span>
        </div>

        {/* Location Overlay */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center gap-1 text-xs font-medium text-white/90">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-300" />
          <span className="truncate">
            {[hotel.city, hotel.state].filter(Boolean).join(", ") ||
              hotel.address ||
              "India"}
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <Link to={`/hotels/${hotel._id}`}>
            <h3 className="font-serif-display line-clamp-1 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
              {hotel.name}
            </h3>
          </Link>

          {/* Amenity Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {visibleAmenities.map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
              >
                {idx === 0 ? (
                  <Wifi className="h-3 w-3 text-primary" />
                ) : (
                  <Coffee className="h-3 w-3 text-primary" />
                )}
                {amenity}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="rounded-lg bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                +{extraCount} more
              </span>
            )}
          </div>
        </div>

        {/* Price & CTA Footer */}
        <div className="mt-5 flex items-end justify-between border-t border-border/60 pt-4">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Starting from
            </span>
            <div className="flex items-baseline gap-1">
              <span className="flex items-center text-xl font-extrabold text-foreground">
                <IndianRupee className="h-4 w-4" />
                {Number(hotel.pricePerNight || 4500).toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-muted-foreground">/ night</span>
            </div>
          </div>

          <Button asChild size="sm" className="rounded-xl font-semibold">
            <Link to={`/hotels/${hotel._id}`}>
              View Stay <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;