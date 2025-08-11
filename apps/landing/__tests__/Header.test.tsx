import { render, screen } from '@testing-library/react';
import Header from '@/components/Header';

describe('Header', () => {
  it('renders trust bar and phone', () => {
    render(<Header />);
    expect(screen.getByText(/Local & Family-Owned/i)).toBeInTheDocument();
    expect(screen.getByText('(580) 595-1262')).toBeInTheDocument();
  });
});
