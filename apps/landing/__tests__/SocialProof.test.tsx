import { render, screen } from '@testing-library/react';
import SocialProof from '@/components/SocialProof';

describe('SocialProof', () => {
  it('renders title and Elfsight review container', () => {
    const { container } = render(<SocialProof />);
    expect(screen.getByText(/OKC's Most Trusted/i)).toBeInTheDocument();
    expect(
      container.querySelector('.elfsight-app-a44607a0-95ae-4607-aa37-23352073345a')
    ).toBeInTheDocument();
  });
});
