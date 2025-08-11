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

test('Moving: Step 3 uses sub-slides (From then To); stairs select on From; Multiple stops on To; Step 2 gating works', async () => {
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

  // Slide 1: From block only
  expect(screen.getByRole('heading', { level: 4, name: /moving from/i })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 4, name: /moving to/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: /multiple stops/i })).not.toBeInTheDocument();

  // Interaction: select stairs on From
  const fromStairs = screen.getByRole('group', { name: /from stairs/i });
  const oneFlight = within(fromStairs).getByRole('button', { name: '1 flight' });
  expect(oneFlight).toHaveAttribute('aria-pressed', 'false');
  await user.click(oneFlight);
  expect(oneFlight).toHaveAttribute('aria-pressed', 'true');

  // Next to Slide 2 (To)
  const toBtn = screen.getByRole('button', { name: /continue to moving to/i });
  await user.click(toBtn);

  // Slide 2: To block + multiple stops
  expect(screen.getByRole('heading', { level: 4, name: /moving to/i })).toBeInTheDocument();
  const multi = screen.getByRole('checkbox', { name: /multiple stops/i });
  expect(multi).toBeInTheDocument();
});

test('Additional Stop: shows same questions (address, stairs, walk) plus Stop Type on last slide', async () => {
  const user = await goToStep2('Moving');

  // Step 2 selections
  const propGroup = screen.getByRole('group', { name: /property type/i });
  await user.click(within(propGroup).getByRole('button', { name: 'Apartment-Condo' }));
  const aptSizes = screen.getByRole('group', { name: /apartment\/condo size/i });
  await user.click(within(aptSizes).getByRole('button', { name: 'Studio 1bed' }));

  // To Step 3 (From slide), then to To slide
  await user.click(screen.getByRole('button', { name: /continue to step 3/i }));
  await user.click(screen.getByRole('button', { name: /continue to moving to/i }));

  // Enable multiple stops
  const multi = screen.getByRole('checkbox', { name: /multiple stops/i });
  await user.click(multi);

  // Additional Stop section appears
  expect(screen.getByRole('heading', { level: 4, name: /additional stop/i })).toBeInTheDocument();

  // Stairs group present and interactive
  const stairs = screen.getByRole('group', { name: /additional stop stairs/i });
  const two = within(stairs).getByRole('button', { name: '2 flight' });
  expect(two).toHaveAttribute('aria-pressed', 'false');
  await user.click(two);
  expect(two).toHaveAttribute('aria-pressed', 'true');

  // Walk distance present
  const walk = screen.getByRole('group', { name: /additional stop walk distance/i });
  expect(within(walk).getByRole('button', { name: '300-400 ft' })).toBeInTheDocument();

  // Stop Type present and selectable
  const stopType = screen.getByRole('group', { name: /additional stop type/i });
  const pickup = within(stopType).getByRole('button', { name: 'Pickup' });
  await user.click(pickup);
  expect(pickup).toHaveAttribute('aria-pressed', 'true');
});
