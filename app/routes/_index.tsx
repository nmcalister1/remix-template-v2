import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { useState } from "react";
import { z } from "zod";
import { AnswerForm } from "~/components/answerForm";
import { Avatars } from "~/components/avatars";
import { CommentReplyForm } from "~/components/commentReplyForm";
import { CommentsReplyForm } from "~/components/commentsReplyForm";
import { ProfilePic } from "~/components/pfp";
import { ArrowDownIcon } from "~/icons/arrowDown";
import { db } from "~/utils/db.server";
import { getUser, getUserId, requireUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  if (!userId){
    throw redirect("/login")
  }

  const user = await getUser(request)
  const postsList = await db.post.findMany({
    orderBy: { createdAt: "desc" },
  })
  const question = await db.question.findUnique({
    where: { questionId: "1" },
  })

  
  const questionSchema = z.object({
    question: z.string(),
  })

  const postsSchema = z.object({
    postId: z.string(),
    posterUsername: z.string(),
    content: z.string(),
    createdAt: z.date(),
    posterProfilePicture: z.string()
  })

  const commentsList = await db.comment.findMany({
    orderBy: { createdAt: "desc" },
  })

  const commentsSchema = z.object({
    commentId: z.string(),
    commentsPostId: z.string(),
    commenterUsername: z.string(),
    content: z.string(),
    createdAt: z.date(),
    commenterProfilePicture: z.string()
  })

  const replyList = await db.reply.findMany({
    orderBy: { createdAt: "desc" },
  })

  const replySchema = z.object({
    replyId: z.string(),
    replysCommentId: z.string(),
    replyerUsername: z.string(),
    content: z.string(),
    createdAt: z.date(),
    replyerProfilePicture: z.string(),
    replysCommentUsername: z.string(),
  })

  const replyToReplyList = await db.replies.findMany({
    orderBy: { createdAt: "desc" },
  })

  const replyToReplySchema = z.object({
    replyToReplyId: z.string(),
    replyToReplysReplyId: z.string(),
    replyToReplyerUsername: z.string(),
    content: z.string(),
    createdAt: z.date(),
    replyToReplyerProfilePicture: z.string(),
    replyToReplysReplyUsername: z.string(),
  })

  try {
    const postListItems = postsList.map((post) => ({
      ...postsSchema.parse(post)
    }))
    const filteredPosts = postListItems.filter((postListItem) => user?.friends?.includes(postListItem.posterUsername));
    const profilePictures = filteredPosts
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) 
    .slice(0, 4) 
    .map(({ posterProfilePicture }) => posterProfilePicture)
    

    const commentListItems = commentsList.map((comment) => ({
      ...commentsSchema.parse(comment)
    }))
    const replyListItems = replyList.map((reply) => ({
      ...replySchema.parse(reply)
    }))
    const replyToReplyListItems = replyToReplyList.map((replyToReply) => ({
      ...replyToReplySchema.parse(replyToReply)
    }))
    const questionItem = {...questionSchema.parse(question)}
    return json({ filteredPosts, profilePictures, commentListItems, replyListItems, replyToReplyListItems, user, questionItem })
  } catch (e){
    console.error("there was an error fetching post data", e)
    return redirect('/')
  }
}

type FieldErrors = { [key: string]: string }

