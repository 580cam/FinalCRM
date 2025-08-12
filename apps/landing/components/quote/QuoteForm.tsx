"use client";
import React, { useEffect, useMemo, useState } from 'react';
import ServiceTypeStep from '@/components/quote/ServiceTypeStep';
import MoveDetailsStep, { type MoveDetailsState } from '@/components/quote/MoveDetailsStep';
import LocationDetailsStep from '@/components/quote/LocationDetailsStep';
import AdditionalInfoStep from '@/components/quote/AdditionalInfoStep';
import ConditionalFollowUpsStep from '@/components/quote/ConditionalFollowUpsStep';
import type { ServiceTypeOption, LocationDetailsState, AdditionalInfoState, ConditionalFollowUpsState } from '@/components/quote/types';

type Props = {
  onBack: () => void;
};

export default function QuoteForm({ onBack }: Props) {
  const [step, setStep] = useState<number>(1);
  const [serviceType, setServiceType] = useState<ServiceTypeOption | undefined>(undefined);
  const [moveDetails, setMoveDetails] = useState<MoveDetailsState>({});
  const [locationDetails, setLocationDetails] = useState<LocationDetailsState>({});
  const [locationSlide, setLocationSlide] = useState<1 | 2>(1);
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoState>({});
  const [followUps, setFollowUps] = useState<ConditionalFollowUpsState>({});

  const isStep2Complete = useMemo(() => {
    if (!serviceType) return false;
    const v = moveDetails;
    if (serviceType === 'Commercial') {
      return Boolean(v.propertyType && v.commercialSize);
    }
    if (serviceType === 'Junk Removal') {
      return Boolean(v.propertyType && v.junkVolume);
    }
    if (serviceType === 'Moving Labor') {
      return Boolean(v.laborType && v.propertyType && v.residentialSize);
    }
    // Residential services
    return Boolean(v.propertyType && v.residentialSize);
  }, [serviceType, moveDetails]);

  // Determine if Step 3 uses single address or dual (From/To)
  const isSingleAddressFlow = useMemo(() => {
    if (!serviceType) return true;
    const isJunk = serviceType === 'Junk Removal';
    const isLabor = serviceType === 'Moving Labor';
    const singleLabor = moveDetails.laborType === 'Load-Only' || moveDetails.laborType === 'Unload-Only' || moveDetails.laborType === 'Restaging / In-Home';
    return isJunk || (isLabor && singleLabor);
  }, [serviceType, moveDetails.laborType]);

  // When entering Step 3 or changing flow type, reset to first sub-slide
  useEffect(() => {
    if (step === 3) setLocationSlide(1);
  }, [step]);
  useEffect(() => {
    setLocationSlide(1);
  }, [isSingleAddressFlow]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg max-h-[80vh] overflow-auto">
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
                  disabled={!isStep2Complete}
                  onClick={() => setStep(3)}
                  className={[
                    'rounded-lg px-4 py-2 text-sm font-semibold transition border',
                    isStep2Complete ? 'bg-black text-white border-black hover:opacity-90' : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed',
                  ].join(' ')}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 3 && serviceType && (
            <>
              <LocationDetailsStep
                serviceType={serviceType}
                moveDetails={moveDetails}
                value={locationDetails}
                onChange={(patch) => setLocationDetails((prev) => ({ ...prev, ...patch }))}
                slide={isSingleAddressFlow ? 1 : locationSlide}
              />
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  aria-label={(!isSingleAddressFlow && locationSlide === 2) ? 'Back to Step 3 - From' : 'Back to Step 2'}
                  onClick={() => {
                    if (!isSingleAddressFlow && locationSlide === 2) {
                      setLocationSlide(1);
                    } else {
                      setStep(2);
                    }
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-800 hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  aria-label={(!isSingleAddressFlow && locationSlide === 1) ? 'Continue to Moving TO' : 'Continue to Step 4'}
                  onClick={() => {
                    if (!isSingleAddressFlow && locationSlide === 1) {
                      setLocationSlide(2);
                    } else {
                      setStep(4);
                    }
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold transition border bg-black text-white border-black hover:opacity-90"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <AdditionalInfoStep
                serviceType={serviceType}
                value={additionalInfo}
                onChange={(patch) => setAdditionalInfo((prev) => ({ ...prev, ...patch }))}
              />
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Back to Step 3"
                  onClick={() => setStep(3)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-800 hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  aria-label="Continue to Step 5"
                  onClick={() => setStep(5)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold transition border bg-black text-white border-black hover:opacity-90"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <ConditionalFollowUpsStep
                additionalInfo={additionalInfo}
                value={followUps}
                onChange={(patch) => setFollowUps((prev) => ({ ...prev, ...patch }))}
              />
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Back to Step 4"
                  onClick={() => setStep(4)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-800 hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  aria-label="Continue to Step 6"
                  onClick={() => setStep(6)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold transition border bg-black text-white border-black hover:opacity-90"
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
