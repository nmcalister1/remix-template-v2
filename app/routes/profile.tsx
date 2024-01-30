import { LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { useLoaderData, useNavigate } from "@remix-run/react"
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
    return (
        <div className="bg-rose-700 h-screen">
          <div className="pt-6 text-stone-600 font-medium">
            <div className="bg-stone-100 p-6 drop-shadow-lg w-5/6 m-auto rounded-lg">
              <UserCircle user={data?.user} className="h-24 w-24 mx-auto flex-shrink-0" />
              <div className="flex justify-center p-2 pt-4">
                <p>Username: <span className="text-rose-600 font-semibold">{data?.user?.username}</span></p>
              </div>
              <div className="flex justify-center p-2">
                <p>Full Name: <span className="text-rose-600 font-semibold">{data?.user?.fullname}</span></p>
              </div>
              <div className="flex justify-center p-2">
                <p>Age: <span className="text-rose-600 font-semibold">{data?.user?.age}</span></p>
              </div>
              <div className="flex justify-center p-2 w-4/6 m-auto">
                <p>Description: <span className="text-rose-600 font-semibold">{data?.user?.description}</span></p>
              </div>
              <div className="flex justify-end p-4 pt-6 w-4/6 m-auto">
                <button type="button" onClick={() => navigate("/edit")} className="bg-rose-500 hover:bg-rose-700 text-white mx-2 font-bold py-1 px-2 rounded drop-shadow-lg">Edit</button> 
              </div>
            </div>
            
          </div>
            
        </div>
    )
}

