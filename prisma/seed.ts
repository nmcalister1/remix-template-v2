import { PrismaClient } from "@prisma/client";
const db = new PrismaClient()

// async function seed(){
//     const kody = await db.user.create({
//       data: {
//         username: "kody",
//         passwordHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
//         hasAnsweredQuestion: false,
//         profilePicture: process.env.BASE_BG_IMAGE
//       }
//     })
//     await Promise.all(
//         [...getPosts().map((post) => {
//             const data = { posterId: kody.id, posterUsername: kody.username, posterProfilePicture: kody.profilePicture, ...post }
//             return db.post.create({ data })
//         }),
//         ...getComments().map((comment) => {
//             const data = { commenterId: kody.id, commenterUsername: kody.username, commenterProfilePicture: kody.profilePicture, ...comment }
//             return db.comment.create({ data })
//         })]
//     )
// }

// seed()

interface Post {
  postId: string;
  posterId: string;
  posterUsername: string;
  posterProfilePicture: string | null;
  createdAt: Date
  updatedAt: Date
  content: string;
}



async function seed() {
  
    const kody = await db.user.create({
      data: {
        username: "kody",
        passwordHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
        hasAnsweredQuestion: false,
        profilePicture: process.env.BASE_BG_IMAGE,
      },
    });

    const posts: Post[] = await Promise.all(
      getPosts().map((post) => {
        const data = { posterId: kody.id, posterUsername: kody.username, posterProfilePicture: kody.profilePicture, ...post };
        return db.post.create({ data });
      })
    );
    
    const commentsData = getComments(posts)

    await Promise.all(
      commentsData.map((comment) => {
        const data = { commenterId: kody.id, commenterUsername: kody.username, commenterProfilePicture: kody.profilePicture, ...comment };
        return db.comment.create({ data });
      })
    );

}

seed();


function getPosts(){
  return [
    {
      content: "I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there."
    },
    {
      content: "My first time using an elevator was an uplifting experience. The second time let me down."
    }
  ]
}

function getComments(posts: Post[]) {
  return [
    {
      commentsPostId: posts[0].postId, // Associate comment with the first post
      content: "Comment related to the first post",
    },
    {
      commentsPostId: posts[1].postId, // Associate comment with the second post
      content: "Comment related to the second post",
    },
    // Add more comments as needed
  ];
}
// function getComments(){
//   return [
//     {
//       content: "I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there."
//     },
//     {
//       content: "My first time using an elevator was an uplifting experience. The second time let me down."
//     }
//   ]
// }