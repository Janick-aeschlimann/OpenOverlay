import db from "./db.js";
import { hasWorkspaceAccess } from "./workspaceController.js";

export const getRenderSource = async (req, res) => {
  const renderSourceId = req.params.rendersourceId;
  const userId = req.Session.getUserId();

  const [result] = await db.query("SELECT * FROM renderSource WHERE renderSourceId = ?", [
    renderSourceId,
  ]);

  if (result[0]) {
    if (hasWorkspaceAccess(userId, result[0].workspaceId)) {
      res.send(result[0]);
    } else {
      res.status(403).json({ message: "You Dont have access to this Render Source" });
    }
  } else {
    res.status(404).json({ message: "Render Source not found" });
  }
};

export const getWorkspaceRenderSources = async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const userId = req.Session.getUserId();

  if (!hasWorkspaceAccess(userId, workspaceId)) {
    return res.status(403).json({ message: "You dont have access to this workspace" });
  }

  const [result] = await db.query("SELECT * FROM renderSource WHERE workspaceId = ?", [
    workspaceId,
  ]);

  res.send(result);
};

export const createRenderSource = async (req, res) => {
  const { name, overlayId, width, height, frameRate } = req.body;
  const workspaceId = req.params.workspaceId;

  if (!hasWorkspaceAccess(workspaceId)) {
    return res.status(403).json({ message: "You dont have access to this workspace" });
  }

  if (name && width && height && frameRate) {
    await db.query(
      "INSERT INTO renderSource (name, overlayId, workspaceId, updated_at, width, height, frameRate) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, overlayId, workspaceId, new Date(), width, height, frameRate]
    );
  } else {
    res
      .status(400)
      .json({ message: "missing required fields: { name, overlayId?, width, height, frameRate }" });
  }
};
