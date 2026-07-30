import Link from 'next/link';
import { Compass, Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <Compass className="h-6 w-6 text-primary" />
            Visit Yaoundé
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            The official digital guide to Yaoundé&apos;s attractions, culture, and everyday life — built to help
            residents and visitors discover the city of seven hills.
          </p>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            <Facebook className="h-5 w-5" />
            <Instagram className="h-5 w-5" />
            <Twitter className="h-5 w-5" />
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/attractions" className="hover:text-foreground">
                Attractions
              </Link>
            </li>
            <li>
              <Link href="/map" className="hover:text-foreground">
                Live map
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Hôtel de Ville, Centre-ville, Yaoundé
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +237 222 22 22 22
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> info@visityaounde.cm
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Visit Yaoundé. All rights reserved.
      </div>
    </footer>
  );
}
