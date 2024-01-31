import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react"
import { HTMLAttributes, useEffect, useRef } from "react"
import { z } from "zod"
import { db } from "~/utils/db.server"
import { getUser, getUserId } from "~/utils/session.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await getUserId(request)
  
    if (!userId){
      throw redirect("/login")
    }
    const user = await getUser(request)
    if (!user){
      return json({ errors: "user not found." })
    }

    const friendReq = await db.friendrequest.findMany()
    if (friendReq === null){
      return null
    }

    const friendReqSchema = z.object({
      id: z.string(),
      senderUsername: z.string(),
      receiverUsername: z.string()
    })
  
    try {
      const friendReqItems = friendReq.map((friend) => ({
        ...friendReqSchema.parse(friend)
      }))
      const filteredFriendReqs = friendReqItems.filter((friendReqListItem) => friendReqListItem.receiverUsername === user.username);
  
      return json({ filteredFriendReqs })
    } catch (e){
      console.error("there was an error fetching friend request data", e)
      return null
    }
}

interface ErrorMessageProps extends HTMLAttributes<HTMLParagraphElement>{}

function ErrorMessage({...props}: ErrorMessageProps){
  return props.children ? <p {...props}></p> : null
}

type FieldErrors = { [key: string]: string }

export const action = async ({ request }: ActionFunctionArgs) => {
    const formPayload = Object.fromEntries(await request.formData())
    const user = await getUser(request)
    if (!user){
      return json({ error: "*Must be logged in" })
    }
    console.log("FormPayload" ,formPayload)
    if (formPayload.receiverUsername){
        const friendRequestSchema = z.object({
          receiverUsername: z.string()
        })
        const newReceiverUsername = friendRequestSchema.safeParse(formPayload)
    
        if (!newReceiverUsername.success){
            const errors: FieldErrors = {}
            newReceiverUsername.error.issues.forEach(issue => {
                const path = issue.path.join(".")
                errors[path] = issue.message
            })
            
            return json({ errors, data: formPayload }, { status: 400 })
        } else {
              const receiverUsername = newReceiverUsername.data.receiverUsername 
              const userExists = await db.user.findFirst({
                  where: { username: receiverUsername }
              })
              if (!userExists){
                  return json({ errors: `User with username ${receiverUsername} does not exist`}, {status: 400})
              }
              const filteredFriends = user.friends.filter((friend) => receiverUsername === friend) || null
              if (filteredFriends.length !== 0){
                return json({ errors: `You are already friends with ${receiverUsername}`}, {status: 400})
              }
              const alreadySentRequest = await db.friendrequest.findMany()
              if (alreadySentRequest.length !== 0){
                const requestFilter = alreadySentRequest.filter((request) => request.senderUsername === user.username && request.receiverUsername === receiverUsername)
                if (requestFilter.length !== 0){
                  return json({ errors: `You have already sent ${receiverUsername} a friend request.`})
                }
              }
              
              const friendReq = await db.friendrequest.create({
                data: {
                  senderUsername: user.username,
                  receiverUsername,
                }
              })
              return json({ successFriendRequest: "Your friend request has been sent!" })
        }
    } else if (formPayload.friendReq === "decline"){
      const id = formPayload.friendRequestId
      if (id !== null && id !== undefined) {
        // Convert id to the appropriate type (e.g., string or number)
        const idValue = id.toString(); // or use parseInt(id.toString(), 10) for a number
      
        // Now you can use idValue in the delete operation
        await db.friendrequest.delete({
          where: { id: idValue }
        });
        return null
      } else {
        console.error('ID is null or undefined');
        return null
      }
    } else if (formPayload.friendReq === "accept"){
      // add the sender to the receivers friend array and add the receiver to the sender friend array
      const senderUsername = formPayload.senderUsername
      const receiverUsername = formPayload.receiver
      if (senderUsername && receiverUsername) {
        const senderValue = senderUsername.toString()
        const receiverValue = receiverUsername.toString()
        await db.user.update({
          where: {
            username: senderValue
          },
          data: {
            friends: {
              push: receiverValue
            }
          }
        })
        await db.user.update({
          where: {
            username: receiverValue
          },
          data: {
            friends: {
              push: senderValue
            }
          }
        })
        const id = formPayload.friendRequestId
        if (id !== null && id !== undefined) {
          // Convert id to the appropriate type (e.g., string or number)
          const idValue = id.toString(); // or use parseInt(id.toString(), 10) for a number
        
          // Now you can use idValue in the delete operation
          await db.friendrequest.delete({
            where: { id: idValue }
          });
          return null
        } else {
          console.error('ID is null or undefined');
          return null
        }
      }
      
    } else {
        return json({ formPayload, error: "Something went wrong"}, {status: 400})
    }
    
}

export default function FriendsRoute(){
  const inputRef = useRef<HTMLInputElement>(null)
  const actionData = useActionData<typeof action>()
  const data = useLoaderData<typeof loader>()

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
          }
      }, [])
    return (
        <div className="bg-rose-700 min-h-screen">
          <div className="pt-6 pb-6">
          <div className="bg-stone-100 p-6 drop-shadow-sm w-5/6 m-auto rounded-lg">
          
            <h1 className="text-indigo-700 flex justify-center p-4 pt-8 md:text-3xl m-auto font-bold text-lg text-center">Type in your friend's username to send them a friend request</h1>
          
           
            <Form method="post">
              <div className="flex justify-center p-5">
                <input type="text" ref={inputRef} name="receiverUsername" className="border-solid border-2 border-stone-600 outline-none text-stone-900 rounded-md p-2 hover:border-stone-400 focus:border-stone-400 drop-shadow-sm md:w-1/4" placeholder="joemama69" />
              </div>
              <div>
                <div className="text-green-400 font-bold flex justify-center">{actionData?.successFriendRequest}</div>
                <ErrorMessage>
                    {actionData?.errors?.receiverUsername ? (
                    <p
                        role="alert"
                        id="username-error"
                        className="flex justify-center text-black font-bold"
                    >
                        {actionData.errors.receiverUsername}
                    </p>
                    ) : null}
                </ErrorMessage>
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
              </div>
              <div className="flex justify-center p-5">
                <button type="submit" className="bg-stone-700 hover:bg-stone-500 text-white font-bold py-1 px-2 rounded drop-shadow-lg">Send Friend Request</button>
              </div>
            </Form>
            <div className="border-t border-stone-300 w-9/12 border-2 mx-auto my-8"></div>
            <div>
              {data?.filteredFriendReqs?.length !== 0 ? data.filteredFriendReqs.map(({ id, senderUsername, receiverUsername }) => (
                <Form key={id} method="post" className="flex justify-center items-center p-3">
                  <h1 className="text-stone-700 font-semibold pr-4 text-sm md:text-base">Friend request from <Link to={`/user/${senderUsername}`} className="text-indigo-600 font-extrabold hover:text-indigo-400">{senderUsername}</Link></h1>
                  <input type="hidden" name="friendRequestId" value={id} />
                  <input type="hidden" name="senderUsername" value={senderUsername} />
                  <input type="hidden" name="receiver" value={receiverUsername} />
                  <button type="submit" name="friendReq" value="decline" className="bg-stone-500 hover:bg-stone-700 text-white text-xs font-bold py-1 px-2 rounded drop-shadow-sm">Decline</button>
                  <button type="submit" name="friendReq" value="accept" className="bg-rose-500 hover:bg-rose-700 text-white text-xs mx-2 font-bold py-1 px-2 rounded drop-shadow-sm">Accept</button>
                </Form>
              )) : null}
            </div>
            </div>
            </div>
        </div>
        
    )
}

