import { Avatars } from "./avatars"
import { PostComponent } from "./postComponent"

type PostParameter = {
    username: string,
    content: string,
    createdAt: DateTime,
}

export function Posts({ username, content, createdAt }: PostParameter){
    return <PostComponent username={username} content={content} createdAt={createdAt} />
}