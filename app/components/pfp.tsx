import { Link } from "@remix-run/react";

interface ProfilePicProps {
    classes: string;
    source: string;
  }

export function ProfilePic({ classes, source }: ProfilePicProps){
    return (
        <>
            <img
                    className={classes}
                    src={source}
                    alt=""
                />
        </>
    )
}