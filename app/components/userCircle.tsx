interface props {
    user: Record<string, any> | null
    className?: string
}

export function UserCircle({ user, className}: props){
    return (
        <div className={`${className} bg-gray-400 rounded-full flex justify-center items-center`} 
        style={{
            backgroundSize: "cover",
            ...(user?.profilePicture ? { backgroundImage: `url(${user.profilePicture})` } : {})
        }}>
            {!user?.profilePicture && (
                <h2>{user?.username.charAt(0).toUpperCase()}</h2>
            )}
           
        </div>
    )
}