import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { PropsWithChildren } from "react";
import stylesheet from "~/tailwind.css";
import NavBar from "./components/navbar";
import { getUser, getUserId } from "./utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  const user = await getUser(request)

  try {
    if (!userId){
      return json({ isLoggedIn: false })
    } else {
      return json({ isLoggedIn: true, user })
    }
  } catch (e){
    console.error("page not found", e)
    return json({})
  }
}


function Document({
  children,
  title,
}: PropsWithChildren<{ title?: string }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        {title ? <title>{title}</title> : null}
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>()
  return (
    <Document>
      <NavBar data={data} />
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Document
        title={`${error.status} ${error.statusText}`}
      >
        <div>
          <h1>
            {error.status} {error.statusText}
          </h1>
        </div>
      </Document>
    );
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Unknown error";
  return (
    <Document title="Uh-oh!">
      <div>
        <h1>App Error</h1>
        <pre>{errorMessage}</pre>
      </div>
    </Document>
  );
}
