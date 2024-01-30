import { LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { z } from "zod"
import { UserCircle } from "~/components/userCircle"
import { db } from "~/utils/db.server"

export const loader = async ({params }: LoaderFunctionArgs) => {
  const user = await db.user.findUnique({
    where: { username: params.profileUsername },
  });
  
  if (!user) {
    throw new Response("User not found.", { status: 404});
  }
  const userSchema = z.object({
    username: z.string(),
    profilePicture: z.string(),
    fullname: z.string(),
    age: z.string(),
    description: z.string(),
  })

  try {
    const userItem = userSchema.parse(user)
    return json({ userItem })
  } catch (e){
    console.error("user not found", e)
    return redirect('/friends')
  }
}

export default function UserProfileRoute() {
  const data = useLoaderData<typeof loader>()
    return (
        <div className="bg-rose-700 h-screen">
          <div className="pt-6 text-stone-600 font-medium">
            <div className="bg-stone-100 p-6 drop-shadow-lg w-5/6 m-auto rounded-lg">
              <UserCircle user={data?.userItem} className="h-24 w-24 mx-auto flex-shrink-0" />
              <div className="flex justify-center p-2 pt-4">
                <p>Username: <span className="text-rose-600 font-semibold">{data?.userItem?.username}</span></p>
              </div>
              <div className="flex justify-center p-2">
                <p>Full Name: <span className="text-rose-600 font-semibold">{data?.userItem?.fullname}</span></p>
              </div>
              <div className="flex justify-center p-2">
                <p>Age: <span className="text-rose-600 font-semibold">{data?.userItem?.age}</span></p>
              </div>
              <div className="flex justify-center p-2 w-4/6 m-auto">
                <p>Description: <span className="text-rose-600 font-semibold">{data?.userItem?.description}</span></p>
              </div>
            </div>
            
          </div>
            
        </div>
    )
}


