"use client";
import { useState } from 'react';

export default function Hero() {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="container-xl grid grid-cols-1 md:grid-cols-2 gap-8 py-10 md:py-16 items-center">
      {/* Left Content */}
      <div className={`space-y-5 transition-opacity ${showForm ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="badge-pill">✓ Trusted by thousands of families around the OKC Metro</div>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Ready to Move in OKC? <span className="text-gold">Start Your Free Quote!</span>
        </h1>
        <p className="text-lg text-gray-700">I need a quote for...</p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button className="btn-primary" onClick={() => setShowForm(true)}>Get Quote</button>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <li className="flex items-start gap-2"><span aria-hidden>👑</span><div><strong>100% Satisfaction Guarantee</strong> – Your belongings, treated with care.</div></li>
          <li className="flex items-start gap-2"><span aria-hidden>⌛</span><div><strong>Seamless Process</strong> – Fast quotes and a smooth moving experience.</div></li>
          <li className="flex items-start gap-2"><span aria-hidden>💲</span><div><strong>No Hidden Fees, Ever</strong> – What you see is what you pay.</div></li>
        </ul>
      </div>

      {/* Right Image / Form */}
      <div className="relative min-h-[280px] md:min-h-[420px]">
        {/* Image when not showing form */}
        {!showForm && (
          <div className="absolute inset-0 rounded-xl bg-cover bg-center shadow-lg" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=1600&auto=format&fit=crop')",
          }} aria-label="Smiling mover holding boxes" />
        )}

        {/* Appearing form placeholder */}
        {showForm && (
          <div className="absolute inset-0 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <button className="text-sm underline" onClick={() => setShowForm(false)}>← Back</button>
            <div className="mt-4">
              <h2 className="text-2xl font-bold">Start Your Quote</h2>
              <p className="text-gray-700">Quote form coming next. This is a placeholder for now.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
