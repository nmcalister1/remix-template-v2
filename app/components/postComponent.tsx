import { ArrowDownIcon } from "~/icons/arrowDown"
import { Link } from "react-router-dom"
import { ProfilePic } from "./pfp"
import { ArrowUpIcon } from "~/icons/arrowUp"
import { format } from "date-fns"
import { useState } from "react"

type PostParameter = {
    posterUsername: string,
    content: string
    createdAt: Date,
    posterProfilePicture: string
    // setIsComments: React.Dispatch<React.SetStateAction<boolean>>;
    setIsReplying: React.Dispatch<React.SetStateAction<boolean>>;
    // setIsArrowUp: React.Dispatch<React.SetStateAction<boolean>>;
    // setSelectedPostId: React.Dispatch<React.SetStateAction<string>>;
    // isComments: boolean;
    // isArrowUp: boolean;
    // postId: string; 
}

export function PostComponent({ posterUsername, content, createdAt, posterProfilePicture, setIsReplying}: PostParameter){
   
    return (
        <>
        <div className="drop-shadow-2xl">
        <div className="bg-stone-100 p-2 rounded-tr rounded-tl rounded-br-none rounded-bl-none mt-6 md:flex shadow-lg">
            
            <ProfilePic classes="p-2 w-16 h-16 md:w-36 md:h-36 rounded-full drop-shadow-lg" source={posterProfilePicture} />
            <Link to="/login" className="font-light hover:text-rose-500 text-xs md:text-base inline sm:hidden ml-2">{posterUsername}</Link>
            <span className="font-light text-xs md:text-base inline sm:hidden">&nbsp;-&nbsp;</span>
            <p className="font-light text-xs md:text-base inline sm:hidden">posted at {format(createdAt, 'h:mm a')}</p>
            
            <div className="md:ml-7 p-2">
             <p className="font-medium text-stone-800 text-xl">{content}</p>
            </div>
        </div>
        <div className="flex md:justify-end bg-stone-100 p-2 rounded-br rounded-bl rounded-tr-none rounded-tl-none">
            <Link to="/login" className="font-light hover:text-rose-500 text-xs md:text-base hidden md:inline mt-1">{posterUsername}</Link>
            <span className="font-light text-xs md:text-base hidden md:inline mt-1">&nbsp;-&nbsp;</span>
            <p className="font-light text-xs md:text-base hidden md:inline mt-1">posted at {format(createdAt, 'h:mm a')}</p>
            <span className="hidden md:inline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span className="inline ml-28 w-auto md:hidden"></span>
            <button onClick={() => {
                setIsComments(false)
                setIsReplying(true)
                }} className="bg-rose-500 hover:bg-rose-700 text-white font-bold p-1 rounded text-sm md:text-base m-auto md:m-0 md:mr-4 drop-shadow-lg">Reply</button>
        </div>
        </div>

        <div className="flex justify-center">
            <button onClick={() => {
                setIsArrowUp(!isArrowUp)
                setIsComments(!isComments)
                console.log(isComments)
                setIsReplying(false)
                //setSelectedPostId(() => (isComments ? '' : postId))
                }} className="flex items-center justify-center bg-rose-600 hover:bg-rose-900 text-white font-bold p-1 rounded text-sm md:text-base w-screen shadow-sm">Comments{isArrowUp ? <ArrowUpIcon/> : <ArrowDownIcon />}</button>
        </div>
        </>
    )
}