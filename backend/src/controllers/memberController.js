import db from "./db.js";
import { hasWorkspaceAccess, isWorkspaceOwner } from "./workspaceController.js";

export const getWorkspaceMembers = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.session.getUserId();

  if (!(await hasWorkspaceAccess(userId, workspaceId))) {
    return res.status(403).json({ message: "You dont have access to this workspace" });
  }

  const [members] = await db.query(
    `SELECT 
      us.*, wr.name as role
    FROM workspace_role wr
    INNER JOIN workspace_access wa ON wr.roleId = wa.roleId
    INNER JOIN user us ON wa.userId = us.userId
    WHERE wr.workspaceId = ?`,
    [workspaceId]
  );

  res.send(members);
};

export const deleteWorkspaceMember = async (req, res) => {
  const { workspaceId, userId: memberId } = req.params;
  const userId = req.session.getUserId();

  if (!(await isWorkspaceOwner(userId, workspaceId))) {
    return res.status(403).json({ message: "You dont have access to this workspace" });
  }

  const [result] = await db.query(
    `SELECT *
    FROM workspace_role wr
    INNER JOIN workspace_access wa ON wr.roleId = wa.roleId
    WHERE wr.workspaceId = ? AND wa.userId = ?`,
    [workspaceId, memberId]
  );

  if (!result[0]) {
    return res.status(404).json({ message: "User not found in Workspace" });
  }

  const [success] = await db.query("DELETE FROM workspace_access WHERE accessId = ?", [
    result[0].accessId,
  ]);

  if (success.affectedRows == 1) {
    res.json({ message: "member removed from workspace" });
  } else {
    res.status(500).json({ message: "Could not remove member from workspace" });
  }
};

export const updateMemberAccess = async (req, res) => {
  const { workspaceId, userId: memberId } = req.params;
  const userId = req.session.getUserId();

  const { roleId } = req.body;

  if (!roleId) {
    return res.status(400).json({ message: "Missing required fields: { roleId }" });
  }

  if (!(await isWorkspaceOwner(userId, workspaceId))) {
    return res.status(403).json({ message: "You dont have access to this workspace" });
  }

  const [user] = await db.query(
    `SELECT *
    FROM workspace_role wr
    INNER JOIN workspace_access wa ON wr.roleId = wa.roleId
    WHERE wr.workspaceId = ? AND wa.userId = ?`,
    [workspaceId, memberId]
  );

  if (!user[0]) {
    return res.status(404).json({ message: "User not found in Workspace" });
  }

  const [role] = await db.query(
    "SELECT * FROM workspace_role WHERE roleId = ? AND workspaceId = ?",
    [roleId, workspaceId]
  );

  if (!role[0]) {
    return res.status(404).json({ message: "Role not found in workspace" });
  }

  const [update] = await db.query("UPDATE workspace_access SET roleId = ? WHERE accessId = ?", [
    roleId,
    user[0].accessId,
  ]);

  if (update.affectedRows == 1) {
    res.json({ message: "member access updated" });
  } else {
    res.status(500).json({ message: "Could not update member" });
  }
};
