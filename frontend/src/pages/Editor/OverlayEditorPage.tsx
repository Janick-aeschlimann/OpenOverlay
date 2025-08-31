import Canvas from "@/components/Canvas/Canvas";
import CreateCanvasObjectModal from "@/components/Canvas/CreateCanvasObjectModal";
import Hierarchy from "@/components/Canvas/Hierarchy";
import Properties from "@/components/Canvas/Properties";
import Toolbar from "@/components/Canvas/Toolbar";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { useCanvasStore } from "@/store/canvas";
import { useUserStore } from "@/store/user";
import {
  ArrowLeft,
  ExternalLink,
  Network,
  Plus,
  Redo2,
  Undo2,
  User2,
} from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

const OverlayEditor: React.FC = () => {
  const navigate = useNavigate();

  const overlayId = 0;

  const { canvas, connection, updateCanvas } = useCanvasStore(overlayId);

  const [modalOpen, setModalOpen] = useState(false);

  const [hierarchyOpen, setHierarchyOpen] = useState<boolean>(true);

  const { setEditUser } = useUserStore();

  return (
    <>
      <div className="flex flex-col justify-stretch items-stretch h-full">
        <div className="flex flex-row justify-between items-center px-6 py-5 bg-[#1d1d1d] shadow-[0px_20px_15px_0px_rgba(0,_0,_0,_0.25)] z-50 border-b-1 border-[#505050]">
          <div className="flex flex-row items-center gap-3">
            <div
              className="cursor-pointer hover:bg-[#3f3f3f] p-2 rounded-xl"
              onClick={() => {
                navigate(-1);
              }}
            >
              <ArrowLeft className="h-7 w-7" />
            </div>
            <div className="border-l-2 border-neutral-600 h-8"></div>
            <div
              className="cursor-pointer hover:bg-[#3f3f3f] p-2 rounded-xl"
              onClick={() => {
                connection.canvasSync?.undoManager.undo();
              }}
            >
              <Undo2
                className="h-7 w-7"
                style={{
                  color: connection.canvasSync?.undoManager.canUndo()
                    ? "#ffffff"
                    : "#525252",
                }}
              />
            </div>
            <div
              className="cursor-pointer hover:bg-[#3f3f3f] p-2 rounded-xl"
              onClick={() => {
                connection.canvasSync?.undoManager.redo();
              }}
            >
              <Redo2
                className="h-7 w-7 text-neu"
                style={{
                  color: connection.canvasSync?.undoManager.canRedo()
                    ? "#ffffff"
                    : "#525252",
                }}
              />
            </div>
            <div className="border-l-2 border-neutral-600 h-8"></div>
            <div
              className="cursor-pointer hover:bg-[#3f3f3f] p-2 rounded-xl"
              onClick={() => {
                setModalOpen(true);
              }}
            >
              <Plus className="h-7 w-7 text-white" />
            </div>
            <div
              className="cursor-pointer hover:bg-[#3f3f3f] p-3 rounded-xl"
              onClick={() => {
                setHierarchyOpen((state) => !state);
              }}
            >
              <Network className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-row gap-4">
            <Button variant="secondary">
              <a
                href="/preview"
                target="_blank"
                className="flex flex-row gap-2 items-center"
              >
                Open Preview
                <ExternalLink />
              </a>
            </Button>
            <Input
              type="number"
              placeholder="Width"
              className="w-30"
              value={canvas.width}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateCanvas({
                  ...canvas,
                  width: Math.max(parseInt(e.target.value) || 0, 0),
                })
              }
            ></Input>
            <Input
              type="number"
              placeholder="Height"
              className="w-30"
              value={canvas.height}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateCanvas({
                  ...canvas,
                  height: Math.max(parseInt(e.target.value) || 0, 0),
                })
              }
            ></Input>
            <div
              className="cursor-pointer hover:bg-[#3f3f3f] p-2 rounded-xl"
              onClick={() => {
                setEditUser(true);
              }}
            >
              <User2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="flex flex-row h-full">
          <Hierarchy open={hierarchyOpen} overlayId={overlayId} />
          <div className="w-full relative">
            <div className="absolute h-full w-24 left-0 top-0 flex justify-center items-center">
              <Toolbar overlayId={overlayId} />
            </div>
            <Properties overlayId={overlayId} />
            <Canvas className="w-full flex-1 relative select-none" />
          </div>
        </div>
      </div>
      <CreateCanvasObjectModal
        overlayId={overlayId}
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
      />
    </>
  );
};

export default OverlayEditor;
