import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './card';

describe('Card', () => {
  it('should render a card with content', () => {
    render(
      <Card>
        <CardContent>Test content</CardContent>
      </Card>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render a complete card with header, title, description, content, and footer', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Full Card</CardTitle>
          <CardDescription>Complete example</CardDescription>
        </CardHeader>
        <CardContent>Main content area</CardContent>
        <CardFooter>Action buttons</CardFooter>
      </Card>
    );
    expect(screen.getByText('Full Card')).toBeInTheDocument();
    expect(screen.getByText('Complete example')).toBeInTheDocument();
    expect(screen.getByText('Main content area')).toBeInTheDocument();
    expect(screen.getByText('Action buttons')).toBeInTheDocument();
  });
});
