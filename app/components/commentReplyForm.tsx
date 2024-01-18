import { Form } from "@remix-run/react"

interface ParameterState{
    setIsReplyingComments: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CommentReplyForm: React.FC<ParameterState> = ({ setIsReplyingComments }) => {
    return (
        <Form method="post" onSubmit={() => {
            setIsReplyingComments(false)}}>
            <div className="flex justify-center items-center px-2 py-1">
                <textarea name="answer" id="answer" className="md:resize-none boder-solid border-2 outline-none border-black rounded-md p-4 w-screen text-black hover:border-rose-300 focus:border-rose-300" rows={4} placeholder="Reply... "></textarea>
            </div>
            <div className="flex flex-col items-end px-2">
                <button type="submit" className="bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded">
                Submit
                </button>
            </div>
        </Form>
    )
}
