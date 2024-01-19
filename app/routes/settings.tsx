import { LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { getUserId } from "~/utils/session.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await getUserId(request)
  
    if (!userId){
      throw redirect("/login")
    }
  
    return json({})
  }

export default function SettingsRoute(){
    return (
        <div>
            Settings Route
        </div>
    )
}

