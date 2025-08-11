import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hero from '@/components/Hero';

describe('Hero', () => {
  it('toggles quote placeholder on CTA click', async () => {
    const user = userEvent.setup();
    render(<Hero />);

    const cta = screen.getByRole('button', { name: /get quote/i });
    await user.click(cta);

    expect(screen.getByText(/Start Your Quote/i)).toBeInTheDocument();

    const back = screen.getByRole('button', { name: /back/i });
    await user.click(back);

    expect(screen.queryByText(/Start Your Quote/i)).not.toBeInTheDocument();
  });
});
