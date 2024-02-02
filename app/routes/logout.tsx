import { ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { logout } from "~/utils/session.server";

export const action = async ({ request}: ActionFunctionArgs) => {
    return logout(request)
}

export default function LogoutRoute(){
    return (
        <div className="bg-rose-700 m-auto h-screen p-5">
            <Form method="post">
                <p className="text-stone-100 text-3xl font-bold flex justify-center p-3 drop-shadow-sm text-center">Are you sure you want to logout?</p>
                <div className="flex justify-center">
                    <button className="bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded drop-shadow-lg m-4">Logout</button>
                </div>
            </Form>
        </div>
    )
}