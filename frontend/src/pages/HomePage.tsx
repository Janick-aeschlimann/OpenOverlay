import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
export interface IHomeProps {}

const Home: React.FC<IHomeProps> = (props) => {
  const [userId, setUserId] = useState<String>();

  useEffect(() => {
    getUserId();
  }, []);

  const getUserId = async () => {
    setUserId(await Session.getUserId());
  };

  const navigate = useNavigate();

  const logout = async () => {
    await Session.signOut();
    navigate("/auth");
  };

  return (
    <>
      <h2>Home</h2>
      <p>{userId}</p>
      <button onClick={logout}>Logout</button>
    </>
  );
};

export default Home;
