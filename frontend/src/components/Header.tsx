import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  Hotel,
  UserCheck,
  Sparkles,
  Menu,
  X,
  User,
  LogOut,
  Heart,
  Map,
  Shield,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Destinations", path: "/destinations", icon: Compass },
  { label: "Heritage Stays", path: "/hotels", icon: Hotel },
  { label: "Local Guides", path: "/guides", icon: UserCheck },
  { label: "Contact", path: "/contact", icon: PhoneCall },
];

export const Header: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth() as any;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const dashboardPath =
    user?.role === "superadmin"
      ? "/superadmin"
      : user?.role === "admin"
      ? "/admin"
      : user?.role === "guide"
      ? "/guide"
      : "/dashboard";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border/70 bg-background/85 shadow-sm backdrop-blur-xl"
          : "bg-background/60 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
            <Compass className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif-display text-xl font-bold tracking-tight text-foreground">
              Bharat Darshan
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
              Soul of India
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {NAV_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/15 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {/* Highlighted AI Planner CTA */}
          <Link
            to="/itinerary"
            className={`ml-2 flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
              pathname.startsWith("/itinerary")
                ? "border-primary bg-primary text-primary-foreground shadow-md"
                : "border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            AI Trip Planner
          </Link>
        </nav>

        {/* Right Actions: Auth / User Menu */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-full border-border/80 pl-2 pr-4"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {user.name?.[0]?.toUpperCase() || <User className="h-3.5 w-3.5" />}
                  </div>
                  <span className="max-w-[120px] truncate text-xs font-semibold">
                    {user.name || "Traveler"}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(dashboardPath)}>
                  <Shield className="mr-2 h-4 w-4 text-primary" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/my-trips")}>
                  My AI Trips
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/favorites")}>
                  <Heart className="mr-2 h-4 w-4" />
                  Saved Places
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout?.();
                    navigate("/");
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="rounded-full font-semibold"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/signup")}
                className="rounded-full px-5 font-semibold shadow-sm"
              >
                Join Free
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label="Toggle Menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-b border-border bg-background px-4 pb-6 pt-3 shadow-xl md:hidden">
          <div className="flex flex-col space-y-1.5">
            {NAV_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/itinerary"
              className="flex items-center gap-3 rounded-xl bg-amber-500/15 px-3.5 py-2.5 text-sm font-semibold text-amber-700 dark:text-amber-300"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI Trip Planner
            </Link>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
            {user ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate(dashboardPath)}
                  className="w-full justify-start rounded-xl"
                >
                  <Shield className="mr-2 h-4 w-4 text-primary" />
                  Go to Dashboard
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    logout?.();
                    navigate("/");
                  }}
                  className="w-full justify-start rounded-xl"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="rounded-xl"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="rounded-xl"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;