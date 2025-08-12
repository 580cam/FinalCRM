"use client";
import React from "react";
import type { ContactInfoState } from "@/components/quote/types";

type Props = {
  slide: 1 | 2 | 3; // 1: Email, 2: Name, 3: Phone
  value: ContactInfoState;
  onChange: (patch: Partial<ContactInfoState>) => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export default function ContactInfoStep({ slide, value, onChange }: Props) {
  return (
    <div>
      <h3 className="text-xl font-semibold">Step 6: Contact Info</h3>
      <p className="text-gray-700 mt-1">We just need a few more details to send you quote over</p>

      {slide === 1 && (
        <Section title="Email">
          <div className="mt-2" role="group" aria-label="Email">
            <label className="block text-sm font-medium text-gray-800" htmlFor="contact-email">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              aria-label="Email"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              value={value.email ?? ""}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
        </Section>
      )}

      {slide === 2 && (
        <Section title="Name">
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Name">
            <div>
              <label className="block text-sm font-medium text-gray-800" htmlFor="contact-first-name">
                First Name
              </label>
              <input
                id="contact-first-name"
                type="text"
                aria-label="First Name"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                value={value.firstName ?? ""}
                onChange={(e) => onChange({ firstName: e.target.value })}
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800" htmlFor="contact-last-name">
                Last Name
              </label>
              <input
                id="contact-last-name"
                type="text"
                aria-label="Last Name"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                value={value.lastName ?? ""}
                onChange={(e) => onChange({ lastName: e.target.value })}
                placeholder="Last Name"
              />
            </div>
          </div>
        </Section>
      )}

      {slide === 3 && (
        <Section title="Phone">
          <div className="mt-2" role="group" aria-label="Phone">
            <label className="block text-sm font-medium text-gray-800" htmlFor="contact-phone">
              Phone
            </label>
            <input
              id="contact-phone"
              type="tel"
              aria-label="Phone"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              value={value.phone ?? ""}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="(555) 555-5555"
            />
          </div>
        </Section>
      )}
    </div>
  );
}
