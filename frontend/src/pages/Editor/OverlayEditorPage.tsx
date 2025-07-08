import Canvas from "@/components/Canvas/Canvas";
import Toolbar from "@/components/Canvas/Toolbar";
import { Button } from "@/components/shadcn/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const OverlayEditor: React.FC = () => {
  const navigate = useNavigate();

  const overlayId = parseInt(useParams().id!);

  return (
    <>
      <div className="flex flex-col justify-stretch items-stretch h-full">
        <div className="flex flex-row justify-between items-center px-3 py-5 bg-[#1d1d1d] shadow-[0px_20px_15px_0px_rgba(0,_0,_0,_0.25)] z-50 border-b-1 border-[#505050]">
          <Button
            className="cursor-pointer"
            size={"default"}
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft />
            Back
          </Button>
          <Button className="cursor-pointer" size={"icon"} onClick={() => {}}>
            <Plus />
          </Button>
        </div>
        <div className="absolute h-full w-24 left-0 top-0 flex justify-center items-center">
          <Toolbar overlayId={overlayId} />
        </div>
        <Canvas className="w-screen flex-1 relative select-none" />
      </div>
    </>
  );
};

export default OverlayEditor;
