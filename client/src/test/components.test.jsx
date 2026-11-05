import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Card } from '../components/ui/Card';

describe('ClubRelay Design System UI Primitives', () => {
  it('renders primary button with forest styling', () => {
    render(<Button variant="primary">Launch Handover</Button>);
    const btn = screen.getByRole('button', { name: /launch handover/i });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('bg-forest-700');
  });

  it('renders status badge properly', () => {
    render(<Badge variant="approved">Approved</Badge>);
    const badge = screen.getByText('Approved');
    expect(badge).toBeInTheDocument();
  });

  it('renders progress bar with correct percentage value', () => {
    render(<Progress value={85} max={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar.getAttribute('aria-valuenow')).toBe('85');
  });

  it('renders card component with content', () => {
    render(
      <Card>
        <h3>Upcoming Event</h3>
        <p>DevFest 2026</p>
      </Card>
    );
    expect(screen.getByText('Upcoming Event')).toBeInTheDocument();
    expect(screen.getByText('DevFest 2026')).toBeInTheDocument();
  });
});

