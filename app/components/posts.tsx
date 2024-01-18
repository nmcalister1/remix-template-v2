import { Avatars } from "./avatars"
import { PostComponent } from "./postComponent"

export function Posts(){
    return (
        <div className="p-4">
            <div className="bg-stone-100 p-2 rounded">
                <Avatars />
            </div>
            <PostComponent />
            <PostComponent />
        </div>
    )
}