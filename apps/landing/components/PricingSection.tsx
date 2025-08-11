export default function PricingSection() {
  return (
    <section id="pricing" className="py-14 md:py-20 bg-gray-50">
      <div className="container-xl">
        <div className="text-center space-y-3 mb-10">
          <div className="overflow-hidden">
            <div className="inline-block whitespace-nowrap animate-marquee will-change-transform">
              <span className="mx-3">Affordable Pricing</span>
              <span className="mx-3">No Hidden Fees</span>
              <span className="mx-3">Transparent Quotes</span>
              <span className="mx-3">Local & Long Distance</span>
              <span className="mx-3">Packing Available</span>
            </div>
          </div>
          <h2 className="section-title">Straightforward Pricing, Built for Real Moves</h2>
          <p className="section-subtitle">Clear rates and honest estimates. You’ll always know what to expect.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Local Moves', desc: 'Ideal for apartment, townhouse, and single-family moves around OKC.' },
            { title: 'Long Distance', desc: 'Inter-city and statewide moving with the same care and transparency.' },
            { title: 'Packing Services', desc: 'Full or partial packing options with supplies available.' },
          ].map((card) => (
            <div key={card.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">{card.title}</h3>
              <p className="text-gray-700 mt-2">{card.desc}</p>
              <div className="mt-4">
                <button className="btn-gold">Get Quote</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
