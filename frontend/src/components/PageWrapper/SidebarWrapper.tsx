import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";

const SidebarWrapper: React.FC = () => {
  return (
    <>
      <Sidebar>
        <Outlet />
      </Sidebar>
    </>
  );
};

export default SidebarWrapper;
