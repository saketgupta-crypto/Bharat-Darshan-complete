import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequireAuth from "@/components/RequireAuth";
import PanelLayout, { type PanelLink } from "@/components/PanelLayout";
import { Compass } from "lucide-react";

import HomePage from "@/pages/HomePage";
import DestinationsPage from "@/pages/DestinationsPage";

const DestinationDetailPage = lazy(() => import("@/pages/DestinationDetailPage"));
const HotelsPage = lazy(() => import("@/pages/HotelsPage"));
const HotelDetailPage = lazy(() => import("@/pages/HotelDetailPage"));
const GuidesPage = lazy(() => import("@/pages/GuidesPage"));
const ItineraryPage = lazy(() => import("@/pages/ItineraryPage"));
const SharedItineraryPage = lazy(() => import("@/pages/SharedItineraryPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignupPage = lazy(() => import("@/pages/auth/SignupPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));

const MyTripsPage = lazy(() => import("@/pages/user/MyTripsPage"));
const TripDetailPage = lazy(() => import("@/pages/user/TripDetailPage"));
const FavoritesPage = lazy(() => import("@/pages/user/FavoritesPage"));
const MyReviewsPage = lazy(() => import("@/pages/user/MyReviewsPage"));

// These modules export named components (no default export), so pick each one out for lazy().
const named = <M extends Record<string, unknown>>(load: () => Promise<M>, key: keyof M) =>
  lazy(() => load().then((m) => ({ default: m[key] as React.ComponentType })));
const admin = () => import("@/pages/admin/AdminPages");
const superAdmin = () => import("@/pages/superadmin/SuperAdminPages");
const guide = () => import("@/pages/guide/GuidePages");
const statics = () => import("@/pages/StaticPages");
const AboutPage = named(statics, "AboutPage"), PrivacyPage = named(statics, "PrivacyPage"), TermsPage = named(statics, "TermsPage"), SitemapPage = named(statics, "SitemapPage");
const GuideDashboard = named(guide, "GuideDashboard"), GuideProfilePage = named(guide, "GuideProfilePage"), GuideInquiries = named(guide, "GuideInquiries"), GuideReviews = named(guide, "GuideReviews");
const AdminDashboard = named(admin, "AdminDashboard"), AdminUsers = named(admin, "AdminUsers"), AdminDestinations = named(admin, "AdminDestinations"), AdminHotels = named(admin, "AdminHotels");
const AdminGuides = named(admin, "AdminGuides"), AdminReviews = named(admin, "AdminReviews"), AdminContacts = named(admin, "AdminContacts"), AdminAnalytics = named(admin, "AdminAnalytics");
const ManageAdmins = named(superAdmin, "ManageAdmins"), ActivityLogs = named(superAdmin, "ActivityLogs"), AiUsage = named(superAdmin, "AiUsage"), SecurityMonitor = named(superAdmin, "SecurityMonitor"), SystemSettings = named(superAdmin, "SystemSettings");

const userLinks: PanelLink[] = [
  { to: "/dashboard", label: "Overview", end: true }, { to: "/itinerary", label: "AI Planner" }, { to: "/dashboard/trips", label: "My Trips" },
  { to: "/dashboard/favorites", label: "Saved Destinations" }, { to: "/dashboard/reviews", label: "My Reviews" }, { to: "/dashboard/profile", label: "Profile & Preferences" },
];
const guideLinks: PanelLink[] = [
  { to: "/guide", label: "Dashboard", end: true }, { to: "/guide/profile", label: "Profile & Pricing" }, { to: "/guide/inquiries", label: "Inquiries" }, { to: "/guide/reviews", label: "Reviews & Ratings" },
];
const superLinks: PanelLink[] = [
  { to: "/super-admin", label: "Overview", end: true }, { to: "/super-admin/admins", label: "Admins & Permissions" }, { to: "/super-admin/activity", label: "Activity Logs" },
  { to: "/super-admin/ai-usage", label: "AI Usage" }, { to: "/super-admin/security", label: "Security" }, { to: "/super-admin/settings", label: "System Settings" },
  { to: "/super-admin/users", label: "Users" }, { to: "/super-admin/destinations", label: "Destinations" }, { to: "/super-admin/hotels", label: "Hotels" },
  { to: "/super-admin/guides", label: "Guides" }, { to: "/super-admin/reviews", label: "Reviews" }, { to: "/super-admin/contacts", label: "Inquiries" }, { to: "/super-admin/analytics", label: "Reports" },
];

function AdminShell() {
  const { hasPermission } = useAuth();
  const links: PanelLink[] = [{ to: "/admin", label: "Dashboard", end: true }];
  if (hasPermission("users:manage")) links.push({ to: "/admin/users", label: "Users" });
  if (hasPermission("destinations:write")) links.push({ to: "/admin/destinations", label: "Destinations" });
  if (hasPermission("hotels:write")) links.push({ to: "/admin/hotels", label: "Hotels" });
  if (hasPermission("guides:manage")) links.push({ to: "/admin/guides", label: "Guides" });
  if (hasPermission("reviews:moderate")) links.push({ to: "/admin/reviews", label: "Reviews" });
  if (hasPermission("contacts:manage")) links.push({ to: "/admin/contacts", label: "Inquiries" });
  if (hasPermission("analytics:view")) links.push({ to: "/admin/analytics", label: "Reports" });
  return <PanelLayout title="Admin Panel" links={links} />;
}

