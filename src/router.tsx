import { RouteObject } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';

export const router: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
];
