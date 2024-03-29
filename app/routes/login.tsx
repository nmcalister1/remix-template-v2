import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, redirect, useActionData, useSearchParams } from "@remix-run/react";
import { HTMLAttributes, useState } from "react";
import { z } from "zod";

import { db } from "~/utils/db.server";
import { createUserSession, getUserId, login, register } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);

  if (userId) {
    throw redirect("/")
  }

  return json({})
}


function validateUrl(url: string) {
    const urls = ["/jokes", "/", "https://remix.run"];
    if (urls.includes(url)) {
      return url;
    }
    return "/jokes";
}

interface ErrorMessageProps extends HTMLAttributes<HTMLParagraphElement>{}

function ErrorMessage({...props}: ErrorMessageProps){
  return props.children ? <p {...props}></p> : null
}

type FieldErrors = { [key: string]: string }

export const action = async ({ request }: ActionFunctionArgs) => {
    const formPayload = Object.fromEntries(await request.formData())
    const redirectTo = validateUrl(
        (formPayload.redirectTo as string) || "/"
    )
    const loginType = formPayload.loginType
    const userSchema = z.object({
        username: z.string().min(3, { message: "*Username must be more than 2 characters" }),
        password: z.string().min(6, { message: "*Password must be more than 6 characters long" }),
    })
    const newUser = userSchema.safeParse(formPayload)

    if (!newUser.success){
        const errors: FieldErrors = {}
        newUser.error.issues.forEach(issue => {
            const path = issue.path.join(".")
            errors[path] = issue.message
        })
        return json({ errors, data: formPayload }, { status: 400 })
    } else {
        const { username, password } = newUser.data
        
        switch (loginType){
            case "login": {
                const user = await login({ username, password })
    
                if (!user){
                  return json({ loginType, username, password, error: `Username/Password combination is incorrect`}, {status: 400})
                }
                return createUserSession(user.id, redirectTo)
            }
            case "register": {
                const userExists = await db.user.findFirst({
                    where: { username }
                })
                if (userExists){
                    return json({ loginType, username, password, error: `User with username ${username} already exists`}, {status: 400})
                }
                const user = await register({ username, password })
                if (!user){
                  return json({ loginType, username, password, error: `Something went wrong trying to create a new user.`}, {status: 400})
                }
                return createUserSession(user.id, redirectTo)
            }
            default: {
                return json({ loginType, username, password, error: "Login type invalid"}, {status: 400})
            }
        }
    }
}

export default function Login() {
    const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams();
  const [loginType, setLoginType] = useState('login');

  const handleLoginTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginType(event.target.value);
  };
  return (
    <div className="bg-rose-700 m-auto h-screen">
      <div data-light="">
        <h1 className="flex justify-center text-5xl pt-3 pb-4 font-bold text-stone-100 drop-shadow-2xl">Login</h1>
        <Form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset className="border-2 border-white p-2 m-auto my-4 md:w-1/4 flex justify-center">
            <legend className="text-stone-100 m-auto drop-shadow-sm font-medium">
              Login or Register?
            </legend>
            <label className="text-stone-100 p-2 cursor-pointer">
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                    !actionData?.data?.loginType ||
                    actionData?.data?.loginType === "login"
                }
                onChange={handleLoginTypeChange}
              />{" "}
              Login
            </label>
            <label className="text-stone-100 p-2 cursor-pointer">
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={
                    actionData?.data?.loginType === "register"
                }
                onChange={handleLoginTypeChange}
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input" className="flex justify-center text-stone-100 font-medium drop-shadow-sm p-2">Username</label>
            {loginType === 'register' && <p className="flex justify-center text-stone-100 font-light">&#40;*username cannot be changed after registration&#41;</p>}
            <div className="flex justify-center">
            <input
              type="text"
              id="username-input"
              name="username"
              className="border-solid border-2 border-rose-500 outline-none rounded-md hover:border-rose-800 focus:border-rose-800 p-2 drop-shadow-sm md:w-1/4"
              defaultValue={actionData?.data?.username}
            />
            </div>
            <ErrorMessage>
                {actionData?.errors?.username ? (
                <p
                    role="alert"
                    id="username-error"
                    className="flex justify-center text-black font-bold"
                >
                    {actionData.errors.username}
                </p>
                ) : null}
            </ErrorMessage>
          </div>
          <div>
            <label htmlFor="password-input" className="flex justify-center text-stone-100 font-medium drop-shadow-sm p-2">Password</label>
            <div className="flex justify-center">
            <input
              id="password-input"
              name="password"
              type="password"
              className="border-solid border-2 border-rose-500 outline-none rounded-md hover:border-rose-800 focus:border-rose-800 p-2 drop-shadow-sm md:w-1/4"
              defaultValue={actionData?.data?.passwordHash}
            />
            </div>
            <ErrorMessage>
                {actionData?.errors?.password ? (
                <p
                    role="alert"
                    id="password-error"
                    className="flex justify-center text-black font-bold"
                >
                    {actionData.errors.password}
                </p>
                ) : null}
            </ErrorMessage>
          </div>
          <div id="form-error-message">
            {actionData?.data?.error ? (
              <p
                role="alert"
                className="flex justify-center text-black font-bold"
              >
                {actionData?.data?.error}
              </p>
            ) : null}
          </div>
          <div className="flex justify-center">
          <button type="submit"  className="bg-rose-500 hover:bg-rose-400 text-white font-bold p-1 md:w-1/4 w-3/4 mt-9 rounded drop-shadow-lg">
            Submit
          </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

