import { createBrowserRouter } from 'react-router';
import PlaceholderPage from '@/components/PlaceholderPage';
import SettingsPage from '@/features/settings/SettingsPage';
import App from './App';
import NotFoundPage from './NotFoundPage';

// Browser router. The App shell wraps every section, and unknown paths fall through to the 404 page.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <PlaceholderPage
            title="Home"
            description="Start a new handwritten page or open a recent project."
          />
        ),
      },
      {
        path: 'generator',
        element: (
          <PlaceholderPage
            title="Generator"
            description="Turn pasted text into handwritten pages."
          />
        ),
      },
      {
        path: 'editor',
        element: (
          <PlaceholderPage
            title="Editor"
            description="Select, erase, add, replace and annotate generated pages."
          />
        ),
      },
      {
        path: 'profiles',
        element: (
          <PlaceholderPage
            title="Handwriting profiles"
            description="Choose a preloaded style or build your own from a scanned sample sheet."
          />
        ),
      },
      {
        path: 'paper-designer',
        element: (
          <PlaceholderPage
            title="Paper designer"
            description="Set paper size, ruling, margins and colours."
          />
        ),
      },
      {
        path: 'pdf-tools',
        element: (
          <PlaceholderPage
            title="PDF tools"
            description="Load and edit existing handwritten PDFs."
          />
        ),
      },
      {
        path: 'templates',
        element: <PlaceholderPage title="Templates" description="Save and reuse page layouts." />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
