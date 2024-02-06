import { db } from "./db.server"

const questions: { [key: number]: string } =  {
        1: "What do you like to do for fun?",
        2: "Why is the sky blue?",
        3: "If you had 1M dollars what would you do?",
        4: "Why is Appa a sewer rat?",
        5: "Where is Alaska?",
        6: "Who is your favorite content creator?",
        7: "Apple or Android?",
}


async function getNextQuestion(){
    const currentQuestionRecord = await db.question.findFirst({
        where: {questionId: "1"},

    })
    const currentQuestionNumber = currentQuestionRecord?.currentQuestionNumber
   
    return currentQuestionNumber
}

async function updateQuestionAndReset() {
    let oldQuestionNumber = await getNextQuestion()
    if (oldQuestionNumber === 7){
      oldQuestionNumber = 0
    }
    
    
    if (oldQuestionNumber !== undefined) {
      const newQuestion = questions[oldQuestionNumber + 1];
      
      await db.question.update({
        where: { questionId: "1" },
        data: {
          question: newQuestion,
          currentQuestionNumber: oldQuestionNumber + 1,
        },
      })
    }
    
    
    await db.user.updateMany({
        data: {
            hasAnsweredQuestion: false,
        },
    })
    await db.post.deleteMany({})
}
  

  export async function scheduleTask() {
    const twentyFourHoursToMilliseconds = 86400000
  
    const updateAndReset = async () => {
      await updateQuestionAndReset();
      setTimeout(updateAndReset, 30000);
    };

    await updateAndReset()

  }