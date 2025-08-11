import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200">
      {/* Top Trust Bar */}
      <div className="w-full bg-dark text-white text-xs sm:text-sm py-2">
        <div className="container-xl flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center">
          <span>Local & Family-Owned</span>
          <span className="hidden sm:inline">|</span>
          <span>Licensed and Insured</span>
          <span className="hidden sm:inline">|</span>
          <span>Meals Donated With Every Move</span>
          <span className="hidden sm:inline">|</span>
          <span>Award-Winning Team</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container-xl flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gold" aria-hidden />
          <Link href="#" className="text-lg font-extrabold tracking-tight">
            High Quality Moving
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <a href="tel:+15805951262" className="font-semibold">
            (580) 595-1262
          </a>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
            <span className="font-semibold">5.0</span>
            <span role="img" aria-label="5 stars">⭐⭐⭐⭐⭐</span>
            <Link href="#reviews" className="underline">Read our 136 reviews</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
