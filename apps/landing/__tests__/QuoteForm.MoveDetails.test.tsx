import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuoteForm from '@/components/quote/QuoteForm';

describe('QuoteForm - Step 2: Move Type & Property (Conditional)', () => {
  const goToStep2 = async (service: string) => {
    const user = userEvent.setup();
    render(<QuoteForm onBack={() => {}} />);
    const svcGroup = screen.getByRole('group', { name: /service type options/i });
    const btn = within(svcGroup).getByRole('button', { name: service });
    await user.click(btn);
    await user.click(screen.getByRole('button', { name: /continue/i }));
  };

  it('Commercial: shows commercial property types and sizes', async () => {
    await goToStep2('Commercial');

    const propGroup = screen.getByRole('group', { name: /commercial property type/i });
    const propButtons = within(propGroup).getAllByRole('button');
    expect(propButtons.map((b) => b.textContent?.trim())).toEqual([
      'Office',
      'Retail',
      'Warehouse',
      'Medical',
    ]);

    // Choose Office
    await userEvent.click(within(propGroup).getByRole('button', { name: 'Office' }));

    const sizeGroup = screen.getByRole('group', { name: /commercial move size/i });
    const sizeButtons = within(sizeGroup).getAllByRole('button');
    expect(sizeButtons.map((b) => b.textContent?.trim())).toEqual([
      'Small Space',
      'Medium Space',
      'Large Space',
      'Few Items',
    ]);
  });

  it('Residential (Moving): shows residential property and appropriate sizes', async () => {
    await goToStep2('Moving');

    const propGroup = screen.getByRole('group', { name: /property type/i });
    const labels = within(propGroup).getAllByRole('button').map((b) => b.textContent?.trim());
    expect(labels).toEqual(['Apartment-Condo', 'House', 'Townhouse', 'Storage']);

    // Apartment-Condo path
    await userEvent.click(within(propGroup).getByRole('button', { name: 'Apartment-Condo' }));
    const aptSizes = screen.getByRole('group', { name: /apartment\/condo size/i });
    expect(within(aptSizes).getAllByRole('button').map((b) => b.textContent?.trim())).toEqual([
      'Studio 1bed',
      '2 bed',
      '3 bed',
      '4 bed',
      'Few Items',
    ]);

    // Switch to House
    await userEvent.click(within(propGroup).getByRole('button', { name: 'House' }));
    const houseSizes = screen.getByRole('group', { name: /house\/townhouse size/i });
    expect(within(houseSizes).getAllByRole('button').map((b) => b.textContent?.trim())).toEqual([
      '1bed',
      '2 bed',
      '3 bed',
      '4 bed',
      '5 bed',
      'Few Items',
    ]);
    // Extras visible as a single checkbox with explanatory text
    const largeGroup = screen.getByRole('group', { name: /large home/i });
    expect(largeGroup).toBeInTheDocument();
    expect(within(largeGroup).getByRole('checkbox', { name: /large\?/i })).toBeInTheDocument();
    expect(within(largeGroup).getByText(/includes extra rooms/i)).toBeInTheDocument();

    // Storage path
    await userEvent.click(within(propGroup).getByRole('button', { name: 'Storage' }));
    const storageSizes = screen.getByRole('group', { name: /storage unit size/i });
    expect(within(storageSizes).getAllByRole('button').map((b) => b.textContent?.trim())).toEqual([
      '5×5',
      '5×10',
      '10×10',
      '10×15',
      '10×20',
      'Few Items',
    ]);
  });

  it('Moving Labor: shows labor type and same size flows', async () => {
    await goToStep2('Moving Labor');

    // Labor type group
    const laborGroup = screen.getByRole('group', { name: /labor type/i });
    expect(within(laborGroup).getAllByRole('button').map((b) => b.textContent?.trim())).toEqual([
      'Load-Only',
      'Unload-Only',
      'Both',
      'Restaging / In-Home',
    ]);

    // Choose property & see sizes
    const propGroup = screen.getByRole('group', { name: /property type/i });
    await userEvent.click(within(propGroup).getByRole('button', { name: 'Apartment-Condo' }));
    const aptSizes = screen.getByRole('group', { name: /apartment\/condo size/i });
    expect(aptSizes).toBeInTheDocument();
  });

  it('Junk Removal: shows junk property types and volume options', async () => {
    await goToStep2('Junk Removal');

    const propGroup = screen.getByRole('group', { name: /property type/i });
    expect(within(propGroup).getAllByRole('button').map((b) => b.textContent?.trim())).toEqual([
      'House',
      'Apartment',
      'Storage',
      'Commercial',
    ]);

    // Volume group visible
    const volGroup = screen.getByRole('group', { name: /junk volume/i });
    expect(within(volGroup).getByRole('button', { name: '¼ Truck' })).toBeInTheDocument();
  });
});
