import { Form, Link } from "@remix-run/react";
import { ProfilePic } from "./pfp"
import { useState } from "react";
import { format } from "date-fns";

interface ParameterState{
  commenterUsername: string; 
  content: string; 
  createdAt: Date;
  commenterProfilePicture: string; 
  posterUsername: string;
  setIsReplyingComments: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Comment({ commenterUsername, content, createdAt, commenterProfilePicture, posterUsername, setIsReplyingComments }: ParameterState){
    
    return (
      <>
      <div className="p-2 rounded-tr rounded-tl rounded-br-none rounded-bl-none md:flex">
                        
          <ProfilePic classes="p-2 w-16 h-16 md:w-36 md:h-36 rounded-full drop-shadow-lg" source={commenterProfilePicture} />
          <Link to="/login" className="font-light hover:text-rose-500 text-xs md:text-base inline sm:hidden ml-2">{commenterUsername}</Link>
          <span className="font-light text-xs md:text-base inline sm:hidden">&nbsp;-&nbsp;</span>
          <p className="font-light text-xs md:text-base inline sm:hidden">posted at {format(createdAt, 'h:mm a')}</p>
          
          <div className="md:ml-7 p-2">
          <p className="font-medium text-sm md:text-base"><Link to="/login" className="text-rose-600 hover:text-rose-400">@{posterUsername}<span>&nbsp;</span></Link>{content}</p>
          </div>
      </div>
      <div className="flex md:justify-end p-2 rounded-br rounded-bl rounded-tr-none rounded-tl-none">
          <Link to="/login" className="font-light hover:text-rose-500 text-xs md:text-base hidden md:inline mt-1">{commenterUsername}</Link>
          <span className="font-light text-xs md:text-base hidden md:inline mt-1">&nbsp;-&nbsp;</span>
          <p className="font-light text-xs md:text-base hidden md:inline mt-1">posted at {format(createdAt, 'h:mm a')}</p>
          <span className="hidden md:inline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span className="inline ml-28 w-auto md:hidden"></span>

          <button onClick={() => {
              setIsReplyingComments(true)
              }} className="bg-rose-500 hover:bg-rose-700 text-white font-bold p-1 rounded text-sm md:text-base md:mr-4 drop-shadow-lg">Reply</button>
          
      </div>
    </>
    )
}