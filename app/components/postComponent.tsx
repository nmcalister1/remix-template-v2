import { Form } from "@remix-run/react"
import { Comment } from "./comment"
import { ArrowDownIcon } from "~/icons/arrowDown"
import { Link } from "react-router-dom"
import { ProfilePic } from "./pfp"
import { useState } from "react"
import { ArrowUpIcon } from "~/icons/arrowUp"

export function PostComponent(){
    const [isReplying, setIsReplying] = useState(false)
    const [isComments, setIsComments] = useState(false)
    const [isArrowUp, setIsArrowUp] = useState(false)
    return (
        <>
            <div className="drop-shadow-2xl">
            <div className="bg-stone-100 p-2 rounded-tr rounded-tl rounded-br-none rounded-bl-none mt-6 md:flex shadow-lg">
                
                <ProfilePic classes="p-2 w-16 h-16 md:w-36 md:h-36 rounded-full drop-shadow-lg" source="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                <Link to="/login" className="font-light hover:text-rose-500 text-xs md:text-base inline sm:hidden ml-2">Noah McAlister</Link>
                <span className="font-light text-xs md:text-base inline sm:hidden">&nbsp;-&nbsp;</span>
                <p className="font-light text-xs md:text-base inline sm:hidden">1 hr ago</p>
                
                <div className="md:ml-7 p-2">
                 <p className="font-medium text-stone-800 text-xl drop-shadow-sm">I like pizza because it can be customized well and because it tastes oh so very good! asdf adsf asdf adsf sadf adsf asdf dsaf asdf asdf sdaf adsf sadf sadf sadf adsf sadf sdaf sadf adsf adsf asf dsaf sadf asdf asdf asd fads adsf adsf adsf dsaf sad fsad fads fsd  dsf  sdaf  dsaf asd f asdf asd f adsf  adsf  adsf  dsaf sad f ads f sd af a dsf   adsf  dsa fdasf sd fds af adsf ds fs f saf sd fsda</p>
                </div>
            </div>
            <div className="flex md:justify-end bg-stone-100 p-2 rounded-br rounded-bl rounded-tr-none rounded-tl-none">
                <Link to="/login" className="font-light hover:text-rose-500 text-xs md:text-base hidden md:inline mt-1">Noah McAlister</Link>
                <span className="font-light text-xs md:text-base hidden md:inline mt-1">&nbsp;-&nbsp;</span>
                <p className="font-light text-xs md:text-base hidden md:inline mt-1">1 hr ago</p>
                <span className="hidden md:inline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <span className="inline ml-28 w-auto md:hidden"></span>
                <button onClick={() => {
                    setIsComments(false)
                    setIsReplying(true)
                    }} className="bg-rose-500 hover:bg-rose-700 text-white font-bold p-1 rounded text-sm md:text-base md:mr-4 drop-shadow-lg">Reply</button>
            </div>
            </div>

            <div className="flex justify-center">
                <button onClick={() => {
                    setIsArrowUp(!isArrowUp)
                    setIsComments(!isComments)
                    setIsReplying(false)
                    }} className="flex items-center justify-center bg-rose-600 hover:bg-rose-900 text-white font-bold p-1 rounded text-sm md:text-base w-screen shadow-sm">Comments{isArrowUp ? <ArrowUpIcon/> : <ArrowDownIcon />}</button>
            </div>

            {isComments ? (
                
               <Comment />
                
            ) : null}
            


            {isReplying ? (
                <Form method="post" onSubmit={() => setIsReplying(false)}>
                    <div className="flex justify-center items-center px-2 py-1">
                        <textarea name="answer" id="answer" className="md:resize-none boder-solid border-2 outline-none border-black rounded-md p-4 w-screen text-black hover:border-rose-300 focus:border-rose-300" rows={4} placeholder="Reply... "></textarea>
                    </div>
                    <div className="flex flex-col items-end px-2">
                        <button type="submit" className="bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded drop-shadow-lg">
                        Submit
                        </button>
                    </div>
                </Form>
            ) : null}
        </>
    )
}