import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AnswerForm } from "~/components/answerForm";
import { Avatars } from "~/components/avatars";
import { Posts } from "~/components/posts";
import { db } from "~/utils/db.server";
import { getUser, getUserId, requireUserId, requireUserUsername } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  if (!userId){
    throw redirect("/login")
  }
  const user = await getUser(request)
  const postsList = await db.post.findMany({
    orderBy: { createdAt: "desc" },
  })

  const postsSchema = z.object({
    id: z.string(),
    posterUsername: z.string(),
    content: z.string(),
    createdAt: z.date(),
  })

  try {
    const postListItems = postsList.map((post) => ({
      ...postsSchema.parse(post)
    }))
    return json({ postListItems, user })
  } catch (e){
    console.error("there was an error fetching post data", e)
    return redirect('/')
  }
}

type FieldErrors = { [key: string]: string }

export const action = async({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)
  const user = await getUser(request)
  const formPayload = Object.fromEntries(await request.formData())
  const postSchema = z.object({
    content: z.string().min(1, { message: "Must be more than 0 characters" }),
  })
  const newPost = postSchema.safeParse(formPayload)
  console.log("New Post: ", newPost)

  if (!newPost.success){
    const errors: FieldErrors = {}
    newPost.error.issues.forEach(issue => {
        const path = issue.path.join(".")
        errors[path] = issue.message
    })
    return json({ errors, data: formPayload }, { status: 400 })
  } else {
    const post = await db.post.create({
      data: { ...newPost.data, posterId: userId, posterUsername: user?.username }
    })
    const updateUser = await db.user.update({
      where: {
        id: userId
      }, 
      data: {
        hasAnsweredQuestion: true

      }
    })
    return redirect("/")
  }

}


export default function IndexRoute(){
  const data = useLoaderData<typeof loader>()
  return (
    <div>
      <div className="bg-rose-500 p-6">
        <h1 className="flex justify-center p-4 text-xl md:text-3xl text-stone-900">
          Question of the Day:
        </h1>
        <h1 className="flex justify-center p-4 text-2xl md:text-6xl font-bold text-stone-100 drop-shadow-lg">What is your favorite food?</h1>
      </div>
      <div className="md:p-6 h-screen">
      {data?.user?.hasAnsweredQuestion ? (
        <div className="p-4">
          <div className="bg-stone-100 p-2 rounded">
            <Avatars />
          </div>
          {data.postListItems.map(({ id, posterUsername, content, createdAt }) => (
            <Posts key={id} username={posterUsername} content={content} createdAt={createdAt} />
          ))}
        </div>
        ) : (
        <AnswerForm />
        )}
      </div>
    </div>
  )
}

