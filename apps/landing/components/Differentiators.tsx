export default function Differentiators() {
  const items = [
    { title: 'Licensed & Insured', desc: 'Professional protection for your move.' },
    { title: 'Transparent Pricing', desc: 'No hidden fees, ever.' },
    { title: 'Professional Movers', desc: 'Trained, background-checked teams.' },
    { title: 'On-Time Guarantee', desc: 'We respect your schedule.' },
    { title: 'Clean Trucks & Gear', desc: 'Well-maintained equipment, always.' },
    { title: 'Community-Focused', desc: 'Local, family-owned, and trusted.' },
  ];

  return (
    <section id="why-us" className="py-14 md:py-20 bg-gray-50">
      <div className="container-xl">
        <div className="text-center space-y-3 mb-10">
          <h2 className="section-title">Why Choose High Quality Moving?</h2>
          <p className="section-subtitle">Real value, real care, and a team you can count on.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <div key={it.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold">{it.title}</h3>
              <p className="text-gray-700 mt-1">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
