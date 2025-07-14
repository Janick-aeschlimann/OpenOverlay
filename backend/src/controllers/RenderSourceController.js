import db from "./db.js";
import { hasWorkspaceAccess } from "./workspaceController.js";
import crypto from "crypto";

import { createClient } from "redis";

const redis = createClient({ url: "redis://redis:6379" });

export const getRenderSource = async (req, res) => {
  const renderSourceId = req.params.rendersourceId;
  const userId = req.session.getUserId();

  const [result] = await db.query("SELECT * FROM renderSource WHERE renderSourceId = ?", [
    renderSourceId,
  ]);

  if (result[0]) {
    if (await hasWorkspaceAccess(userId, result[0].workspaceId)) {
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
  const userId = req.session.getUserId();

  if (!(await hasWorkspaceAccess(userId, workspaceId))) {
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
  const userId = req.session.getUserId();

  if (!(await hasWorkspaceAccess(userId, workspaceId))) {
    return res.status(403).json({ message: "You dont have access to this workspace" });
  }

  const token = crypto.randomBytes(64).toString("hex");

  if (name && width && height && frameRate) {
    await db.query(
      "INSERT INTO renderSource (name, overlayId, token, workspaceId, updated_at, width, height, frameRate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, overlayId, token, workspaceId, new Date(), width, height, frameRate]
    );
    res.status(201).json({ message: "Render Source created" });
  } else {
    res
      .status(400)
      .json({ message: "missing required fields: { name, overlayId?, width, height, frameRate }" });
  }
};

export const getRenderSourceWithToken = async (req, res) => {
  const token = req.params.token;

  const [result] = await db.query("SELECT * FROM renderSource WHERE token = ?", [token]);

  if (result[0]) {
    res.send(result[0]);
  } else {
    res.status(404).json({ message: "Token does not exist" });
  }
};

export const patchRenderSource = async (req, res) => {
  const renderSourceId = req.params.rendersourceId;
  const userId = req.session.getUserId();

  const { name, overlayId, width, height, frameRate } = req.body;

  if (!name && !overlayId && !width && !height && !frameRate) {
    return res.status(400).json({ message: "specify at least one field" });
  }

  const [renderSource] = await db.query("SELECT * FROM renderSource WHERE renderSourceId = ?", [
    renderSourceId,
  ]);

  if (renderSource[0]) {
    if (!(await hasWorkspaceAccess(userId, renderSource[0].workspaceId))) {
      return res.status(403).json({ message: "You dont have access to this workspace" });
    }
    if (overlayId) {
      const [overlay] = await db.query("SELECT * FROM overlay WHERE overlayId = ?", [overlayId]);
      if (overlay[0]) {
        if (overlay[0].workspaceId != renderSource[0].workspaceId) {
          return res.status(403).json({ message: "Overlay is not in this workspace" });
        }
      } else {
        return res.status(404).json({ message: "Overlay not found" });
      }
    }
    const [result] = await db.execute(
      `UPDATE renderSource SET name = ?, overlayId = ?, width = ?, height = ?, frameRate = ? WHERE renderSourceId = ?`,
      [
        name ?? renderSource[0].name,
        overlayId ?? renderSource[0].overlayId,
        width ?? renderSource[0].width,
        height ?? renderSource[0].height,
        frameRate ?? renderSource[0].frameRate,
        renderSourceId,
      ]
    );

    if (overlayId && overlayId != renderSource[0].overlayId) {
      await redis.connect();
      await redis.publish(
        `rendersource-${renderSourceId}`,
        JSON.stringify({
          type: "switch-overlay",
          newOverlayId: overlayId,
        })
      );
      await redis.quit();
    }

    res.json("Render Source Updated");
  } else {
    return res.status(404).json({ message: "RenderSource not found" });
  }
};
