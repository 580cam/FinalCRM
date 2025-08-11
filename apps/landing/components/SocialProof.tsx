export default function SocialProof() {
  return (
    <section id="reviews" className="py-12 md:py-16 bg-white">
      <div className="container-xl space-y-8">
        <div className="text-center space-y-3">
          <h2 className="section-title">OKC's Most Trusted, Award-Winning Movers</h2>
          <p className="section-subtitle">Trusted by locals, recognized with awards, and loved by customers.</p>
        </div>

        {/* Awards & Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 items-center">
          {['A+ Top Mover', 'Local Movers', 'BBB Accredited', 'Google 5★', 'Best in OKC', 'Yelp 5★', 'Thumbtack Top Pro 2024'].map((label) => (
            <div key={label} className="border border-gray-200 rounded-md p-3 text-center text-sm">{label}</div>
          ))}
        </div>

        {/* Elfsight Reviews Widget */}
        <div className="mt-6">
          <div className="elfsight-app-a44607a0-95ae-4607-aa37-23352073345a" data-elfsight-app-lazy></div>
          <div className="mt-3 text-center">
            <a href="#" className="underline">Write a review</a>
          </div>
        </div>
      </div>
    </section>
  );
}
