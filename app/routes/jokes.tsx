import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { z } from "zod";
import NavBar from "~/components/navbar";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const jokesList = await db.joke.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
    take: 5,
  })

  const user = await getUser(request)

  const jokesSchema = z.object({
    id: z.string(),
    name: z.string(),
  })
  try {
    const jokeListItems = jokesList.map((joke) => ({
      ...jokesSchema.parse(joke)
    }))
    return json({ jokeListItems, user })
  } catch (e){
    console.error("there was an error fetching joke data", e)
    return redirect('/')
  }
  
};


export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <header>
        {/* <nav>
          <h1>
            <Link
              to="/"
              title="Remix Jokes"
              aria-label="Remix Jokes"
            >
              <span>Jex</span>
            </Link>
          </h1>
          {data.user ? (
            <div>
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to='/login'>Login</Link>
          )}
        </nav> */}
        {/* <NavBar /> */}
        

      </header>
      <main>
        <Outlet />
        {/* <div>
          <div>
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokeListItems.map(({ id, name }) => (
                <li key={id}>
                  <Link prefetch="intent" to={id}>{name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new">
              Add your own
            </Link>
          </div>
          <div>
            <Outlet />
          </div>
        </div> */}
      </main>
    </div>
  );
}

  