import { PostComponent } from "./postComponent"

type PostParameter = {
    username: string,
    content: string,
    createdAt: DateTime,
    profilePicture: string
}

export function Posts({ username, content, createdAt, profilePicture }: PostParameter){
    return <PostComponent username={username} content={content} createdAt={createdAt} profilePicture={profilePicture} />
}