export const action = async({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)
  const user = await getUser(request)
  const formPayload = Object.fromEntries(await request.formData())
  if (formPayload.content){
    const postSchema = z.object({
      content: z.string().min(1, { message: "Must be more than 0 characters" }),
    })
    const newPost = postSchema.safeParse(formPayload)

    if (!newPost.success){
      const errors: FieldErrors = {}
      newPost.error.issues.forEach(issue => {
          const path = issue.path.join(".")
          errors[path] = issue.message
      })
      return json({ errors, data: formPayload }, { status: 400 })
    } else {
          
        const post = await db.post.create({
          data: { ...newPost.data, posterId: userId, posterUsername: user.username, posterProfilePicture: user?.profilePicture }
        })
        const updateUser = await db.user.update({
          where: {
            id: userId
          }, 
          data: {
            hasAnsweredQuestion: true
    
          }
        })
        return redirect("/")     
    }
  } else if (formPayload.comment){
    const commentSchema = z.object({
      comment: z.string().min(1, { message: "Must be more than 0 characters" }),
      postId: z.string(),
    })
    const newComment = commentSchema.safeParse(formPayload)

    if (!newComment.success){
      const errors: FieldErrors = {}
      newComment.error.issues.forEach(issue => {
          const path = issue.path.join(".")
          errors[path] = issue.message
      })
      return json({ errors, data: formPayload }, { status: 400 })
    } else {
          try {
            const comment = await db.comment.create({
              data: { content: newComment.data.comment, commenterId: userId, commenterUsername: user.username, commenterProfilePicture: user?.profilePicture, commentsPostId: newComment.data.postId }
            })
            
            return null
          } catch(e){
            return redirect("/")
          }
          
    }
  } else if (formPayload.reply){
    const replySchema = z.object({
      reply: z.string().min(1, { message: "Must be more than 0 characters" }),
      commentId: z.string(),
      commentUsername: z.string(),
    })
    const newReply = replySchema.safeParse(formPayload)

    if (!newReply.success){
      const errors: FieldErrors = {}
      newReply.error.issues.forEach(issue => {
          const path = issue.path.join(".")
          errors[path] = issue.message
      })
      return json({ errors, data: formPayload }, { status: 400 })
    } else {
        try{
          const reply = await db.reply.create({
            data: { content: newReply.data.reply, replyerId: userId, replyerUsername: user.username, replyerProfilePicture: user?.profilePicture, replysCommentId: newReply.data.commentId, replysCommentUsername: newReply.data.commentUsername }
          })
          
          return null
        } catch(e){
          return redirect("/")
        }
    }
  } else if (formPayload.replyToReply){
    const replySchema = z.object({
      replyToReply: z.string().min(1, { message: "Must be more than 0 characters" }),
      replyId: z.string(),
      replyUsername: z.string(),
    })
    const newReply = replySchema.safeParse(formPayload)

    if (!newReply.success){
      const errors: FieldErrors = {}
      newReply.error.issues.forEach(issue => {
          const path = issue.path.join(".")
          errors[path] = issue.message
      })
      return json({ errors, data: formPayload }, { status: 400 })
    } else {
        try{
          const replyToReply = await db.replies.create({
            data: { content: newReply.data.replyToReply, replyToReplyerId: userId, replyToReplyerUsername: user.username, replyToReplyerProfilePicture: user?.profilePicture, replyToReplysReplyId: newReply.data.replyId, replyToReplysReplyUsername: newReply.data.replyUsername }
          })
          
          return null
        } catch(e){
          return redirect("/")
        }
          
    }
  }
}




