import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuoteForm from '@/components/quote/QuoteForm';

async function goToStep5WithSelections({ service = 'Moving' }: { service?: 'Moving' | 'Junk Removal' } = {}) {
  const user = userEvent.setup();
  render(<QuoteForm onBack={() => {}} />);

  // Step 1: Service
  const svcGroup = screen.getByRole('group', { name: /service type options/i });
  await user.click(within(svcGroup).getByRole('button', { name: service }));
  await user.click(screen.getByRole('button', { name: /continue to step 2/i }));

  if (service === 'Junk Removal') {
    const propGroup = screen.getByRole('group', { name: /property type/i });
    await user.click(within(propGroup).getByRole('button', { name: 'House' }));
    const volGroup = screen.getByRole('group', { name: /junk volume/i });
    await user.click(within(volGroup).getByRole('button', { name: '¼ Truck' }));
    await user.click(screen.getByRole('button', { name: /continue to step 3/i }));
    await user.click(screen.getByRole('button', { name: /continue to step 4/i }));
  } else {
    const propGroup = screen.getByRole('group', { name: /property type/i });
    await user.click(within(propGroup).getByRole('button', { name: 'Apartment-Condo' }));
    const sizeGroup = screen.getByRole('group', { name: /apartment\/condo size/i });
    await user.click(within(sizeGroup).getByRole('button', { name: 'Studio 1bed' }));
    await user.click(screen.getByRole('button', { name: /continue to step 3/i }));
    await user.click(screen.getByRole('button', { name: /continue to moving to/i }));
    await user.click(screen.getByRole('button', { name: /continue to step 4/i }));
  }

  // Step 4: select multiple options to trigger follow-ups
  const group = screen.getByRole('group', { name: /additional info \(select all that apply\)/i });
  await user.click(within(group).getByRole('button', { name: 'Packing Needed?' }));
  await user.click(within(group).getByRole('button', { name: 'Piano' }));
  await user.click(within(group).getByRole('button', { name: 'Gun Safe' }));
  await user.click(within(group).getByRole('button', { name: 'Antique / Artwork (>$2k)' }));
  await user.click(within(group).getByRole('button', { name: 'Storage Needed?' }));
  await user.click(within(group).getByRole('button', { name: 'Bulky Item (Hot Tub, Exercise Machine, Play Set, etc.)' }));

  await user.click(screen.getByRole('button', { name: /continue to step 5/i }));

  return user;
}

test('Step 5 renders conditional sections exactly as per spec when selected in Step 4', async () => {
  const user = await goToStep5WithSelections();

  // Heading present
  expect(screen.getByRole('heading', { name: /step 5: conditional questions/i })).toBeInTheDocument();

  // Packing → Minimalist | Normal | Pack Rat
  const packGroup = screen.getByRole('group', { name: /packing level/i });
  for (const l of ['Minimalist', 'Normal', 'Pack Rat']) {
    expect(within(packGroup).getByRole('button', { name: l })).toBeInTheDocument();
  }
  await user.click(within(packGroup).getByRole('button', { name: 'Normal' }));

  // Piano → Upright | Baby Grand | Grand
  const pianoGroup = screen.getByRole('group', { name: /piano type/i });
  for (const l of ['Upright', 'Baby Grand', 'Grand']) {
    expect(within(pianoGroup).getByRole('button', { name: l })).toBeInTheDocument();
  }
  await user.click(within(pianoGroup).getByRole('button', { name: 'Upright' }));

  // Gun Safe → Weight <350 | 350-500 | 500+
  const gunGroup = screen.getByRole('group', { name: /gun safe weight/i });
  for (const l of ['Weight <350', '350-500', '500+']) {
    expect(within(gunGroup).getByRole('button', { name: l })).toBeInTheDocument();
  }
  await user.click(within(gunGroup).getByRole('button', { name: '350-500' }));

  // Antique → Text + checkbox
  const antiqueGroup = screen.getByRole('group', { name: /antique \/ artwork details/i });
  const detailsInput = within(antiqueGroup).getByRole('textbox');
  await user.type(detailsInput, 'Large framed painting');
  const crateCheckbox = within(antiqueGroup).getByRole('checkbox', { name: /need custom crate\?/i });
  await user.click(crateCheckbox);

  // Storage → Overnight (days?) | Long-term (weeks?)
  const storageGroup = screen.getByRole('group', { name: /storage duration/i });
  await user.click(within(storageGroup).getByRole('button', { name: 'Overnight' }));
  const overnightGroup = screen.getByRole('group', { name: /overnight duration/i });
  const daysInput = within(overnightGroup).getByRole('spinbutton');
  await user.clear(daysInput);
  await user.type(daysInput, '2');

  await user.click(within(storageGroup).getByRole('button', { name: 'Long-term' }));
  const longTermGroup = screen.getByRole('group', { name: /long-term duration/i });
  const weeksInput = within(longTermGroup).getByRole('spinbutton');
  await user.clear(weeksInput);
  await user.type(weeksInput, '4');

  // Bulky → Describe item text field exists
  const bulkyGroup = screen.getByRole('group', { name: /bulky item description/i });
  expect(within(bulkyGroup).getByRole('textbox')).toBeInTheDocument();
});

test('Step 5 hides sections when their Step 4 option is not selected', async () => {
  const user = userEvent.setup();
  render(<QuoteForm onBack={() => {}} />);

  // Minimal path: choose service and size, then no selections on Step 4
  const svcGroup = screen.getByRole('group', { name: /service type options/i });
  await user.click(within(svcGroup).getByRole('button', { name: 'Moving' }));
  await user.click(screen.getByRole('button', { name: /continue to step 2/i }));
  const propGroup = screen.getByRole('group', { name: /property type/i });
  await user.click(within(propGroup).getByRole('button', { name: 'Apartment-Condo' }));
  const sizeGroup = screen.getByRole('group', { name: /apartment\/condo size/i });
  await user.click(within(sizeGroup).getByRole('button', { name: 'Studio 1bed' }));
  await user.click(screen.getByRole('button', { name: /continue to step 3/i }));
  await user.click(screen.getByRole('button', { name: /continue to moving to/i }));
  await user.click(screen.getByRole('button', { name: /continue to step 4/i }));

  // Don't click any additional info toggles; go to step 5
  await user.click(screen.getByRole('button', { name: /continue to step 5/i }));

  // None of the follow-up groups should appear
  expect(screen.queryByRole('group', { name: /packing level/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('group', { name: /piano type/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('group', { name: /gun safe weight/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('group', { name: /antique \/ artwork details/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('group', { name: /storage duration/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('group', { name: /bulky item description/i })).not.toBeInTheDocument();
});
