interface AvatarsProps {
  profilePictures: string[];
}


export function Avatars({ profilePictures }: AvatarsProps) {
    return (
      <>
        {/* <div className="flex -space-x-1 overflow-hidden">
          <img
            className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
            src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
          />
          <img
            className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
            src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
          />
          <img
            className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
            alt=""
          />
          <img
            className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
          />
        </div> */}
  
        {/* <div className="flex -space-x-2 overflow-hidden">
          <img
            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
            src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
          />
          <img
            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
            src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
          />
          <img
            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
            alt=""
          />
          <img
            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
          />
        </div> */}
        <div className="grid md:grid-cols-3 md:gap-4">
            <div className="flex mx-auto md:mx-0 -space-x-2 p-2 drop-shadow-lg">
                <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden"
                    src={profilePictures[0] ? profilePictures[0] : "https://jex-user-images-nmcalister.s3.amazonaws.com/pfp3.jpg"}
                    alt=""
                />
                <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden"
                    src={profilePictures[1] ? profilePictures[1] : "https://jex-user-images-nmcalister.s3.amazonaws.com/pfp3.jpg"}
                    alt=""
                />
                <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden"
                    src={profilePictures[2] ? profilePictures[2] : "https://jex-user-images-nmcalister.s3.amazonaws.com/pfp3.jpg"}
                    alt=""
                />
                <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden"
                    src={profilePictures[3] ? profilePictures[3] : "https://jex-user-images-nmcalister.s3.amazonaws.com/pfp3.jpg"}
                    alt=""
                />
            </div>
            <div className="flex justify-center items-center">
                <h1 className="font-bold text-rose-500 text-4xl p-2 drop-shadow-sm">Posts</h1>
            </div>
            </div>
        
      </>
    )
  }