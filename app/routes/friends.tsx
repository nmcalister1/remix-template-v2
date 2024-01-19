import { LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { getUserId } from "~/utils/session.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await getUserId(request)
  
    if (!userId){
      throw redirect("/login")
    }
  
    return json({})
  }

export default function FriendsRoute(){
    return (
        <div className="mt-9 text-rose-500 flex justify-center">
            Friends Route
        </div>
    )
}

