import { Form } from "@remix-run/react";
import { useEffect, useRef } from "react";

export function AnswerForm(){
  const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
          }
      }, [])
    return (
        <Form method="post">
          <div>
            <label className="flex justify-center text-stone-800 pt-3" htmlFor="answer">
              Answer 
            </label>
            <div className="flex justify-center items-center p-4">
             <textarea ref={textareaRef}  name="content" id="postForm" className="md:resize-none boder-solid border-2 outline-none border-black rounded-md p-2 w-3/4 text-black hover:border-rose-300 focus:border-rose-300" rows={4} placeholder="I like pizza because... "></textarea>
            </div>
          </div>
          <div className="flex flex-col items-center p-4">
            <button type="submit" className="bg-rose-500 hover:bg-rose-700 text-white w-3/4 font-bold py-2 px-4 rounded">
              Post
            </button>
          </div>
        </Form>
    )
}

