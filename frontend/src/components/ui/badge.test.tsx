import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders its label', () => {
    render(<Badge>Museums</Badge>);
    expect(screen.getByText('Museums')).toBeInTheDocument();
  });

  it('applies the outline variant class', () => {
    render(<Badge variant="outline">Draft</Badge>);
    expect(screen.getByText('Draft')).toHaveClass('border');
  });
});
