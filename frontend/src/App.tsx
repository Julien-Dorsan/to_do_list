import './App.css';

import {
    createBrowserRouter,
    Route,
    createRoutesFromElements,
    RouterProvider,
} from 'react-router-dom';


const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<></>}>
        </Route>
    )
)

function App() {
    return (
        <RouterProvider router={router} />
    )
}

export default App
