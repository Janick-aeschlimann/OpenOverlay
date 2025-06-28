import { useWorkspaceStore } from "@/store/workspace";

const WorkspaceOverview: React.FC = () => {
  const workspace = useWorkspaceStore().activeWorkspace;
  return (
    <>
      <div className="h-full flex items-center justify-center flex-col">
        <h2>Wokspace Overview</h2>
        <p>{workspace?.name}</p>
      </div>
    </>
  );
};

export default WorkspaceOverview;
