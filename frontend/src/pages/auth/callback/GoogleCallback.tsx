import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInAndUp } from "supertokens-web-js/recipe/thirdparty";

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    handleGoogleCallback();
  }, []);

  const handleGoogleCallback = async () => {
    try {
      const response = await signInAndUp();

      if (response.status === "OK") {
        console.log(response.user);
        if (
          response.createdNewRecipeUser &&
          response.user.loginMethods.length === 1
        ) {
          // sign up successful
        } else {
          // sign in successful
        }
      } else if (response.status === "SIGN_IN_UP_NOT_ALLOWED") {
        navigate("/login", { state: { error: response.reason } });
      } else {
        navigate("/login", {
          state: {
            error:
              "No email provided by social login. Please use another form of login",
          },
        });
      }
    } catch (err: any) {
      console.error(err);
      navigate("/login", { state: { error: "Something went wrong!" } });
    }
  };
  return <></>;
};

export default GoogleCallback;
