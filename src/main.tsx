import * as React from "react";
import * as ReactDOM from "react-dom/client";
import Home from './Home.tsx';
import Learn from './Learn.tsx';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Terms from './Terms.tsx';
import Privacy from './Privacy.tsx';
import ExternalRedirect from './components/ExternalRedirect.tsx';
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    // element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/learn",
        element: <Learn />,
      },
      {
        path: "/terms",
        element: <Terms />,
      },
      {
        path: "/privacy",
        element: <Privacy />,
      },
      {
        path: "/pricing",
        element: <ExternalRedirect to="https://buy.stripe.com/eVaaFsakx9k0gZG4gg" />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
