"use client";
import React, { useEffect, useRef } from "react";

// Lightweight Google Places Autocomplete input.
// Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to be set.
// Falls back to a normal text input if Google script isn't loaded.

type Props = {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

let googleMapsLoaderPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (googleMapsLoaderPromise) return googleMapsLoaderPromise;

  googleMapsLoaderPromise = new Promise<void>((resolve) => {
    if ((window as any).google?.maps?.places) {
      resolve();
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // No key provided; resolve to allow fallback behavior.
      resolve();
      return;
    }

    const scriptId = "google-maps-places-script";
    if (document.getElementById(scriptId)) {
      // Script already added; wait for it to finish loading
      const onLoaded = () => resolve();
      (document.getElementById(scriptId) as HTMLScriptElement).addEventListener("load", onLoaded, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(), { once: true });
    document.head.appendChild(script);
  });

  return googleMapsLoaderPromise;
}

export default function AddressAutocompleteInput({ value, onChange, placeholder = "Enter address", ariaLabel, className }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMapsScript().then(() => {
      if (cancelled) return;
      if (!(window as any).google?.maps?.places || !inputRef.current) return;
      try {
        autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(inputRef.current as HTMLInputElement, {
          fields: ["formatted_address", "address_components", "geometry"],
          types: ["address"],
        });
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current!.getPlace();
          const formatted = place.formatted_address || inputRef.current!.value;
          onChange(formatted);
        });
      } catch {
        // fail silently; fallback to normal input
      }
    });
    return () => {
      cancelled = true;
    };
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={className ?? "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"}
      autoComplete="off"
      type="text"
    />
  );
}
