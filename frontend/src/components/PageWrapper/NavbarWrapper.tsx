import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";

const NavbarWrapper: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen h-screen pt-18 relative">
        <Outlet />
      </div>
    </>
  );
};

export default NavbarWrapper;
