import './App.css';

import RootUserLayout from './layout/rootUserLayout';

import {
    createBrowserRouter,
    Route,
    createRoutesFromElements,
    RouterProvider,
} from 'react-router-dom';


const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<RootUserLayout />}>
        </Route>
    )
)

function App() {
    return (
        <RouterProvider router={router} />
    )
}

export default App
