export default function MovingProcess() {
  const steps = [
    {
      title: 'Request Your Quote',
      desc: 'Tell us about your move—your home, distance, and any special items.',
    },
    {
      title: 'Plan & Schedule',
      desc: 'We lock in your date and send a detailed plan with transparent pricing.',
    },
    {
      title: 'Moving Day',
      desc: 'Our pros arrive on time with clean trucks, tools, and protective materials.',
    },
    {
      title: 'Delivery & Setup',
      desc: 'We place items where you want them and make sure you’re satisfied.',
    },
  ];

  return (
    <section id="process" className="py-14 md:py-20">
      <div className="container-xl">
        <div className="text-center space-y-3 mb-10">
          <h2 className="section-title">How Our Moving Process Works</h2>
          <p className="section-subtitle">A simple, stress-free process from start to finish.</p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
              <div className="text-gold font-extrabold text-2xl">{i + 1}</div>
              <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
              <p className="text-gray-700 mt-1">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
