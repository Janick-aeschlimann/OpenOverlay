import { useAuthStore } from "@/store/auth";

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <>
      <div className="h-full flex items-center justify-center flex-col">
        <h2>Dashboard</h2>
        <p>{user?.userId}</p>
      </div>
    </>
  );
};

export default Dashboard;
