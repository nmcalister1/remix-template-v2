import { LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { useState } from "react"
import { ImageUploader } from "~/components/imageUploader"
import { UserCircle } from "~/components/userCircle"
import { getUser, getUserId } from "~/utils/session.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await getUserId(request)
    const user = await getUser(request)
  
    if (!userId){
      throw redirect("/login")
    }
  
    return json({ user })
}




export default function ProfileRoute(){
  const data = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    profilePicture: data?.user?.profilePicture || ''
  })

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
      
        <div className="bg-rose-700 h-screen text-stone-100 drop-shadow-sm">
          <h1 className="flex justify-center font-bold text-4xl p-4">Profile Settings</h1>
            <label htmlFor="username" className="flex justify-center p-3 mt-5 font-semibold">Username:</label>
            <div className="mb-4 flex flex-col items-center justify-center">
              <input disabled name="username" id="username" readOnly value={data?.user?.username} className="text-stone-100 p-1 mb-10"  />
              <h1 className="p-2 font-semibold">Click the circle to change your profile picture:</h1>
              <ImageUploader onChange={handleFileUpload} imageUrl={formData.profilePicture || ''} />
            </div>
            {/* <UserCircle user={data?.user} className="h-24 w-24 mx-auto flex-shrink-0" /> */}
        </div>
    )
}


