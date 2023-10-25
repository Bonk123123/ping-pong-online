import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import StartPage from './pages/StartPage/StartPage';
import ServersPage from './pages/ServersPage/ServersPage';
import GamePage from './pages/GamePage/GamePage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <StartPage />,
    },
    {
        path: 'servers',
        element: <ServersPage />,
    },
    {
        path: 'servers/:id',
        element: <GamePage />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
);
