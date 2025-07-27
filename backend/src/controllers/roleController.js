import db from "./db.js";
import { hasWorkspaceAccess, isWorkspaceOwner } from "./workspaceController.js";

const templates = {
  admin: ["admin.all"],
  editor: ["editor.all"],
  viewer: ["viewer.all"],
};

export const getRoleData = async (roleId) => {
  const [result] = await db.query("SELECT * FROM workspace_role WHERE roleId = ?", [roleId]);

  if (result[0]) {
    return result[0];
  } else {
    return null;
  }
};

export const getWorkspaceRoles = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.session.getUserId();

  if (!(await hasWorkspaceAccess(userId, workspaceId))) {
    return res.status(403).json({ message: "You dont have access to this workspace" });
  }

  const [roles] = await db.query("SELECT * FROM workspace_role WHERE workspaceId = ?", [
    workspaceId,
  ]);

  res.send(roles);
};

export const createWorkspaceRole = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.session.getUserId();
  const { name, template } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Missing required fields: { name, template? }" });
  }

  if (!(await isWorkspaceOwner(userId, workspaceId))) {
    return res
      .status(403)
      .json({ message: "You are not allowed to create roles for this workspace" });
  }

  if (template) {
    if (!templates[template]) {
      return res.status(404).json({ message: "Invalid template" });
    }
  }

  const [role] = await db.query("INSERT INTO workspace_role (workspaceId, name) VALUES (?, ?)", [
    workspaceId,
    name,
  ]);

  if (template) {
    const permissions = templates[template];
    if (permissions) {
      const roleId = role.insertId;
      const [result] = await db.query(
        "INSERT INTO role_permission (roleId, permission_key) VALUES ?",
        [permissions.map((p) => [roleId, p])]
      );
    }
  }

  res.status(201).json({ message: "Role created" });
};

export const deleteWorkspaceRole = async (req, res) => {
  const { workspaceId, roleId } = req.params;
  const userId = req.session.getUserId();

  if (!(await isWorkspaceOwner(userId, workspaceId))) {
    return res
      .status(403)
      .json({ message: "You are not allowed to delete roles from this workspace" });
  }

  const [role] = await db.query(
    "SELECT * FROM workspace_role WHERE roleId = ? AND workspaceId = ?",
    [roleId, workspaceId]
  );

  if (!role[0]) {
    return res.status(404).json({ message: "Role not found in this workspace" });
  }

  const [access] = await db.query("SELECT * FROM workspace_access WHERE roleId = ?", [roleId]);

  if (access[0]) {
    return res
      .status(409)
      .json({ message: "Role still in use, remove this role from all users first" });
  }

  const [result] = await db.query(
    "DELETE FROM workspace_role WHERE roleId = ? AND workspaceId = ?",
    [roleId, workspaceId]
  );

  if (result.affectedRows == 1) {
    res.json({ message: "Role deleted" });
  } else {
    res.status(500).json({ message: "Could not delete role" });
  }
};