const NotFound: React.FC = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
    <h1 className="text-4xl font-bold">404</h1>
    <p className="text-muted-foreground">This page could not be found.</p>
    <Link to="/" className="text-primary underline">Go home</Link>
  </div>
);

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

const PageLoader: React.FC = () => (
  <div className="flex min-h-[65vh] flex-col items-center justify-center gap-3">
    <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-primary/15 text-primary">
      <Compass className="h-6 w-6 animate-spin" />
    </div>
    <p className="font-serif-display text-sm font-medium text-muted-foreground">
      Loading Bharat Darshan...
    </p>
  </div>
);

// Layout wrapper to handle conditional footer rendering
const MainLayout: React.FC = () => {
  const { pathname } = useLocation();

  // Paths where the footer should be hidden
  const hideFooterRoutes = [
    "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email",
    "/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-email",
  ];
  const shouldHideFooter = hideFooterRoutes.includes(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destinations/:id" element={<DestinationDetailPage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/hotels/:id" element={<HotelDetailPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/itinerary" element={<ItineraryPage />} />
            <Route path="/shared-itinerary/:token" element={<SharedItineraryPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth: both URL styles work, because pages link to /login and /auth/login */}
            {["/login", "/auth/login"].map((p) => <Route key={p} path={p} element={<LoginPage />} />)}
            {["/signup", "/auth/signup"].map((p) => <Route key={p} path={p} element={<SignupPage />} />)}
            {["/forgot-password", "/auth/forgot-password"].map((p) => <Route key={p} path={p} element={<ForgotPasswordPage />} />)}
            {["/reset-password", "/auth/reset-password"].map((p) => <Route key={p} path={p} element={<ResetPasswordPage />} />)}
            {["/verify-email", "/auth/verify-email"].map((p) => <Route key={p} path={p} element={<VerifyEmailPage />} />)}

            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />

            {/* USER panel */}
            <Route element={<RequireAuth roles={["USER"]} />}>
              <Route element={<PanelLayout title="My Travel" links={userLinks} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/trips" element={<MyTripsPage />} />
                <Route path="/dashboard/trips/:id" element={<TripDetailPage />} />
                <Route path="/dashboard/favorites" element={<FavoritesPage />} />
                <Route path="/dashboard/reviews" element={<MyReviewsPage />} />
                <Route path="/dashboard/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
            <Route path="/my-trips" element={<Navigate to="/dashboard/trips" replace />} />
            <Route path="/favorites" element={<Navigate to="/dashboard/favorites" replace />} />
            <Route path="/my-reviews" element={<Navigate to="/dashboard/reviews" replace />} />

            {/* GUIDE panel */}
            <Route element={<RequireAuth roles={["GUIDE"]} />}>
              <Route element={<PanelLayout title="Guide Panel" links={guideLinks} />}>
                <Route path="/guide" element={<GuideDashboard />} />
                <Route path="/guide/profile" element={<GuideProfilePage />} />
                <Route path="/guide/inquiries" element={<GuideInquiries />} />
                <Route path="/guide/reviews" element={<GuideReviews />} />
              </Route>
            </Route>

            {/* ADMIN panel (fine-grained permissions are enforced by the API) */}
            <Route element={<RequireAuth roles={["ADMIN"]} />}>
              <Route element={<AdminShell />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/destinations" element={<AdminDestinations />} />
                <Route path="/admin/hotels" element={<AdminHotels />} />
                <Route path="/admin/guides" element={<AdminGuides />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/contacts" element={<AdminContacts />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
              </Route>
            </Route>

            {/* SUPER ADMIN panel */}
            <Route element={<RequireAuth roles={["SUPER_ADMIN"]} />}>
              <Route element={<PanelLayout title="Super Admin" links={superLinks} />}>
                <Route path="/super-admin" element={<AdminDashboard />} />
                <Route path="/super-admin/admins" element={<ManageAdmins />} />
                <Route path="/super-admin/activity" element={<ActivityLogs />} />
                <Route path="/super-admin/ai-usage" element={<AiUsage />} />
                <Route path="/super-admin/security" element={<SecurityMonitor />} />
                <Route path="/super-admin/settings" element={<SystemSettings />} />
                <Route path="/super-admin/users" element={<AdminUsers />} />
                <Route path="/super-admin/destinations" element={<AdminDestinations />} />
                <Route path="/super-admin/hotels" element={<AdminHotels />} />
                <Route path="/super-admin/guides" element={<AdminGuides />} />
                <Route path="/super-admin/reviews" element={<AdminReviews />} />
                <Route path="/super-admin/contacts" element={<AdminContacts />} />
                <Route path="/super-admin/analytics" element={<AdminAnalytics />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="bharat-darshan-theme">
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <MainLayout />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;