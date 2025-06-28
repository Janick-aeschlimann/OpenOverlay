import { Camera, UserRound } from "lucide-react";
import { useState } from "react";

export interface IProfilePictureChangeProps {
  id: string;
}

const ProfilePictureChange: React.FC<IProfilePictureChangeProps> = (props) => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const profilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div
        className="group w-15 rounded-full"
        onClick={() => document.getElementById("profile_picture")?.click()}
      >
        <input
          id={props.id}
          type="file"
          className="hidden"
          onChange={profilePictureChange}
        ></input>
        <div className="bg-muted/75 absolute w-15 h-15 rounded-full group-hover:flex items-center justify-center cursor-pointer hidden">
          <Camera />
        </div>
        {profilePicture ? (
          <img
            className="w-15 h-15 rounded-full object-cover"
            src={profilePicture}
          />
        ) : (
          <div className="w-15 h-15 rounded-full flex items-center justify-center overflow-hidden bg-muted">
            <UserRound className="w-13 h-13" />
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePictureChange;
