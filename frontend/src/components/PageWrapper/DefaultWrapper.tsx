import { Outlet } from "react-router-dom";

const DefaultWrapper: React.FC = () => {
  return (
    <>
      <div className="min-h-dvh h-dvh max-h-dvh relative overflow-hidden">
        <Outlet />
      </div>
    </>
  );
};

export default DefaultWrapper;
