import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useAuth } from "@/context/AuthContext";
import { homeFor, useAuth } from "@/context/AuthContext";
import { errMsg } from "@/services/api";
import { useToast } from "@/hooks/use-toast";


export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  // const { login } = useAuth() as any;
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
  //     const res = await fetch(`${baseUrl}/auth/login`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data?.message || "Invalid credentials");

  //     login(data.data.user, data.data.accessToken || data.data.token);
  //     toast({ title: "Welcome back!", description: "Successfully logged in." });
  //     navigate("/dashboard");
  //   } catch (err: any) {
  //     toast({ title: "Login Failed", description: err.message, variant: "destructive" });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      navigate(homeFor(user.role));
    } catch (err) {
      toast({ title: "Login Failed", description: errMsg(err, "Invalid credentials"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 lg:grid-cols-2">
      {/* Left Editorial Visual Panel */}
      <div className="relative hidden lg:block overflow-hidden bg-slate-900">
        <img
          src="/kashi-ghat.jpeg"
          alt="Varanasi Ghats"
          className="absolute inset-0 h-full w-full object-cover opacity-80 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md border border-amber-400/30">
            <Sparkles className="h-3.5 w-3.5" /> Welcome Back
          </span>
          <h2 className="mt-4 font-serif-display text-4xl font-bold leading-tight">
            Continue Exploring the Wonders of India
          </h2>
          <p className="mt-2 text-sm text-white/80 max-w-md">
            Access your saved itineraries, view bookings, and manage your travel preferences.
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
            <h1 className="font-serif-display text-3xl font-bold tracking-tight">Sign In</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter your credentials to access your traveler account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
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

            <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl font-bold shadow-md mt-2">
              {loading ? "Signing In..." : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Join Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;