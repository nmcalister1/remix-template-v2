import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { HTMLAttributes } from "react"
import { z } from "zod"
import { UserCircle } from "~/components/userCircle"
import { db } from "~/utils/db.server"
import { getUser, getUserId } from "~/utils/session.server"

export const loader = async ({params, request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  const userUser = await getUser(request)
  
  if (!userId){
    throw redirect("/login")
  }
  if (params.profileUsername === userUser?.username){
    throw redirect("/profile")
  }
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
    const filteredFriends = userUser?.friends.filter((friend) => user.username === friend) 
    console.log(filteredFriends)
    return json({ userItem, filteredFriends })
  } catch (e){
    console.error("user not found", e)
    return redirect('/friends')
  }
}

interface ErrorMessageProps extends HTMLAttributes<HTMLParagraphElement>{}

function ErrorMessage({...props}: ErrorMessageProps){
  return props.children ? <p {...props}></p> : null
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formPayload = Object.fromEntries(await request.formData())
    const user = await getUser(request)
    if (!user){
      return json({ error: "*Must be logged in" })
    }
    console.log("FormPayload" ,formPayload)
    if (formPayload.friendReq === "friend"){
        const receiverUsername = formPayload.receiver
        if (receiverUsername){
          const receiverUsernameValue = receiverUsername.toString()
          
          const alreadySentRequest = await db.friendrequest.findMany()
          if (alreadySentRequest.length !== 0){
            const requestFilter = alreadySentRequest.filter((request) => request.senderUsername === user.username && request.receiverUsername === receiverUsernameValue)
            if (requestFilter.length !== 0){
              return json({ errors: `You have already sent ${receiverUsername} a friend request.`})
            }
          }

          const otherPersonSentFriendReqAlready = await db.friendrequest.findMany()
          if (alreadySentRequest.length !== 0){
            const requestFilter = otherPersonSentFriendReqAlready.filter((request) => request.senderUsername === receiverUsernameValue && request.receiverUsername === user.username)
            if (requestFilter.length !== 0){
              return json({ errors: `${receiverUsername} has already sent you a friend request.`})
            }
          }
          
          const friendReq = await db.friendrequest.create({
            data: {
              senderUsername: user.username,
              receiverUsername: receiverUsernameValue
            }
          })
          return json({ successFriendRequest: "Your friend request has been sent!" })
        } else {
          return json({ formPayload, errors: "Something went wrong"}, {status: 400})
        }
        
    } else if (formPayload.friendReq === "unfriend"){
      console.log("inside the unfriend statement")
      const receiverUsername = formPayload.receiver
      console.log("receiver username: ", receiverUsername)
        if (receiverUsername){
          const receiverUsernameValue = receiverUsername.toString()

          const updatedFriends = user.friends.filter(friend => friend !== receiverUsernameValue);

          await db.user.update({
            where: { username: user.username },
            data: {
              friends: updatedFriends,
            },
          });

          const receiverUser = await db.user.findFirst({
            where: { username: receiverUsernameValue }
          })
          if (receiverUser){
            const updatedReceiverFriends = receiverUser.friends.filter(friend => friend !== user.username);
            await db.user.update({
              where: { username: receiverUsernameValue },
              data: {
                friends: updatedReceiverFriends,
              },
            });
          }
          return json({ successUnfriendRequest: `You have unfriended ${receiverUsernameValue}` })
        } else {
          return json({ formPayload, errors: "Something went wrong"}, {status: 400})
        }
      
    } else {
        return json({ formPayload, error: "Something went wrong"}, {status: 400})
    }
    
}

export default function UserProfileRoute() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
    return (
        <div className="bg-rose-700 min-h-screen">
          <div className="pt-6 text-stone-600 font-medium">
            <div className="bg-stone-100 p-6 drop-shadow-lg w-5/6 m-auto rounded-lg">
              <UserCircle user={data?.userItem} className="h-24 w-24 mx-auto flex-shrink-0" />
              <div className="flex justify-center p-2 pt-4">
                <Form method="post">
                  <input type="hidden" name="receiver" value={data?.userItem?.username} />
                  <div className="flex justify-center">
                    {data?.filteredFriends?.length !== 0 ? (
                      <button type="submit" name="friendReq" value="unfriend" className="bg-stone-500 hover:bg-stone-700 text-sm text-white px-2 rounded drop-shadow-sm">Unfriend</button>
                    ): (<button type="submit" name="friendReq" value="friend" className="bg-indigo-600 hover:bg-indigo-800 text-sm text-white px-2 rounded drop-shadow-sm">Send Friend Request</button>)}
                  </div>
                  
                  <div className="text-green-400 font-bold">{actionData?.successFriendRequest}</div>
                  <div className="text-green-400 font-bold">{actionData?.successUnfriendRequest}</div>
                  <ErrorMessage>
                      {actionData?.errors ? (
                      <p
                          role="alert"
                          id="username-error"
                          className="flex justify-center text-black font-bold"
                      >
                          {actionData.errors}
                      </p>
                      ) : null}
                  </ErrorMessage>
                </Form>
              </div>
              <div className="flex justify-center p-2 pt-4">
                <p>Username: <span className="text-rose-600 font-semibold">{data?.userItem?.username}</span></p>
              </div>
              <div className="flex justify-center p-2">
                <p>Full Name: <span className="text-rose-600 font-semibold">{data?.userItem?.fullname}</span></p>
              </div>
              <div className="flex justify-center p-2">
                <p>Age: <span className="text-rose-600 font-semibold">{data?.userItem?.age}</span></p>
              </div>
              <div className="flex justify-center p-2 md:w-4/6 m-auto">
                <p>Bio: <span className="text-rose-600 font-semibold">{data?.userItem?.description}</span></p>
              </div>
            </div>
            
          </div>
            
        </div>
    )
}


