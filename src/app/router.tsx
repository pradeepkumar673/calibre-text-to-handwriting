import { createBrowserRouter } from 'react-router';
import EditorPage from '@/features/editor/EditorPage';
import GeneratorPage from '@/features/generator/GeneratorPage';
import HomePage from '@/features/home/HomePage';
import PaperDesignerPage from '@/features/paper/PaperDesignerPage';
import PdfToolsPage from '@/features/pdf/PdfToolsPage';
import ProfilesPage from '@/features/profiles/ProfilesPage';
import SettingsPage from '@/features/settings/SettingsPage';
import TemplatesPage from '@/features/templates/TemplatesPage';
import App from './App';
import NotFoundPage from './NotFoundPage';

// Browser router. The App shell wraps every section, and unknown paths fall through to the 404 page.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'generator', element: <GeneratorPage /> },
      { path: 'editor', element: <EditorPage /> },
      { path: 'profiles', element: <ProfilesPage /> },
      { path: 'paper-designer', element: <PaperDesignerPage /> },
      { path: 'pdf-tools', element: <PdfToolsPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
