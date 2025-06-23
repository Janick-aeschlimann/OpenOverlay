import { useAuthStore } from "@/store/auth";

const Home: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <>
      <h2>Home</h2>
      <p>{user?.userId}</p>
    </>
  );
};

export default Home;
