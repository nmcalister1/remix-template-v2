import { AnswerForm } from "~/components/answerForm";
import { Posts } from "~/components/posts";


export default function IndexRoute(){
  return (
    <div>
      <div className="bg-rose-500 p-6">
        <h1 className="flex justify-center p-4 text-xl md:text-3xl text-stone-900">
          Question of the Day:
        </h1>
        <h1 className="flex justify-center p-4 text-2xl md:text-6xl font-bold text-stone-100 drop-shadow-lg">What is your favorite food?</h1>
      </div>
      <div className="p-6 h-screen">
        {/* <AnswerForm /> */}
        <Posts />
      </div>
    </div>
  )
}

