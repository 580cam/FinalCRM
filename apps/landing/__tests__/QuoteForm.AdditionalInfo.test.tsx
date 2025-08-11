import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuoteForm from '@/components/quote/QuoteForm';

const goToStep4Junk = async () => {
  const user = userEvent.setup();
  render(<QuoteForm onBack={() => {}} />);
  const svcGroup = screen.getByRole('group', { name: /service type options/i });
  await user.click(within(svcGroup).getByRole('button', { name: 'Junk Removal' }));
  await user.click(screen.getByRole('button', { name: /continue to step 2/i }));

  const propGroup = screen.getByRole('group', { name: /property type/i });
  await user.click(within(propGroup).getByRole('button', { name: 'House' }));
  const volGroup = screen.getByRole('group', { name: /junk volume/i });
  await user.click(within(volGroup).getByRole('button', { name: '¼ Truck' }));
  await user.click(screen.getByRole('button', { name: /continue to step 3/i }));

  // Single-address flow; proceed to Step 4
  await user.click(screen.getByRole('button', { name: /continue to step 4/i }));
  return user;
};

const goToStep4WhiteGlove = async () => {
  const user = userEvent.setup();
  render(<QuoteForm onBack={() => {}} />);
  const svcGroup = screen.getByRole('group', { name: /service type options/i });
  await user.click(within(svcGroup).getByRole('button', { name: 'White Glove' }));
  await user.click(screen.getByRole('button', { name: /continue to step 2/i }));

  // Residential path: pick property + size
  const propGroup = screen.getByRole('group', { name: /property type/i });
  await user.click(within(propGroup).getByRole('button', { name: 'Apartment-Condo' }));
  const aptSizes = screen.getByRole('group', { name: /apartment\/condo size/i });
  await user.click(within(aptSizes).getByRole('button', { name: 'Studio 1bed' }));
  await user.click(screen.getByRole('button', { name: /continue to step 3/i }));

  // Dual-address flow: go From -> To -> Step 4
  await user.click(screen.getByRole('button', { name: /continue to moving to/i }));
  await user.click(screen.getByRole('button', { name: /continue to step 4/i }));
  return user;
};

const getAdditionalInfoGroup = () => screen.getByRole('group', { name: /additional info \(select all that apply\)/i });

test('Step 4 renders all Additional Info options and supports multi-select (Junk Removal)', async () => {
  const user = await goToStep4Junk();

  // Heading and instruction
  expect(screen.getByRole('heading', { name: /step 4: additional info/i })).toBeInTheDocument();
  // Use the exact sentence to avoid matching the secondary heading text.
  expect(screen.getByText('Select all that apply.')).toBeInTheDocument();

  const group = getAdditionalInfoGroup();
  const labels = [
    'Piano',
    'Gun Safe',
    'Bulky Item (Hot Tub, Exercise Machine, Play Set, etc.)',
    'Antique / Artwork (>$2k)',
    'Packing Needed?',
    'Need Help Within 24 hrs?',
    'Storage Needed?',
  ];

  for (const l of labels) {
    expect(within(group).getByRole('button', { name: l })).toBeInTheDocument();
  }

  // Multi-select: toggle a few
  const piano = within(group).getByRole('button', { name: 'Piano' });
  const packing = within(group).getByRole('button', { name: 'Packing Needed?' });
  expect(piano).toHaveAttribute('aria-pressed', 'false');
  expect(packing).toHaveAttribute('aria-pressed', 'false');
  await user.click(piano);
  await user.click(packing);
  expect(piano).toHaveAttribute('aria-pressed', 'true');
  expect(packing).toHaveAttribute('aria-pressed', 'true');
});

test('Step 4 label uses "Packing Needed?" for White Glove (per spec)', async () => {
  await goToStep4WhiteGlove();
  const group = getAdditionalInfoGroup();
  expect(within(group).getByRole('button', { name: 'Packing Needed?' })).toBeInTheDocument();
});
