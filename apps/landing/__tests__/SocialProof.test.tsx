import { render, screen } from '@testing-library/react';
import SocialProof from '@/components/SocialProof';

describe('SocialProof', () => {
  it('renders title and placeholder review widget', () => {
    render(<SocialProof />);
    expect(screen.getByText(/OKC's Most Trusted/i)).toBeInTheDocument();
    expect(screen.getByText(/Live reviews widget placeholder/i)).toBeInTheDocument();
  });
});
