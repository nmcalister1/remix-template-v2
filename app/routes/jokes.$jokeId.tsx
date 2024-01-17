import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useParams, useRouteError } from "@remix-run/react";
import { z } from "zod";
import { JokeDisplay } from "~/components/joke";

import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";

export const loader = async ({params, request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  
  if (!joke) {
    throw new Response("What a joke! Not found.", { status: 404});
  }
  const jokeSchema = z.object({
    id: z.string(),
    name: z.string(),
    content: z.string(),
    jokesterId: z.string(),
  })

  try {
    const jokeItem = jokeSchema.parse(joke)
    console.log("JokeItem: ", jokeItem)
    return json({ jokeItem, isOwner: userId === jokeItem.jokesterId })
  } catch (e){
    console.error("joke not found", e)
    return redirect('/jokes')
  }
};

export const action = async({ params, request }: ActionFunctionArgs) => {
  const form = await request.formData()
  if (form.get("intent") !== "delete"){
    throw new Response(`The intent ${form.get("intent")} is not supported`, { status: 400 })
  }
  const userId = await requireUserId(request)
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId }
  })
  if (!joke){
    throw new Response("Can't delete what does not exist", { status: 404 })
  }
  if (joke.jokesterId !== userId){
    throw new Response("Pssh, nice try. That is not your joke.", { status: 403 })
  }
  await db.joke.delete({ where: {id: params.jokeId}})
  return redirect("/jokes")
}

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <JokeDisplay isOwner={data.isOwner} joke={data.jokeItem} />
  );
}

export function ErrorBoundary(){
  const { jokeId } = useParams()
  const error = useRouteError()

  if (isRouteErrorResponse(error)){
    if (error.status === 400){
      return (
        <div>
          {`What your trying to do is not allowed`}
        </div>
      )
    }
    if (error.status === 403){
      return (
        <div>
          {`Sorry, but "${jokeId}" is not your joke.`}
        </div>
      )
    }
    if (error.status === 404){
      return (
        <div>
          {`Huh? What the heck is "${jokeId}"?`}
        </div>
      )
    }
  
  }
  
  return (
    <div>
      {`There was an error loading joke by the id "${jokeId}". Sorry.`}
    </div>
  )
}

  