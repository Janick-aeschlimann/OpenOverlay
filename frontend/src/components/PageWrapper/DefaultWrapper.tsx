import { Outlet } from "react-router-dom";

const DefaultWrapper: React.FC = () => {
  return (
    <>
      <div className="min-h-screen h-screen relative">
        <Outlet />
      </div>
    </>
  );
};

export default DefaultWrapper;
