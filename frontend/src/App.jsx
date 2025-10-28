import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import RootUserLayout from './layout/user/rootUserLayout';
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

const App = () => {
    return (
        <RouterProvider router={router} />
    )
}

export default App;
