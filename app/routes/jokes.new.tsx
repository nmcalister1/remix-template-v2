import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, isRouteErrorResponse, useActionData, useNavigation, useRouteError } from "@remix-run/react";
import { HTMLAttributes } from "react";
import { z } from "zod";
import { JokeDisplay } from "~/components/joke";
import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";

interface ErrorMessageProps extends HTMLAttributes<HTMLParagraphElement>{}

function ErrorMessage({...props}: ErrorMessageProps){
  return props.children ? <p {...props}></p> : null
}

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "That joke is too short";
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return "That joke's name is too short";
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  if (!userId){
    throw new Response("Unauthorized", { status: 401 })
  }
  return json({})
}

type FieldErrors = { [key: string]: string }

export const action = async ({ request }: ActionFunctionArgs ) => {
  const userId = await requireUserId(request)
  const formPayload = Object.fromEntries(await request.formData())
  const jokeSchema = z.object({
    name: z.string().min(3, { message: "Must be more than 2 characters" }),
    content: z.string().min(10, { message: "Must be more than 9 characters long" }),
  })
  const newJoke = jokeSchema.safeParse(formPayload)

  if (!newJoke.success){
    const errors: FieldErrors = {}
    newJoke.error.issues.forEach(issue => {
        const path = issue.path.join(".")
        errors[path] = issue.message
    })
    return json({ errors, data: formPayload }, { status: 400 })
  } else {
    const joke = await db.joke.create({
      data: { ...newJoke.data, jokesterId: userId }
    })
    return redirect(`/jokes/${joke.id}`)
  }

}

export default function NewJokeRoute() {
    const actionData = useActionData<typeof action>()
    const navigation = useNavigation()

    if (navigation.formData){
      const content = navigation.formData.get("content")
      const name = navigation.formData.get("name")
      if (
        typeof content === "string" &&
        typeof name === "string" &&
        !validateJokeContent(content) &&
        !validateJokeName(name)
      ) {
        return <JokeDisplay canDelete={false} isOwner={true} joke={{ name, content }} />
      }
    }

    return (
      <div>
        <p>Add your own hilarious joke</p>
        <Form method="post">
          <div>
            <label>
              Name: <input defaultValue={actionData?.data?.name} type="text" name="name" />
            </label>
            <ErrorMessage>
                {actionData?.errors?.name}
            </ErrorMessage>
          </div>
          <div>
            <label>
              Content: <textarea defaultValue={actionData?.data?.content} name="content" />
            </label>
            <ErrorMessage>
                {actionData?.errors?.content}
            </ErrorMessage>
          </div>
          <div>
            <button type="submit" className="button">
              Add
            </button>
          </div>
        </Form>
      </div>
    );
  }
  
  export function ErrorBoundary(){
    const error = useRouteError()

    if (isRouteErrorResponse(error) && error.status === 401){
      return (
        <div>
          <p>You must be logged in to create a joke.</p>
          <Link to="/login">Login</Link>
        </div>
      )
    }
    return (
      <div>
        Something unexpected went wrong. Sorry about that.
      </div>
    )
  }