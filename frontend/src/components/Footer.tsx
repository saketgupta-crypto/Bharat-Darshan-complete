// import { Link } from "react-router-dom"
// import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from "lucide-react"

// const Footer = () => {
//   return (
//     <footer className="bg-secondary text-secondary-foreground indian-pattern">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//           {/* Brand Section */}
//           <div className="space-y-4">
//             <div className="flex items-center space-x-2">
//               <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
//                 <MapPin className="w-6 h-6 text-primary-foreground" />
//               </div>
//               <div>
//                 <h3 className="text-xl font-serif font-bold gold-accent">Bharat Darshan</h3>
//                 <p className="text-sm text-secondary-foreground/80">Incredible India</p>
//               </div>
//             </div>
//             <p className="text-secondary-foreground/80 text-sm leading-relaxed">
//               Discover the soul of India through authentic travel experiences. From heritage monuments to natural
//               wonders, we bring you closer to the incredible diversity of Bharat.
//             </p>
//             <div className="flex space-x-4">
//               <Facebook className="w-5 h-5 text-secondary-foreground/60 hover:text-primary cursor-pointer transition-colors" />
//               <Twitter className="w-5 h-5 text-secondary-foreground/60 hover:text-primary cursor-pointer transition-colors" />
//               <Instagram className="w-5 h-5 text-secondary-foreground/60 hover:text-primary cursor-pointer transition-colors" />
//               <Youtube className="w-5 h-5 text-secondary-foreground/60 hover:text-primary cursor-pointer transition-colors" />
//             </div>
//           </div>

//           {/* Quick Links */}
//           <div className="space-y-4">
//             <h4 className="text-lg font-semibold text-secondary-foreground">Quick Links</h4>
//             <ul className="space-y-2">
//               {[
//                 { name: "Destinations", href: "/destinations" },
//                 { name: "Hotels", href: "/hotels" },
//                 { name: "Tour Guides", href: "/guides" },
//                 { name: "Itinerary Planner", href: "/itinerary" },
//                 { name: "About Us", href: "/about" },
//                 { name: "Contact", href: "/contact" },
//               ].map((link) => (
//                 <li key={link.name}>
//                   <Link
//                     to={link.href}
//                     className="text-secondary-foreground/80 hover:text-primary transition-colors text-sm"
//                   >
//                     {link.name}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Popular Destinations */}
//           <div className="space-y-4">
//             <h4 className="text-lg font-semibold text-secondary-foreground">Popular Destinations</h4>
//             <ul className="space-y-2">
//               {[
//                 "Taj Mahal, Agra",
//                 "Kerala Backwaters",
//                 "Rajasthan Deserts",
//                 "Goa Beaches",
//                 "Himachal Mountains",
//                 "Golden Temple, Amritsar",
//               ].map((destination) => (
//                 <li key={destination}>
//                   <span className="text-secondary-foreground/80 text-sm hover:text-primary cursor-pointer transition-colors">
//                     {destination}
//                   </span>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Contact Info */}
//           <div className="space-y-4">
//             <h4 className="text-lg font-semibold text-secondary-foreground">Contact Us</h4>
//             <div className="space-y-3">
//               <div className="flex items-center space-x-3">
//                 <Phone className="w-4 h-4 text-primary" />
//                 <span className="text-secondary-foreground/80 text-sm">+91 98765 43210</span>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <Mail className="w-4 h-4 text-primary" />
//                 <span className="text-secondary-foreground/80 text-sm">info@bharatdarshan.com</span>
//               </div>
//               <div className="flex items-start space-x-3">
//                 <MapPin className="w-4 h-4 text-primary mt-0.5" />
//                 <span className="text-secondary-foreground/80 text-sm">
//                   123 Heritage Street,
//                   <br />
//                   New Delhi, India 110001
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Section */}
//         <div className="border-t border-secondary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
//           <p className="text-secondary-foreground/60 text-sm">
//             © 2025 Bharat Darshan. All rights reserved. Made with ❤️ for Incredible India.
//           </p>
//           <div className="flex space-x-6 mt-4 md:mt-0">
//             <Link to="/privacy" className="text-secondary-foreground/60 hover:text-primary text-sm transition-colors">
//               Privacy Policy
//             </Link>
//             <Link to="/terms" className="text-secondary-foreground/60 hover:text-primary text-sm transition-colors">
//               Terms of Service
//             </Link>
//             <Link to="/sitemap" className="text-secondary-foreground/60 hover:text-primary text-sm transition-colors">
//               Sitemap
//             </Link>
//           </div>
//         </div>
//       </div>
//     </footer>
//   )
// }

// export default Footer


import React from "react";
import { Link } from "react-router-dom";
import { Compass, Sparkles, Heart, Mail, Phone, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/80 bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                <Compass className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif-display text-xl font-bold tracking-tight">
                  Bharat Darshan
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                  Soul of India
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Your intelligent cultural travel companion. Discover timeless heritage, connect with verified local guides, and generate custom AI itineraries across India.
            </p>

            <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Incredible India | Crafted for Travelers
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 md:col-span-2 md:col-start-6">
            <h4 className="font-serif-display text-sm font-bold uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to="/destinations" className="hover:text-primary transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-primary transition-colors">
                  Heritage Stays
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-primary transition-colors">
                  Local Guides
                </Link>
              </li>
              <li>
                <Link to="/itinerary" className="hover:text-primary transition-colors">
                  AI Trip Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="space-y-3 md:col-span-2">
            <h4 className="font-serif-display text-sm font-bold uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 md:col-span-3">
            <h4 className="font-serif-display text-sm font-bold uppercase tracking-wider">
              Connect
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>New Delhi & Varanasi, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>namaste@bharatdarshan.ai</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>+91 (11) 4000-8900</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Bharat Darshan Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> for the heritage of India.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
