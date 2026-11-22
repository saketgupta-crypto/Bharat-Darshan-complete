import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth.service";
import { errMsg } from "@/services/api";

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isGuide, setIsGuide] = useState(false);
  const [gLocation, setGLocation] = useState("");
  const [gLanguages, setGLanguages] = useState("English, Hindi");
  const [gYears, setGYears] = useState("1");
  const [gPrice, setGPrice] = useState("1500");
  const [loading, setLoading] = useState(false);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (password !== confirmPassword) {
  //     toast({ title: "Passwords do not match", variant: "destructive" });
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
  //     const res = await fetch(`${baseUrl}/auth/signup`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ name, email, password, role: isGuide ? "guide" : "user" }),
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data?.message || "Registration failed");

  //     toast({
  //       title: "Account created successfully!",
  //       description: "Please check your inbox to verify your email address.",
  //     });
  //     navigate("/login");
  //   } catch (err: any) {
  //     toast({ title: "Signup Error", description: err.message, variant: "destructive" });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      toast({ title: "Weak password", description: "Use at least 8 characters with a letter and a number.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const guide = isGuide
        ? {
            location: gLocation.trim(),
            languages: gLanguages.split(",").map((s) => s.trim()).filter((s) => s.length >= 2),
            experienceYears: Number(gYears) || 0,
            pricePerDay: Number(gPrice) || 0,
          }
        : undefined;
      await authService.register({ name: name.trim(), email: email.trim(), password, ...(guide ? { asGuide: true, guide } : {}) });
      toast({
        title: "Account created!",
        description: "Enter the 6-digit code we emailed you to verify your address.",
      });
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}${isGuide ? "&guide=1" : ""}`);
    } catch (err) {
      toast({ title: "Signup Error", description: errMsg(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 lg:grid-cols-2">
      {/* Left Editorial Visual Panel */}
      <div className="relative hidden lg:block overflow-hidden bg-slate-900">
        <img
          src="/beautiful-indian-landscape-taj-mahal-golden-hour.jpg"
          alt="Taj Mahal Golden Hour"
          className="absolute inset-0 h-full w-full object-cover opacity-80 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md border border-amber-400/30">
            <Sparkles className="h-3.5 w-3.5" /> Join Bharat Darshan
          </span>
          <h2 className="mt-4 font-serif-display text-4xl font-bold leading-tight">
            Begin Your Sacred Journey Through India
          </h2>
          <p className="mt-2 text-sm text-white/80 max-w-md">
            Unlock AI-crafted itineraries, curated heritage stays, and connect directly with verified local storytellers.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                <Compass className="h-5 w-5" />
              </div>
              <span className="font-serif-display text-xl font-bold">Bharat Darshan</span>
            </Link>
            <h1 className="font-serif-display text-3xl font-bold tracking-tight">Create Account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter your details below to start planning your next Indian adventure.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="h-12 pl-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@example.com"
                  className="h-12 pl-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 pl-10 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 pl-10 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="guide"
                checked={isGuide}
                onCheckedChange={(c) => setIsGuide(c === true)}
              />
              <label htmlFor="guide" className="text-xs font-medium text-muted-foreground cursor-pointer">
                Register as a local tour guide (requires admin approval)
              </label>
            </div>
                        {isGuide && (
              <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-4 sm:grid-cols-2">
                <Input value={gLocation} onChange={(e) => setGLocation(e.target.value)} placeholder="Your city (e.g., Varanasi)" className="h-11 rounded-xl sm:col-span-2" required />
                <Input value={gLanguages} onChange={(e) => setGLanguages(e.target.value)} placeholder="Languages, comma separated" className="h-11 rounded-xl sm:col-span-2" required />
                <Input type="number" min={0} value={gYears} onChange={(e) => setGYears(e.target.value)} placeholder="Years of experience" className="h-11 rounded-xl" />
                <Input type="number" min={0} value={gPrice} onChange={(e) => setGPrice(e.target.value)} placeholder="Price per day (INR)" className="h-11 rounded-xl" />
              </div>
            )}

            <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl font-bold shadow-md mt-2">
              {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;