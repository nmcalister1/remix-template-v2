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

    const friendReqSchema = z.object({
      senderUsername: z.string(),
      recieverUsername: z.string()
    })
  
    try {
      const friendReqItems = friendReq.map((friend) => ({
        ...friendReqSchema.parse(friend)
      }))
      const filteredFriendReqs = friendReqItems.filter((friendReqListItem) => friendReqListItem.recieverUsername === user.username);
  
      return json({ filteredFriendReqs })
    } catch (e){
      console.error("there was an error fetching friend request data", e)
      return redirect('/')
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
    console.log(formPayload)
    if (formPayload.sendFriendReq){
        const friendRequestSchema = z.object({
          receiverUsername: z.string().min(3, { message: "*Name must be more than 2 characters" }),
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
              const friendReq = await db.friendrequest.create({
                data: {
                  senderUsername: user.username,
                  receiverUsername,
                }
              })
              return json({ successFriendRequest: "Your friend request has been sent!" })
        }
    } else if (formPayload.age){
        const ageSchema = z.object({
            age: z.string().max(2, { message: "*Age cannot be more than 2 characters" }),
        })
        const newAge = ageSchema.safeParse(formPayload)
    
        if (!newAge.success){
            const errors: FieldErrors = {}
            newAge.error.issues.forEach(issue => {
                const path = issue.path.join(".")
                errors[path] = issue.message
            })
            
            return json({ errors, data: formPayload }, { status: 400 })
        } else {
              const userAge = await db.user.update({
                where: {
                  id: userId
                }, 
                data: {
                  age: newAge.data.age
                }
              })
              return json({ successAge: "Your age has been updated and saved!" })   
        }
    } else if (formPayload.description){
        const descriptionSchema = z.object({
            description: z.string().max(500, { message: "*Description cannot be more than 500 characters" }),
        })
        const newDescription = descriptionSchema.safeParse(formPayload)
    
        if (!newDescription.success){
            const errors: FieldErrors = {}
            newDescription.error.issues.forEach(issue => {
                const path = issue.path.join(".")
                errors[path] = issue.message
            })
            
            return json({ errors, data: formPayload }, { status: 400 })
        } else {
              const userDescription = await db.user.update({
                where: {
                  id: userId
                }, 
                data: {
                  description: newDescription.data.description
                }
              })
              return json({ successDescription: "Your description has been updated and saved!" })  
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
        <div className="bg-rose-700 h-screen">
            <h1 className="text-stone-100 flex justify-center p-4 pt-8 text-2xl font-semibold">Type in your friend's username to send them a friend request</h1>
            <Form method="post">
              <div className="flex justify-center p-5">
                <input type="text" ref={inputRef} name="sendFriendReq" className="border-solid border-2 border-rose-500 outline-none text-stone-900 rounded-md p-2 hover:border-rose-800 focus:border-rose-800 drop-shadow-sm w-1/4" placeholder="joemama69" />
                <div className="text-green-600 font-bold">{actionData?.successFriendRequest}</div>
                <ErrorMessage>
                    {actionData?.errors?.fullname ? (
                    <p
                        role="alert"
                        id="username-error"
                        className="flex justify-center text-black font-bold"
                    >
                        {actionData.errors.fullname}
                    </p>
                    ) : null}
                </ErrorMessage>
              </div>
              <div className="flex justify-center p-5">
                <button type="submit" className="bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded drop-shadow-lg">Send Friend Request</button>
              </div>
            </Form>
            <div className="border-t border-stone-300 w-9/12 border-2 mx-auto my-8"></div>
            <div>
              <Form method="post" className="flex justify-center items-center p-3">
                <h1 className="text-stone-100 font-semibold pr-4">Friend request from <Link to="/user/kody" className="text-green-300 font-extrabold text-xl hover:text-green-500">kody</Link></h1>
                <button type="submit" name="friendReq" value="decline" className="bg-rose-600 hover:bg-rose-800 text-white font-bold py-1 px-2 rounded drop-shadow-lg">Decline</button>
                <button type="submit" name="friendReq" value="accept" className="bg-rose-500 hover:bg-rose-700 text-white mx-2 font-bold py-1 px-2 rounded drop-shadow-lg">Accept</button>
              </Form>
              <Form method="post" className="flex justify-center items-center p-3">
                <h1 className="text-stone-100 font-semibold pr-4">Friend request from <Link to="/jkghbjnkljbh" className="text-teal-400 font-semibold hover:text-teal-600 underline">kody</Link></h1>
                <button type="submit" name="friendReq" value="decline" className="bg-rose-600 hover:bg-rose-800 text-white font-bold py-1 px-2 rounded drop-shadow-lg">Decline</button>
                <button type="submit" name="friendReq" value="accept" className="bg-rose-500 hover:bg-rose-700 text-white mx-2 font-bold py-1 px-2 rounded drop-shadow-lg">Accept</button>
              </Form>
              <Form method="post" className="flex justify-center items-center p-3">
                <h1 className="text-stone-100 font-semibold pr-4">Friend request from <Link to="/kjhvbn" className="text-teal-400 font-semibold hover:text-teal-600 underline">kody</Link></h1>
                <button type="submit" name="friendReq" value="decline" className="bg-rose-600 hover:bg-rose-800 text-white font-bold py-1 px-2 rounded drop-shadow-lg">Decline</button>
                <button type="submit" name="friendReq" value="accept" className="bg-rose-500 hover:bg-rose-700 text-white mx-2 font-bold py-1 px-2 rounded drop-shadow-lg">Accept</button>
              </Form>
              <Form method="post" className="flex justify-center items-center p-3">
                <h1 className="text-stone-100 font-semibold pr-4">Friend request from <Link to="/jkhgcfxcghjhb" className="text-teal-400 font-semibold hover:text-teal-600 underline">kody</Link></h1>
                <button type="submit" name="friendReq" value="decline" className="bg-rose-600 hover:bg-rose-800 text-white font-bold py-1 px-2 rounded drop-shadow-lg">Decline</button>
                <button type="submit" name="friendReq" value="accept" className="bg-rose-500 hover:bg-rose-700 text-white mx-2 font-bold py-1 px-2 rounded drop-shadow-lg">Accept</button>
              </Form>
            </div>
        </div>
    )
}

