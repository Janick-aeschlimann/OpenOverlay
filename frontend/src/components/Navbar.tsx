import { Link } from "react-router-dom";

export interface INavbarProps {}

const Navbar: React.FC<INavbarProps> = (props) => {
  return (
    <>
      <Link to={"/"}>Home</Link>
      <Link to={"/auth"}>Auth</Link>
    </>
  );
};

export default Navbar;
