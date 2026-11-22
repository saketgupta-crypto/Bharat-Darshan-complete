import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Languages,
  Award,
  CheckCircle2,
  IndianRupee,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface GuideCardProps {
  guide: {
    _id: string;
    name: string;
    bio?: string;
    location?: string;
    state?: string;
    languages?: string[];
    specialties?: string[];
    experienceYears?: number;
    pricePerDay?: number;
    rating?: number;
    reviewsCount?: number;
    avatar?: string;
    image?: string;
    isVerified?: boolean;
  };
  onContactGuide?: (guide: any) => void;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide, onContactGuide }) => {
  const avatarUrl = guide.avatar || guide.image || "/man2.webp";
  const languages = guide.languages?.length
    ? guide.languages
    : ["Hindi", "English"];
  const specialties = guide.specialties?.length
    ? guide.specialties
    : ["Cultural History", "Temple Architecture"];

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div>
        {/* Top Profile Row */}
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/20 bg-muted">
            <img
              src={avatarUrl}
              alt={guide.name}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/man.jpg";
              }}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif-display truncate text-lg font-bold text-foreground">
                {guide.name}
              </h3>
              {guide.isVerified !== false && (
                // <CheckCircle2
                //   className="h-4 w-4 shrink-0 text-emerald-500"
                //   title="Verified Local Guide"
                // />
                                <span title="Verified Local Guide" className="inline-flex shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="Verified Local Guide" />
                </span>
              )}
            </div>

            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">
                {[guide.location, guide.state].filter(Boolean).join(", ") ||
                  "Varanasi & North India"}
              </span>
            </p>

            {/* Rating & Experience Pill */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 font-semibold text-amber-700 dark:text-amber-300">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {Number(guide.rating || 4.9).toFixed(1)}
                {guide.reviewsCount ? ` (${guide.reviewsCount})` : ""}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground">
                <Award className="h-3 w-3 text-primary" />
                {guide.experienceYears || 6}+ yrs exp
              </span>
            </div>
          </div>
        </div>

        {/* Bio Snippet */}
        {guide.bio && (
          <p className="mt-3.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {guide.bio}
          </p>
        )}

        {/* Languages & Specialties */}
        <div className="mt-4 space-y-2 border-t border-border/50 pt-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Languages className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate font-medium text-foreground">
              {languages.join(" • ")}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {specialties.slice(0, 3).map((spec, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="rounded-lg px-2 py-0.5 text-[11px] font-normal"
              >
                {spec}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Rate & Action */}
      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Guide Fee
          </span>
          <div className="flex items-baseline gap-1">
            <span className="flex items-center text-lg font-extrabold text-foreground">
              <IndianRupee className="h-4 w-4" />
              {Number(guide.pricePerDay || 1800).toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-muted-foreground">/ day</span>
          </div>
        </div>

        {onContactGuide ? (
          <Button
            size="sm"
            onClick={() => onContactGuide(guide)}
            className="rounded-xl font-semibold"
          >
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Book Guide
          </Button>
        ) : (
          <Button asChild size="sm" className="rounded-xl font-semibold">
            <Link to={`/guides?highlight=${guide._id}`}>
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Connect
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default GuideCard;