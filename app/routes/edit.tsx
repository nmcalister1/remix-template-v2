import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { HTMLAttributes, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ImageUploader } from "~/components/imageUploader";
import { db } from "~/utils/db.server";
import { getUser, getUserId, requireUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await getUserId(request)
    const user = await getUser(request)
  
    if (!userId){
      throw redirect("/login")
    }
  
    return json({ user })
}

// in the action on the form saves, navigate the users back to the page to upload the database and default value of the field
interface ErrorMessageProps extends HTMLAttributes<HTMLParagraphElement>{}

function ErrorMessage({...props}: ErrorMessageProps){
  return props.children ? <p {...props}></p> : null
}

type FieldErrors = { [key: string]: string }

export const action = async ({ request }: ActionFunctionArgs) => {
    const userId = await requireUserId(request)
    const formPayload = Object.fromEntries(await request.formData())
    console.log(formPayload)
    if (formPayload.fullname){
        const fullnameSchema = z.object({
            fullname: z.string().min(3, { message: "*Name must be more than 2 characters" }),
        })
        const newName = fullnameSchema.safeParse(formPayload)
    
        if (!newName.success){
            const errors: FieldErrors = {}
            newName.error.issues.forEach(issue => {
                const path = issue.path.join(".")
                errors[path] = issue.message
            })
            
            return json({ errors, data: formPayload }, { status: 400 })
        } else {
              const userFullname = await db.user.update({
                where: {
                  id: userId
                }, 
                data: {
                  fullname: newName.data.fullname
                }
              })
              return json({ successFullname: "Your name has been updated and saved!" })
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

export default function EditProfile(){
    const data = useLoaderData<typeof loader>()
    const actionData = useActionData<typeof action>()
    const navigate = useNavigate()
    const inputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        profilePicture: data?.user?.profilePicture || ''
    })
    
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
          }
      }, [])

    const handleFileUpload = async (file: File) => {
        let inputFormData = new FormData()
        inputFormData.append('profile-pic', file)
    
        const response = await fetch('/avatar', {
        method: "POST",
        body: inputFormData
        })
    
        const { imageUrl } = await response.json()
    
        setFormData({
        ...formData,
        profilePicture: imageUrl
        })
        navigate('.', { replace: true })
    }
    return (
        <div className="bg-rose-700 h-screen">
          <div className="pt-6 text-stone-600 font-medium">
            <div className="bg-stone-100 p-6 drop-shadow-lg w-5/6 m-auto rounded-lg">
                <div className="mb-4 flex flex-col items-center justify-center">
                    <ImageUploader onChange={handleFileUpload} imageUrl={formData.profilePicture || ''} />
                    <p className="pt-6">Username:</p>
                    <input disabled name="username" id="username" readOnly value={data?.user?.username} className="text-stone-100 bg-rose-500 p-1 rounded"  />
                    <p className="pt-6">Full Name:</p>
                    <Form method="post" className="flex flex-col items-center justify-center">
                        <input type="text" name="fullname" ref={inputRef} className="border-solid border-2 border-rose-500 outline-none text-stone-900 rounded-md p-2 hover:border-rose-800 focus:border-rose-800" defaultValue={data?.user?.fullname} />
                        <button type="submit" className="bg-rose-500 hover:bg-rose-700 mt-2 text-white mx-2 font-bold py-1 px-2 rounded drop-shadow-lg">Save</button> 
                    </Form>
                    <div className="text-green-600 font-bold">{actionData?.successFullname}</div>
                    <div>
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
                    
                    <p className="pt-6">Age:</p>
                    <Form method="post" className="flex flex-col items-center justify-center">
                        <input type="text" name="age" className="border-solid border-2 border-rose-500 outline-none text-stone-900 rounded-md p-2 hover:border-rose-800 focus:border-rose-800" defaultValue={data?.user?.age} />
                        <button type="submit" className="bg-rose-500 mt-2 hover:bg-rose-700 text-white mx-2 font-bold py-1 px-2 rounded drop-shadow-lg">Save</button> 
                    </Form>
                    <div className="text-green-600 font-bold">{actionData?.successAge}</div>
                    <div>
                        <ErrorMessage>
                            {actionData?.errors?.age ? (
                            <p
                                role="alert"
                                id="username-error"
                                className="flex justify-center text-black font-bold"
                            >
                                {actionData.errors.age}
                            </p>
                            ) : null}
                        </ErrorMessage>
                    </div>
                    
                    <p className="pt-6">Description:</p>
                    <Form method="post" className="flex flex-col items-center justify-center">
                        <textarea name="description" className="md:resize-none border-solid border-2 outline-none w-full border-rose-500 rounded-md p-2 text-stone-900 hover:border-rose-800 focus:border-rose-800" rows={4} defaultValue={data?.user?.description}></textarea>
                        <button type="submit" className="bg-rose-500 mt-2 hover:bg-rose-700 text-white mx-2 font-bold py-1 px-2 rounded drop-shadow-lg">Save</button> 
                    </Form>
                    <div className="text-green-600 font-bold">{actionData?.successDescription}</div>
                    <div>
                        <ErrorMessage>
                            {actionData?.errors?.description ? (
                            <p
                                role="alert"
                                id="username-error"
                                className="flex justify-center text-black font-bold"
                            >
                                {actionData.errors.description}
                            </p>
                            ) : null}
                        </ErrorMessage>
                    </div>
                   
                </div>
              <div className="flex justify-center p-4 pt-6">
                <Link to="/" className="text-stone-800 underline decoration-black hover:text-stone-500 p-2">Home</Link>
                <Link to="/profile" className="text-stone-800 underline decoration-black hover:text-stone-500 p-2">Your Profile</Link>
              </div>
            </div>
            
          </div>
            
        </div>
    )
}