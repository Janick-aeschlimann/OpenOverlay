import db from "./db.js";
import { hasWorkspaceAccess } from "./workspaceController.js";

export const getWorkspaceOverlay = async (req, res) => {
  const { workspaceId, overlayId } = req.params;
  const userId = req.session.getUserId();

  if (!(await hasWorkspaceAccess(userId, workspaceId))) {
    return res.status(403).json({ message: "You dont have access to this workspace" });
  }

  const [result] = await db.query("SELECT * FROM overlay WHERE overlayId = ?", [overlayId]);

  if (result[0]) {
    if (result[0].workspaceId == workspaceId) {
      res.send(result[0]);
    } else {
      res.status(404).json({ message: "Overlay not found in this Workspace" });
    }
  } else {
    res.status(404).json({ message: "Overlay not found" });
  }
};

export const createOverlay = async (req, res) => {
  const { workspaceId } = req.params;
  const { name, description } = req.body;
  const userId = req.session.getUserId();

  if (name) {
    try {
      await db.query(
        "INSERT INTO overlay (name, description, workspaceId, created_at, userId) VALUES (?, ?, ?, ?, ?)",
        [name, description, workspaceId, new Date(), userId]
      );
      res.status(201).json({ message: "Overlay created" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  } else {
    res.status(400).json({ message: "missing required fields: { name, description? }" });
  }
};

export const getWorkspaceOverlays = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.session.getUserId();

  if (!(await hasWorkspaceAccess(userId, workspaceId))) {
    return res.status(403).send("You dont have access to this workspace");
  }

  const [result] = await db.query("SELECT * FROM overlay WHERE workspaceId = ?", [workspaceId]);

  res.send(result);
};
