import { Form } from "@remix-run/react"
import { useEffect, useRef } from "react";

interface ParameterState{
    setIsReplyingComments: React.Dispatch<React.SetStateAction<boolean>>;
    id: string;
    nameId: string;
    nameContent: string;
    nameCommentName: string;
    commentName: string;
}

export function CommentsReplyForm({ setIsReplyingComments, id, nameId, nameContent, nameCommentName, commentName }: ParameterState){
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
          }
      }, [])

    return (
        <Form method="post" onSubmit={() => setIsReplyingComments(false)}>
            <div className="flex justify-center items-center px-2 py-1">
                <textarea ref={textareaRef} name={nameContent} id={nameContent} className="md:resize-none boder-solid border-2 outline-none border-black rounded-md p-4 w-screen text-black hover:border-rose-300 focus:border-rose-300" rows={4} placeholder="Reply... "></textarea>
                <input type="hidden" name={nameId} value={id} />
                <input type="hidden" name={nameCommentName} value={commentName} />
            </div>
            <div className="flex flex-col items-end px-2">
                <button type="submit" className="bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded drop-shadow-lg">
                Submit
                </button>
            </div>
        </Form>
    )
}