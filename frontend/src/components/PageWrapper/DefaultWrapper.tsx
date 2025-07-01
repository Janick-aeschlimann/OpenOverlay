import { Outlet } from "react-router-dom";

const DefaultWrapper: React.FC = () => {
  return (
    <>
      <div className="min-h-screen h-screen relative overflow-hidden">
        <Outlet />
      </div>
    </>
  );
};

export default DefaultWrapper;
