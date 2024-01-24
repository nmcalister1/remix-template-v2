import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { db } from "./db.server";
import bcrypt from "bcryptjs";

type LoginForm = {
    password: string; 
    username: string;
}

export async function register({ username, password }: LoginForm){
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await db.user.create({
        data: { passwordHash, username, profilePicture: process.env.BASE_BG_IMAGE }
    })

    return { id: user.id, username }
}

export async function login({ username, password }: LoginForm){
    const user = await db.user.findUnique({
        where: { username },
    })
    if (!user){
        return null
    }

    const isCorrectPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isCorrectPassword){
        return null
    }

    return { id: user.id, username }
}

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret){
    throw new Error("SESSION_SECRET must be set")
}

const storage = createCookieSessionStorage({
    cookie: {
        name: "RJ_session",
        secure: true, 
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
    }
})

function getUserSession(request: Request){
    return storage.getSession(request.headers.get("Cookie"))
}

export async function requireUserId( request: Request, redirectTo: string = new URL(request.url).pathname){
    const session = await getUserSession(request)
    const userId = session.get("userId")
    if (!userId || typeof userId !== "string"){
        const searchParams = new URLSearchParams([
            ["redirectTo", redirectTo]
        ])
        throw redirect(`/login?${searchParams}`)
    }
    return userId
}


export async function getUserId(request: Request){
    const session = await getUserSession(request)
    const userId = session.get("userId")
    if (!userId || typeof userId !== "string"){
        return null
    }
    return userId
}


export async function getUser(request: Request){
    const userId = await getUserId(request)
    if (typeof userId !== "string"){
        return null
    }

    const user = await db.user.findUnique({
        where: { id: userId }
    })

    if (!user) {
        throw await logout(request)
    }

    return user
}

export async function getPost(request: Request){
    const userId = await getUserId(request)
    if (typeof userId !== "string"){
        return null
    }

    const post = await db.post.findUnique({
        where: { posterId: userId }
    })

    if (!user) {
        throw await logout(request)
    }

    return user
}

export async function logout(request: Request){
    const session = await getUserSession(request)
    return redirect("/login", {
        headers: {
            "Set-Cookie": await storage.destroySession(session)
        }
    })
}

export async function createUserSession( userId: string, redirectTo: string ){
    const session = await storage.getSession()
    session.set("userId", userId)
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session)
        }
    })
}