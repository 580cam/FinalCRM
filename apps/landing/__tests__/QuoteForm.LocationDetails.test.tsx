import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuoteForm from '@/components/quote/QuoteForm';

const goToStep2 = async (service: string) => {
  const user = userEvent.setup();
  render(<QuoteForm onBack={() => {}} />);
  const svcGroup = screen.getByRole('group', { name: /service type options/i });
  const btn = within(svcGroup).getByRole('button', { name: service });
  await user.click(btn);
  await user.click(screen.getByRole('button', { name: /continue/i }));
  return user;
};

test('Junk Removal: Step 3 renders single Service Address with stairs and walk tiles', async () => {
  const user = await goToStep2('Junk Removal');

  // Step 2: choose property + volume
  const propGroup = screen.getByRole('group', { name: /property type/i });
  await user.click(within(propGroup).getByRole('button', { name: 'House' }));
  const volGroup = screen.getByRole('group', { name: /junk volume/i });
  await user.click(within(volGroup).getByRole('button', { name: '¼ Truck' }));

  // Next to Step 3
  const nextBtn = screen.getByRole('button', { name: /continue to step 3/i });
  await user.click(nextBtn);

  // Single address block
  expect(screen.getByRole('heading', { level: 4, name: /service address/i })).toBeInTheDocument();
  // Stairs group
  const stairs = screen.getByRole('group', { name: /service stairs/i });
  const stairOptions = within(stairs).getAllByRole('button').map((b) => b.textContent?.trim());
  expect(stairOptions).toEqual(['1 flight', '2 flight', '3 flight', '4 flight', '5 flight', '6 flight']);
  // Walk group
  const walk = screen.getByRole('group', { name: /service walk distance/i });
  const walkOptions = within(walk).getAllByRole('button').map((b) => b.textContent?.trim());
  expect(walkOptions).toEqual(['0-100 ft', '100-200 ft', '200-300 ft', '300-400 ft', '400-500 ft', '500+ ft']);
});

test('Moving: Step 3 shows From/To sections; stairs toggles select state; Step 2 gating works', async () => {
  const user = await goToStep2('Moving');

  // Step 2: property chosen but size not yet -> Next disabled
  const propGroup = screen.getByRole('group', { name: /property type/i });
  await user.click(within(propGroup).getByRole('button', { name: 'Apartment-Condo' }));
  const nextBtn = screen.getByRole('button', { name: /continue to step 3/i });
  expect(nextBtn).toBeDisabled();

  // Choose size to enable Next
  const aptSizes = screen.getByRole('group', { name: /apartment\/condo size/i });
  await user.click(within(aptSizes).getByRole('button', { name: 'Studio 1bed' }));
  expect(nextBtn).not.toBeDisabled();
  await user.click(nextBtn);

  // From/To blocks
  expect(screen.getByRole('heading', { level: 4, name: /moving from/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 4, name: /moving to/i })).toBeInTheDocument();

  // Interaction: select stairs on From
  const fromStairs = screen.getByRole('group', { name: /from stairs/i });
  const oneFlight = within(fromStairs).getByRole('button', { name: '1 flight' });
  expect(oneFlight).toHaveAttribute('aria-pressed', 'false');
  await user.click(oneFlight);
  expect(oneFlight).toHaveAttribute('aria-pressed', 'true');
});