export default function IndexRoute(){
  const data = useLoaderData<typeof loader>()

  const [selectedPostId, setSelectedPostId] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [isReplyingComments, setIsReplyingComments] = useState(false)
  const [isReplyingReply, setIsReplyingReply] = useState(false)
  const [selectedReplyPostId, setSelectedReplyPostId] = useState("")
  const [selectedCommentId, setSelectedCommentId] = useState("")
  const [selectedReplyId, setSelectedReplyId] = useState("")

  const toggleArrow = (postId: string) => {
    setIsReplying(false);
    setSelectedPostId((prevId) => (prevId === postId ? "" : postId));
  }

  const toggleReplyingComments = (commentId: string) => {
    setIsReplyingComments(true);
    setSelectedCommentId((prevId) => (prevId === commentId ? "" : commentId));
  }
  const toggleReplyingReplies = (replyId: string) => {
    setIsReplyingReply(true);
    setSelectedReplyId((prevId) => (prevId === replyId ? "" : replyId));
  }
  const toggleReplies = (replyToReplyId: string) => {
    setIsReplyingReply(true);
    setSelectedReplyId((prevId) => (prevId === replyToReplyId ? "" : replyToReplyId));
  }

  return (
    <div>
      <div className="bg-rose-500 p-6">
        <h1 className="flex justify-center p-4 text-xl md:text-3xl text-stone-900">
          Question of the Day:
        </h1>
        <h1 className="flex justify-center p-4 text-2xl md:text-6xl font-bold text-stone-100 drop-shadow-lg">{data?.questionItem?.question}</h1>
      </div>
      <div className="md:p-6 h-screen">
      {data?.user?.hasAnsweredQuestion ? (
        <div className="p-4">
          <div className="bg-stone-100 p-2 rounded">
            <Avatars profilePictures={data?.profilePictures} />
          </div>
          
          {data.filteredPosts.map(({ postId, posterUsername, content, createdAt, posterProfilePicture }) => (
            <div key={postId}>
              <div className="drop-shadow-2xl">
              <div className="bg-stone-100 p-2 rounded-tr rounded-tl rounded-br-none rounded-bl-none mt-6 md:flex shadow-lg">
                  
                  <ProfilePic classes="p-2 w-16 h-16 md:w-36 md:h-36 rounded-full drop-shadow-lg" source={posterProfilePicture} />
                  <Link to={`/user/${posterUsername}`} className="font-normal underline text-indigo-700 hover:text-indigo-500 text-xs md:text-base inline sm:hidden ml-2">{posterUsername}</Link>
                  <span className="font-light text-xs md:text-base inline sm:hidden">&nbsp;-&nbsp;</span>
                  <p className="font-light text-xs md:text-base inline sm:hidden">posted at {format(createdAt, 'h:mm a')}</p>
                  
                  <div className="md:ml-7 p-2">
                  <p className="font-medium text-stone-800 text-xl">{content}</p>
                  </div>
              </div>
              <div className="flex md:justify-end bg-stone-100 p-2 rounded-br rounded-bl rounded-tr-none rounded-tl-none">
                  <Link to={`/user/${posterUsername}`} className="font-normal underline text-indigo-700 hover:text-indigo-500 text-xs md:text-base hidden md:inline mt-1">{posterUsername}</Link>
                  <span className="font-light text-xs md:text-base hidden md:inline mt-1">&nbsp;-&nbsp;</span>
                  <p className="font-light text-xs md:text-base hidden md:inline mt-1">posted at {format(createdAt, 'h:mm a')}</p>
                  <span className="hidden md:inline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  <span className="inline ml-28 w-auto md:hidden"></span>
                  <button onClick={() => {
                      setIsReplying(true)
                      setSelectedReplyPostId(postId)
                      }} className="bg-rose-500 hover:bg-rose-700 text-white font-bold p-1 rounded text-sm md:text-base ml-36 md:m-0 md:mr-4 drop-shadow-lg">Reply</button>
              </div>
              </div>

              <div className="flex justify-center">
                  <button onClick={() => toggleArrow(postId)} className="flex items-center justify-center bg-rose-600 hover:bg-rose-900 text-white font-bold p-1 rounded text-sm md:text-base w-screen shadow-sm">
                  {data.commentListItems.filter(comment => comment.commentsPostId === postId).length} Comment{data.commentListItems.filter(comment => comment.commentsPostId === postId).length !== 1 && 's'}{<ArrowDownIcon />}</button>
              </div>

            {selectedPostId === postId && !isReplying &&
                
                data.commentListItems.map(({ commentId, commentsPostId, commenterUsername, content, createdAt, commenterProfilePicture }) => (
                  commentsPostId === selectedPostId ? (
                    <div key={commentId} className="shadow-2xl w-5/6 m-auto bg-stone-200 p-1 rounded-lg">
                      <div className="p-2 rounded-tr rounded-tl rounded-br-none rounded-bl-none md:flex">
                        
                        <ProfilePic classes="p-2 w-16 h-16 md:w-36 md:h-36 rounded-full drop-shadow-lg" source={commenterProfilePicture} />
                        <Link to={`/user/${commenterUsername}`} className="font-normal underline text-indigo-700 hover:text-indigo-500 text-xs md:text-base inline sm:hidden ml-2">{commenterUsername}</Link>
                        <span className="font-light text-xs md:text-base inline sm:hidden">&nbsp;-&nbsp;</span>
                        <p className="font-light text-xs md:text-base inline sm:hidden">posted at {format(createdAt, 'h:mm a')}</p>
                        
                        <div className="md:ml-7 p-2">
                        <p className="font-medium text-sm md:text-base"><Link to={`/user/${posterUsername}`}  className="text-rose-400 hover:text-rose-600">@{posterUsername}<span>&nbsp;</span></Link>{content}</p>
                        </div>
                    </div>
                    <div className="flex md:justify-end p-2 rounded-br rounded-bl rounded-tr-none rounded-tl-none">
                        <Link to={`/user/${commenterUsername}`} className="font-normal underline text-indigo-700 hover:text-indigo-500 text-xs md:text-base hidden md:inline mt-1">{commenterUsername}</Link>
                        <span className="font-light text-xs md:text-base hidden md:inline mt-1">&nbsp;-&nbsp;</span>
                        <p className="font-light text-xs md:text-base hidden md:inline mt-1">posted at {format(createdAt, 'h:mm a')}</p>
                        <span className="hidden md:inline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <span className="inline ml-28 w-auto md:hidden"></span>
              
                        <button onClick={() => toggleReplyingComments(commentId)} className="bg-rose-500 hover:bg-rose-700 text-white font-bold p-1 rounded text-sm md:text-base md:mr-4 drop-shadow-lg">Reply</button>
                        
                    </div>
                    {selectedCommentId === commentId && isReplyingComments ? (
                        <CommentsReplyForm setIsReplyingComments={setIsReplyingComments} id={commentId} nameId="commentId" nameContent="reply" nameCommentName="commentUsername" commentName={commenterUsername} />
                    ) : null}


                    {
                        
                        data.replyListItems.map(({ replyId, replysCommentId, replyerUsername, content, createdAt, replyerProfilePicture, replysCommentUsername }) => (
                          ( replysCommentId === commentId ? 
                            <div key={replyId} className="shadow-2xl w-5/6 m-auto bg-stone-200 p-1 rounded-lg">
                              <div className="p-2 rounded-tr rounded-tl rounded-br-none rounded-bl-none md:flex">
                                
                                <ProfilePic classes="p-2 w-16 h-16 md:w-36 md:h-36 rounded-full drop-shadow-lg" source={replyerProfilePicture} />
                                <Link to={`/user/${replyerUsername}`} className="font-normal underline text-indigo-700 hover:text-indigo-500 text-xs md:text-base inline sm:hidden ml-2">{replyerUsername}</Link>
                                <span className="font-light text-xs md:text-base inline sm:hidden">&nbsp;-&nbsp;</span>
                                <p className="font-light text-xs md:text-base inline sm:hidden">posted at {format(createdAt, 'h:mm a')}</p>
                                
                                <div className="md:ml-7 p-2">
                                <p className="font-medium text-sm md:text-base"><Link to={`/user/${replysCommentUsername}`}  className="text-rose-400 hover:text-rose-600">@{replysCommentUsername}<span>&nbsp;</span></Link>{content}</p>
                                </div>
                            </div>
                            <div className="flex md:justify-end p-2 rounded-br rounded-bl rounded-tr-none rounded-tl-none">
                                <Link to={`/user/${replyerUsername}`} className="font-normal underline text-indigo-700 hover:text-indigo-500 text-xs md:text-base hidden md:inline mt-1">{replyerUsername}</Link>
                                <span className="font-light text-xs md:text-base hidden md:inline mt-1">&nbsp;-&nbsp;</span>
                                <p className="font-light text-xs md:text-base hidden md:inline mt-1">posted at {format(createdAt, 'h:mm a')}</p>
                                <span className="hidden md:inline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                <span className="inline ml-28 w-auto md:hidden"></span>
                      
                                <button onClick={() => toggleReplyingReplies(replyId)} className="bg-rose-500 hover:bg-rose-700 text-white font-bold p-1 rounded text-sm md:text-base md:mr-4 drop-shadow-lg">Reply</button>
                                
                            </div>
                            {selectedReplyId === replyId && isReplyingReply ? (
                                <CommentsReplyForm setIsReplyingComments={setIsReplyingReply} id={replyId} nameId="replyId" nameContent="replyToReply" nameCommentName="replyUsername" commentName={replyerUsername} />
                            ) : null}

                            {
                              
                              data.replyToReplyListItems.map(({ replyToReplyId, replyToReplysReplyId, replyToReplyerUsername, content, createdAt, replyToReplyerProfilePicture, replyToReplysReplyUsername }) => (
                                ( replyToReplysReplyId === replyId ? 
                                  <div key={replyToReplyId} className="m-auto bg-stone-200 p-1 rounded-lg">
                                    <div className="p-2 rounded-tr rounded-tl rounded-br-none rounded-bl-none md:flex">
                                      
                                      <ProfilePic classes="p-2 w-16 h-16 md:w-36 md:h-36 rounded-full drop-shadow-lg" source={replyToReplyerProfilePicture} />
                                      <Link to={`/user/${replyToReplyerUsername}`} className="font-normal underline text-indigo-700 hover:text-indigo-500 text-xs md:text-base inline sm:hidden ml-2">{replyToReplyerUsername}</Link>
                                      <span className="font-light text-xs md:text-base inline sm:hidden">&nbsp;-&nbsp;</span>
                                      <p className="font-light text-xs md:text-base inline sm:hidden">posted at {format(createdAt, 'h:mm a')}</p>
                                      
                                      <div className="md:ml-7 p-2">
                                      <p className="font-medium text-sm md:text-base"><Link to={`/user/${replyToReplysReplyUsername}`} className="text-rose-400 hover:text-rose-600">@{replyToReplysReplyUsername}<span>&nbsp;</span></Link>{content}</p>
                                      </div>
                                  </div>
                                  <div className="flex md:justify-end p-2 rounded-br rounded-bl rounded-tr-none rounded-tl-none">
                                      <Link to={`/user/${replyToReplyerUsername}`} className="font-normal underline text-indigo-700 hover:text-indigo-500 text-xs md:text-base hidden md:inline mt-1">{replyToReplyerUsername}</Link>
                                      <span className="font-light text-xs md:text-base hidden md:inline mt-1">&nbsp;-&nbsp;</span>
                                      <p className="font-light text-xs md:text-base hidden md:inline mt-1">posted at {format(createdAt, 'h:mm a')}</p>
                                      <span className="hidden md:inline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                      <span className="inline ml-28 w-auto md:hidden"></span>
                            
                                      <button onClick={() => toggleReplies(replyToReplyId)} className="bg-rose-500 hover:bg-rose-700 text-white font-bold p-1 rounded text-sm md:text-base md:mr-4 drop-shadow-lg">Reply</button>
                                      
                                  </div>
                                  {selectedReplyId === replyToReplyId && isReplyingReply ? (
                                    <CommentsReplyForm setIsReplyingComments={setIsReplyingReply} id={replyId} nameId="replyId" nameContent="replyToReply" nameCommentName="replyUsername" commentName={replyToReplyerUsername} />
                                ) : null}
                                
                                  </div> : null)
                                
                              ))
                              
                            }
                          
                            </div> : null)
                          
                        ))
                        
                      }
            
                  
                    </div> ) : null
                  
                ))
                
              }


            {selectedReplyPostId === postId && isReplying ? (
                <CommentReplyForm onSubmitCallback={() => toggleArrow(postId)} id={postId} nameId="postId" nameContent="comment" />
            ) : null}
          </div>
          ))}
        </div>
        ) : (
        <AnswerForm />
        )}
      </div>
    </div>
  )
}

