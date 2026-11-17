import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { appRoutes } from '@/app/router';

// One entry per route. Each heading must match the page's single h1 exactly.
const routes = [
  { name: 'home', path: '/', heading: 'Welcome to CalligrapheWrite' },
  { name: 'generator', path: '/generator', heading: 'Generator' },
  { name: 'editor', path: '/editor', heading: 'Editor' },
  { name: 'profiles', path: '/profiles', heading: 'Handwriting Profiles' },
  { name: 'paper designer', path: '/paper-designer', heading: 'Paper Designer' },
  { name: 'pdf tools', path: '/pdf-tools', heading: 'PDF Tools' },
  { name: 'templates', path: '/templates', heading: 'Templates' },
  { name: 'settings', path: '/settings', heading: 'Settings' },
  { name: 'not found', path: '/no-such-page', heading: '404: Page not found' },
];

describe.each(routes)('route $name ($path)', ({ path, heading }) => {
  it('renders exactly one h1 with the expected heading', () => {
    const memoryRouter = createMemoryRouter(appRoutes, { initialEntries: [path] });
    render(<RouterProvider router={memoryRouter} />);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]?.textContent).toBe(heading);
  });
});
