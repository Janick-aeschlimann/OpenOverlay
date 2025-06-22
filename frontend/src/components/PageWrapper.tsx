import type { ReactNode } from "react";

export interface IPageWrapperProps {
  children: ReactNode;
}

const PageWrapper: React.FC<IPageWrapperProps> = (props) => {
  return (
    <>
      <div className="min-h-screen h-screen pt-18 relative">
        {props.children}
      </div>
    </>
  );
};

export default PageWrapper;
