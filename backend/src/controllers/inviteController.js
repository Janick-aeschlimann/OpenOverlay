import { constants } from "buffer";
import db from "./db.js";
import { getRoleData } from "./roleController.js";
import { getUserData } from "./userController.js";
import { getWorkspaceData, hasWorkspaceAccess } from "./workspaceController.js";
import crypto from "crypto";

export const getWorkspaceInvites = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.session.getUserId();

  if (!(await hasWorkspaceAccess(userId, workspaceId))) {
    return res.status(403).json({ message: "You dont have access to this workspace" });
  }

  const [result] = await db.query("SELECT * FROM workspace_invite WHERE workspaceId = ?", [
    workspaceId,
  ]);

  const response = await Promise.all(
    result.map(async (invite) => ({
      workspaceInviteId: invite.workspaceInviteId,
      token: invite.token,
      created_by: {
        username: (await getUserData(invite.created_by)).username,
      },
      expires_at: invite.expires_at,
      usages: invite.usages,
      max_usages: invite.max_usages,
      role: (await getRoleData(invite.roleId)).name,
    }))
  );

  res.send(response);
};

export const createWorkspaceInvite = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.session.getUserId();

  const { expires_at, max_usages, roleId } = req.body;

  if (!roleId) {
    return res.status(400).json({ message: "missing required fileds: { roleId }" });
  }

  if (!(await hasWorkspaceAccess(userId, workspaceId))) {
    return res.status(403).json({ message: "You dont have access to this workspace" });
  }

  const [role] = await db.query(
    "SELECT * FROM workspace_role WHERE roleId = ? AND workspaceId = ?",
    [roleId, workspaceId]
  );

  if (!role[0]) {
    return res.status(404).json({ message: "Role not found in workspace" });
  }

  const token = crypto.randomBytes(64).toString("hex");

  const [result] = await db.query(
    "INSERT INTO workspace_invite (workspaceId, token, created_by, expires_at, usages, max_usages, roleId) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      workspaceId,
      token,
      userId,
      expires_at ? new Date(expires_at).toISOString().slice(0, 19).replace("T", " ") : null,
      0,
      max_usages,
      roleId,
    ]
  );

  res.status(201).json({ message: "invite created", token: token });
};

export const deleteWorkspaceInvite = async (req, res) => {
  const { workspaceId, inviteId } = req.params;
  const userId = req.session.getUserId();

  if (!(await hasWorkspaceAccess(userId, workspaceId))) {
    return res.status(403).json({ message: "You dont have access to this workspace" });
  }

  const [invite] = await db.query(
    "SELECT * FROM workspace_invite WHERE workspaceInviteId = ? AND workspaceId = ?",
    [inviteId, workspaceId]
  );

  if (!invite[0]) {
    return res.status(404).json({ message: "Invite not found" });
  }

  const [success] = await db.query("DELETE FROM workspace_invite WHERE workspaceInviteId = ?", [
    inviteId,
  ]);

  if (success.affectedRows == 1) {
    res.json({ message: "invite deleted" });
  } else {
    res.status(500).json({ message: "Could not delete invite" });
  }
};

export const acceptWorkspaceInvite = async (req, res) => {
  const { token } = req.params;
  const userId = req.session.getUserId();

  const [invite] = await db.query("SELECT * FROM workspace_invite WHERE token = ?", [token]);

  if (!invite[0]) {
    return res.status(403).json({ message: "Token invalid" });
  }

  if (invite[0].expires_at && invite[0].expires_at > new Date()) {
    return res.status(403).json({ message: "Invite expired" });
  }

  if (invite[0].max_usages && invite[0].usages >= invite[0].max_usages) {
    return res.status(403).json({ message: "Invite has exceeded its limit" });
  }

  if (await hasWorkspaceAccess(userId, invite[0].workspaceId)) {
    return res.status(409).json({ message: "You already joined this workspace" });
  }

  const [access] = await db.query("INSERT INTO workspace_access (roleId, userId) VALUES (?, ?)", [
    invite[0].roleId,
    userId,
  ]);

  if (access.affectedRows == 1) {
    const [update] = await db.query(
      "UPDATE workspace_invite SET usages = ? WHERE workspaceInviteId = ?",
      [invite[0].usages + 1, invite[0].workspaceInviteId]
    );

    const [workspace] = await db.query("SELECT * FROM workspace WHERE workspaceId = ?", [
      invite[0].workspaceId,
    ]);

    res.json({ message: "Joined workspace", slug: workspace[0].slug });
  } else {
    res.status(500).json({ message: "Could not join Workspace" });
  }
};

export const getWorkspaceInvite = async (req, res) => {
  const { token } = req.params;
  const userId = req.session.getUserId();

  const [invite] = await db.query("SELECT * FROM workspace_invite WHERE token = ?", [token]);

  if (!invite[0]) {
    return res.status(403).json({ message: "Token invalid" });
  }

  if (invite[0].expires_at && invite[0].expires_at > new Date()) {
    return res.status(403).json({ message: "Invite expired" });
  }

  if (invite[0].max_usages && invite[0].usages >= invite[0].max_usages) {
    return res.status(403).json({ message: "Invite has exceeded its limit" });
  }

  const inviter = await getUserData(invite[0].created_by);
  const workspace = await getWorkspaceData(invite[0].workspaceId);
  const joined = await hasWorkspaceAccess(userId, invite[0].workspaceId);

  res.send({
    inviter: { username: inviter.username, profile_picture: inviter.profile_picture },
    workspace: { name: workspace.name, logo: workspace.logo },
    joined: joined,
  });
};
