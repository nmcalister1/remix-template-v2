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
    const oldQuestionNumber = await getNextQuestion()
    
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

function getRandomDuration(minHours: number, maxHours: number): number {
    const randomFraction = Math.random();
    const randomHours = minHours + randomFraction * (maxHours - minHours);
    return randomHours * 60 * 60 * 1000; // Convert hours to milliseconds
  }
  

  export async function scheduleTask() {
    const minHours = 15;
    const maxHours = 24;
  
    const updateAndReset = async () => {
      await updateQuestionAndReset();
    };
  
    const randomDuration = getRandomDuration(minHours, maxHours);
  
    setInterval(async () => {
      await updateAndReset();
      const newRandomDuration = getRandomDuration(minHours, maxHours);
    
      // Reset the interval with a new random duration
      setInterval(updateAndReset, newRandomDuration);
    }, randomDuration);
  }