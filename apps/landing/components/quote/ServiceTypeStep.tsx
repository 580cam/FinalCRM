"use client";
import React from 'react';
import { SERVICE_TYPE_OPTIONS, type ServiceTypeOption } from '@/components/quote/types';

type Props = {
  value?: ServiceTypeOption;
  onChange: (value: ServiceTypeOption) => void;
};

export default function ServiceTypeStep({ value, onChange }: Props) {
  return (
    <div>
      <h3 className="text-xl font-semibold">Step 1: Service Type</h3>
      <p className="text-gray-700 mt-1">What can we help with?</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4" role="group" aria-label="Service Type Options">
        {SERVICE_TYPE_OPTIONS.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(opt)}
              className={[
                'rounded-xl border px-3 py-4 text-sm font-medium text-left transition',
                selected
                  ? 'border-black bg-black text-white shadow'
                  : 'border-gray-300 bg-white hover:border-gray-400',
              ].join(' ')}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
