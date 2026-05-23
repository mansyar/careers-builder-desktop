import { createHashRouter } from 'react-router-dom';
import { App } from './App';
import { HomePage } from './pages/HomePage';
import { CVBuilderPage } from './pages/CVBuilderPage';
import { JobSearchPage } from './pages/JobSearchPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'cv-builder', element: <CVBuilderPage /> },
      { path: 'job-search', element: <JobSearchPage /> },
    ],
  },
]);
