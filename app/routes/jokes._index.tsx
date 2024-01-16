import { LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Link, isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react"
import { z } from "zod"
import { db } from "~/utils/db.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const count = await db.joke.count()
  const randomRowNumber = Math.floor(Math.random() * count)
  const [randomJoke] = await db.joke.findMany({
    skip: randomRowNumber,
    take: 1,
  })

  if (!randomJoke){
    throw new Response("No random joke found", { status: 404 })
  }

  const randomJokeSchema = z.object({
    id: z.string(),
    name: z.string(),
    content: z.string(),
  })

  try {
    const randomJokeItem = randomJokeSchema.parse(randomJoke)
    return json({ randomJokeItem })
  } catch (e){
    console.error("joke not found", e)
    return redirect('/jokes')
  }
}

export default function JokesIndexRoute() {
  const data = useLoaderData<typeof loader>()
  return (
    <div>
      <p>Here is a random joke:</p>
      <p>
        {data.randomJokeItem.content}
      </p>
      <Link to={data.randomJokeItem.id}>"{data.randomJokeItem.name}" Permalink</Link>
    </div>
  );
}

export function ErrorBoundary(){
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404){
    return (
      <div>
        <p>There are no jokes to display.</p>
        <Link to="new">Add your own</Link>
      </div>
    )
  }
  return (
    <div>
      I did a whoopsies.
    </div>
  )
}
