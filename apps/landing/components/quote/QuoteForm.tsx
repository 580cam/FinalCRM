"use client";
import React, { useState } from 'react';
import ServiceTypeStep from '@/components/quote/ServiceTypeStep';
import MoveDetailsStep, { type MoveDetailsState } from '@/components/quote/MoveDetailsStep';
import type { ServiceTypeOption } from '@/components/quote/types';

type Props = {
  onBack: () => void;
};

export default function QuoteForm({ onBack }: Props) {
  const [step, setStep] = useState<number>(1);
  const [serviceType, setServiceType] = useState<ServiceTypeOption | undefined>(undefined);
  const [moveDetails, setMoveDetails] = useState<MoveDetailsState>({});

  return (
    <div className="absolute inset-0 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <button className="text-sm underline" onClick={onBack}>← Back</button>
      <div className="mt-4">
        <h2 className="text-2xl font-bold">Start Your Quote</h2>
        <div className="mt-4">
          {step === 1 && (
            <>
              <ServiceTypeStep value={serviceType} onChange={setServiceType} />
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  aria-label="Continue to Step 2"
                  onClick={() => setStep(2)}
                  disabled={!serviceType}
                  className={[
                    'rounded-lg px-4 py-2 text-sm font-semibold transition border',
                    serviceType ? 'bg-black text-white border-black hover:opacity-90' : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed',
                  ].join(' ')}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 2 && serviceType && (
            <>
              <MoveDetailsStep
                serviceType={serviceType}
                value={moveDetails}
                onChange={(patch) => setMoveDetails((prev) => ({ ...prev, ...patch }))}
              />
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Back to Step 1"
                  onClick={() => setStep(1)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-800 hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  aria-label="Continue to Step 3"
                  disabled
                  className="rounded-lg px-4 py-2 text-sm font-semibold border bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
