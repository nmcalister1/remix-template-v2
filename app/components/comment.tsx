import { Link } from "@remix-run/react";
import { CommentReplyForm } from "./commentReplyForm"
import { ProfilePic } from "./pfp"
import { useState } from "react";

export function Comment(){
    const [isReplyingComments, setIsReplyingComments] = useState(false)
    return (
        <div className="shadow-2xl w-5/6 m-auto bg-stone-200 p-1 rounded-lg">
                <div className="p-2 rounded-tr rounded-tl rounded-br-none rounded-bl-none md:flex">
                    
                    <ProfilePic classes="p-2 w-16 h-16 md:w-36 md:h-36 rounded-full drop-shadow-lg" source="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                    <Link to="/login" className="font-light hover:text-rose-500 text-xs md:text-base inline sm:hidden ml-2">Noah McAlister</Link>
                    <span className="font-light text-xs md:text-base inline sm:hidden">&nbsp;-&nbsp;</span>
                    <p className="font-light text-xs md:text-base inline sm:hidden">1 hr ago</p>
                    
                    <div className="md:ml-7 p-2">
                     <p className="font-medium text-sm md:text-base"><Link to="/login" className="text-rose-600 hover:text-rose-400">@nmcalister<span>&nbsp;</span></Link>I like pizza because it can be customized well and because it tastes oh so very good! asdf adsf asdf adsf sadf adsf asdf dsaf asdf asdf sdaf adsf sadf sadf sadf adsf sadf sdaf sadf adsf adsf asf dsaf sadf asdf asdf asd fads adsf adsf adsf dsaf sad fsad fads fsd  dsf  sdaf  dsaf asd f asdf asd f adsf  adsf  adsf  dsaf sad f ads f sd af a dsf   adsf  dsa fdasf sd fds af adsf ds fs f saf sd fsda</p>
                    </div>
                </div>
                <div className="flex md:justify-end p-2 rounded-br rounded-bl rounded-tr-none rounded-tl-none">
                    <Link to="/login" className="font-light hover:text-rose-500 text-xs md:text-base hidden md:inline mt-1">Noah McAlister</Link>
                    <span className="font-light text-xs md:text-base hidden md:inline mt-1">&nbsp;-&nbsp;</span>
                    <p className="font-light text-xs md:text-base hidden md:inline mt-1">1 hr ago</p>
                    <span className="hidden md:inline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span className="inline ml-28 w-auto md:hidden"></span>
                    <button onClick={() => {
                        setIsReplyingComments(true)
                        }} className="bg-rose-500 hover:bg-rose-700 text-white font-bold p-1 rounded text-sm md:text-base md:mr-4 drop-shadow-lg">Reply</button>
                </div>
                {isReplyingComments ? (
                    <CommentReplyForm setIsReplyingComments={setIsReplyingComments} />
                ) : null}
               
                </div>
    )
}