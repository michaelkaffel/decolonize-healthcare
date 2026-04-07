import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/', element: <div>Home — placeholder</div>
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;