"use client";
import React from 'react';
import {
  type ServiceTypeOption,
  type PropertyType,
  type CommercialPropertyType,
  type ResidentialPropertyType,
  type CommercialSizeOption,
  type LaborTypeOption,
  type JunkVolumeOption,
  COMMERCIAL_SIZES,
  LABOR_TYPES,
  JUNK_VOLUMES,
  APARTMENT_CONDO_SIZES,
  HOUSE_TOWNHOUSE_SIZES,
  STORAGE_SIZES,
  RESIDENTIAL_PROPERTY_OPTIONS,
  COMMERCIAL_PROPERTY_OPTIONS,
  JUNK_PROPERTY_OPTIONS,
} from '@/components/quote/types';

export type MoveDetailsState = {
  propertyType?: PropertyType;
  commercialSize?: CommercialSizeOption;
  residentialSize?: string; // constrained by lists
  laborType?: LaborTypeOption;
  junkVolume?: JunkVolumeOption;
  // House/Townhouse extras
  isLarge?: boolean;
};

type Props = {
  serviceType: ServiceTypeOption;
  value: MoveDetailsState;
  onChange: (patch: Partial<MoveDetailsState>) => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold">{title}</h4>
      {children}
    </div>
  );
}

export default function MoveDetailsStep({ serviceType, value, onChange }: Props) {
  const isCommercial = serviceType === 'Commercial';
  const isResidentialService = serviceType === 'Moving' || serviceType === 'Full Service' || serviceType === 'White Glove';
  const isLabor = serviceType === 'Moving Labor';
  const isJunk = serviceType === 'Junk Removal';

  const renderPropertyTiles = () => {
    if (isCommercial) {
      const options: CommercialPropertyType[] = COMMERCIAL_PROPERTY_OPTIONS;
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3" role="group" aria-label="Commercial Property Type">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={value.propertyType === opt}
              onClick={() => onChange({ propertyType: opt })}
              className={[
                'rounded-xl border px-3 py-3 text-sm font-medium text-left transition',
                value.propertyType === opt ? 'border-black bg-black text-white shadow' : 'border-gray-300 bg-white hover:border-gray-400',
              ].join(' ')}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (isResidentialService || isLabor) {
      const options: ResidentialPropertyType[] = RESIDENTIAL_PROPERTY_OPTIONS;
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3" role="group" aria-label="Property Type">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={value.propertyType === opt}
              onClick={() => onChange({ propertyType: opt })}
              className={[
                'rounded-xl border px-3 py-3 text-sm font-medium text-left transition',
                value.propertyType === opt ? 'border-black bg-black text-white shadow' : 'border-gray-300 bg-white hover:border-gray-400',
              ].join(' ')}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (isJunk) {
      const options = JUNK_PROPERTY_OPTIONS;
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3" role="group" aria-label="Property Type">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={value.propertyType === opt}
              onClick={() => onChange({ propertyType: opt })}
              className={[
                'rounded-xl border px-3 py-3 text-sm font-medium text-left transition',
                value.propertyType === opt ? 'border-black bg-black text-white shadow' : 'border-gray-300 bg-white hover:border-gray-400',
              ].join(' ')}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    return null;
  };

  const renderSecondaryTiles = () => {
    if (isCommercial) {
      return (
        <Section title="Move Size">
          <div className="grid grid-cols-4 gap-3 mt-2" role="group" aria-label="Commercial Move Size">
            {COMMERCIAL_SIZES.map((opt) => (
              <button
                key={opt}
                type="button"
                aria-pressed={value.commercialSize === opt}
                onClick={() => onChange({ commercialSize: opt })}
                className={[
                  'rounded-xl border px-3 py-3 text-sm font-medium text-left transition',
                  value.commercialSize === opt ? 'border-black bg-black text-white shadow' : 'border-gray-300 bg-white hover:border-gray-400',
                ].join(' ')}
              >
                {opt}
              </button>
            ))}
          </div>
        </Section>
      );
    }

    const renderHouseTownhouseExtras = () => {
      const inHouseGroup = value.propertyType === 'House' || value.propertyType === 'Townhouse';
      if (!inHouseGroup) return null;
      return (
        <Section title="Large Home">
          <div className="mt-2" role="group" aria-label="Large Home">
            <label className="inline-flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
                checked={Boolean(value.isLarge)}
                onChange={() => onChange({ isLarge: !value.isLarge })}
              />
              <span className="text-sm text-gray-800">
                <span className="font-medium">Large?</span>
                <span className="ml-2 text-gray-600">Includes extra rooms like Office, Patio, Garage, Shed</span>
              </span>
            </label>
          </div>
        </Section>
      );
    };

    if (isResidentialService) {
      if (value.propertyType === 'Apartment-Condo') {
        return (
          <Section title="Move Size">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2" role="group" aria-label="Apartment/Condo Size">
              {APARTMENT_CONDO_SIZES.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={value.residentialSize === opt}
                  onClick={() => onChange({ residentialSize: opt })}
                  className={[
                    'rounded-xl border px-3 py-3 text-sm font-medium text-left transition',
                    value.residentialSize === opt ? 'border-black bg-black text-white shadow' : 'border-gray-300 bg-white hover:border-gray-400',
                  ].join(' ')}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Section>
        );
      }
      if (value.propertyType === 'House' || value.propertyType === 'Townhouse') {
        return (
          <>
            <Section title="Move Size">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2" role="group" aria-label="House/Townhouse Size">
                {HOUSE_TOWNHOUSE_SIZES.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={value.residentialSize === opt}
                    onClick={() => onChange({ residentialSize: opt })}
                    className={[
                      'rounded-xl border px-3 py-3 text-sm font-medium text-left transition',
                      value.residentialSize === opt ? 'border-black bg-black text-white shadow' : 'border-gray-300 bg-white hover:border-gray-400',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Section>
            {renderHouseTownhouseExtras()}
          </>
        );
      }
      if (value.propertyType === 'Storage') {
        return (
          <Section title="Move Size">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2" role="group" aria-label="Storage Unit Size">
              {STORAGE_SIZES.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={value.residentialSize === opt}
                  onClick={() => onChange({ residentialSize: opt })}
                  className={[
                    'rounded-xl border px-3 py-3 text-sm font-medium text-left transition',
                    value.residentialSize === opt ? 'border-black bg-black text-white shadow' : 'border-gray-300 bg-white hover:border-gray-400',
                  ].join(' ')}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Section>
        );
      }
    }

    if (isLabor) {
      return (
        <>
          <Section title="Labor Type">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2" role="group" aria-label="Labor Type">
              {LABOR_TYPES.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={value.laborType === opt}
                  onClick={() => onChange({ laborType: opt })}
                  className={[
                    'rounded-xl border px-3 py-3 text-sm font-medium text-left transition',
                    value.laborType === opt ? 'border-black bg-black text-white shadow' : 'border-gray-300 bg-white hover:border-gray-400',
                  ].join(' ')}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Section>
          {/* Follow same size path as residential services */}
          {value.propertyType === 'Apartment-Condo' && (
            <Section title="Move Size">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2" role="group" aria-label="Apartment/Condo Size">
                {APARTMENT_CONDO_SIZES.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={value.residentialSize === opt}
                    onClick={() => onChange({ residentialSize: opt })}
                    className={[
                      'rounded-xl border px-3 py-3 text-sm font-medium text-left transition',
                      value.residentialSize === opt ? 'border-black bg-black text-white shadow' : 'border-gray-300 bg-white hover:border-gray-400',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Section>
          )}
          {(value.propertyType === 'House' || value.propertyType === 'Townhouse') && (
            <>
              <Section title="Move Size">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2" role="group" aria-label="House/Townhouse Size">
                  {HOUSE_TOWNHOUSE_SIZES.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={value.residentialSize === opt}
                      onClick={() => onChange({ residentialSize: opt })}
                      className={[
                        'rounded-xl border px-3 py-3 text-sm font-medium text-left transition',
                        value.residentialSize === opt ? 'border-black bg-black text-white shadow' : 'border-gray-300 bg-white hover:border-gray-400',
                      ].join(' ')}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </Section>
              {renderHouseTownhouseExtras()}
            </>
          )}
          {value.propertyType === 'Storage' && (
            <Section title="Move Size">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2" role="group" aria-label="Storage Unit Size">
                {STORAGE_SIZES.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={value.residentialSize === opt}
                    onClick={() => onChange({ residentialSize: opt })}
                    className={[
                      'rounded-xl border px-3 py-3 text-sm font-medium text-left transition',
                      value.residentialSize === opt ? 'border-black bg-black text-white shadow' : 'border-gray-300 bg-white hover:border-gray-400',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Section>
          )}
        </>
      );
    }

    if (isJunk) {
      return (
        <Section title="Volume">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2" role="group" aria-label="Junk Volume">
            {JUNK_VOLUMES.map((opt) => (
              <button
                key={opt}
                type="button"
                aria-pressed={value.junkVolume === opt}
                onClick={() => onChange({ junkVolume: opt })}
                className={[
                  'rounded-xl border px-3 py-3 text-sm font-medium text-left transition',
                  value.junkVolume === opt ? 'border-black bg-black text-white shadow' : 'border-gray-300 bg-white hover:border-gray-400',
                ].join(' ')}
              >
                {opt}
              </button>
            ))}
          </div>
        </Section>
      );
    }

    return null;
  };

  return (
    <div>
      <h3 className="text-xl font-semibold">Step 2: Move Type & Property</h3>
      <p className="text-gray-700 mt-1">Select property type{isCommercial ? ' and size' : isLabor ? ' and labor type' : isJunk ? ' and volume' : ''}.</p>
      {renderPropertyTiles()}
      {renderSecondaryTiles()}
    </div>
  );
}
