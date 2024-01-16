import type { ActionFunctionArgs, LinksFunction, MetaFunction } from "@remix-run/node";
import { Form, Link, json, useActionData, useSearchParams } from "@remix-run/react";
import { HTMLAttributes } from "react";
import { z } from "zod";

import stylesUrl from "~/styles/login.css";
import { db } from "~/utils/db.server";
import { createUserSession, login, register } from "~/utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const meta: MetaFunction = () => {
  const description = "Login to submit your own jokes to Remix Jokes!"

  return [
    { name: "description", content: description},
    { name: "twitter:description", content: description},
    { title: "Remix Jokes | Login" }
  ]
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
    console.log("FormPayload: ", formPayload)
    const redirectTo = validateUrl(
        (formPayload.redirectTo as string) || "/jokes"
    )
    const loginType = formPayload.loginType
    const userSchema = z.object({
        username: z.string().min(3, { message: "Username must be more than 2 characters" }),
        password: z.string().min(6, { message: "Password must be more than 6 characters long" }),
    })
    const newUser = userSchema.safeParse(formPayload)
    console.log("NewUser: ", newUser)

    if (!newUser.success){
        const errors: FieldErrors = {}
        newUser.error.issues.forEach(issue => {
            const path = issue.path.join(".")
            errors[path] = issue.message
        })
        console.log(errors)
        return json({ errors, data: formPayload }, { status: 400 })
    } else {
        const { username, password } = newUser.data
        
        switch (loginType){
            case "login": {
                const user = await login({ username, password })
                console.log({ user })
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
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <Form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              Login or Register?
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                    !actionData?.data?.loginType ||
                    actionData?.data?.loginType === "login"
                }
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={
                    actionData?.data?.loginType === "register"
                }
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.data?.username}
            />
            <ErrorMessage>
                {actionData?.errors?.username ? (
                <p
                    className="form-validation-error"
                    role="alert"
                    id="username-error"
                >
                    {actionData.errors.username}
                </p>
                ) : null}
            </ErrorMessage>
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              type="password"
              defaultValue={actionData?.data?.passwordHash}
            />
            <ErrorMessage>
                {actionData?.errors?.passwordHash ? (
                <p
                    className="form-validation-error"
                    role="alert"
                    id="password-error"
                >
                    {actionData.errors.passwordHash}
                </p>
                ) : null}
            </ErrorMessage>
          </div>
          <div id="form-error-message">
            {actionData?.data?.error ? (
              <p
                className="form-validation-error"
                role="alert"
              >
                {actionData?.data?.error}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </Form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
