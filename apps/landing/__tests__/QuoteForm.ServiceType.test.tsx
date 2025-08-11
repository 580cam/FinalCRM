import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuoteForm from '@/components/quote/QuoteForm';

describe('QuoteForm - Service Type Step', () => {
  it('renders six service type tiles', () => {
    render(<QuoteForm onBack={() => {}} />);

    const group = screen.getByRole('group', { name: /service type options/i });
    const buttons = within(group).getAllByRole('button');
    expect(buttons).toHaveLength(6);

    const labels = buttons.map((b) => b.textContent?.trim());
    expect(labels).toEqual([
      'Moving',
      'Full Service',
      'Moving Labor',
      'White Glove',
      'Commercial',
      'Junk Removal',
    ]);
  });

  it('selects a service type tile on click (aria-pressed=true)', async () => {
    const user = userEvent.setup();
    render(<QuoteForm onBack={() => {}} />);

    const group = screen.getByRole('group', { name: /service type options/i });
    const movingLabor = within(group).getByRole('button', { name: 'Moving Labor' });

    expect(movingLabor).toHaveAttribute('aria-pressed', 'false');
    await user.click(movingLabor);
    expect(movingLabor).toHaveAttribute('aria-pressed', 'true');
  });
});
