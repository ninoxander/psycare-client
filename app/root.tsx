import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";
// import Navbar, { getNavbarData } from "~/components/navbar";


export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];
/*

No sirve por ahora.

export async function loader({ request }: LoaderFunctionArgs) {
  const navbarData = await getNavbarData(request)

  return json({
    navbarData,
  })
}
*/
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script src="https://kit.fontawesome.com/38a3806765.js" crossOrigin="anonymous"></script>
      </head>
      <body>
        
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
