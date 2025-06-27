import { useAuthStore } from "@/store/auth";

const Workspaces: React.FC = () => {
  const user = useAuthStore().user;
  return (
    <>
      <div className="h-full flex items-center justify-center flex-col">
        <h2>Workspaces</h2>
        <p>{user?.userId}</p>
      </div>
    </>
  );
};

export default Workspaces;
