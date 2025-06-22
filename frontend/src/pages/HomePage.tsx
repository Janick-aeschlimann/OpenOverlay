import { useEffect, useState } from "react";
import Session from "supertokens-web-js/recipe/session";

const Home: React.FC = () => {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    getUserId();
  }, []);

  const getUserId = async () => {
    setUserId(await Session.getUserId());
  };

  return (
    <>
      <h2>Home</h2>
      <p>{userId}</p>
    </>
  );
};

export default Home;
