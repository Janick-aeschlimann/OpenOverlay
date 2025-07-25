import db from "./db.js";

export const getWorkspaceData = async (workspaceId) => {
  const [result] = await db.query("SELECT * FROM workspace WHERE workspaceId = ?", [workspaceId]);
  if (result[0]) {
    return result[0];
  } else {
    return null;
  }
};

export const createWorkspace = async (req, res) => {
  const { name, slug, logo } = req?.body;
  let userId = req.session.getUserId();

  if (name && slug) {
    if (isValidSlug(slug)) {
      const [result] = await db.query("SELECT * FROM workspace WHERE slug = ?", [slug]);

      if (result[0]) {
        res.status(409).json({ message: "Slug already in use" });
      } else {
        try {
          await db.query("INSERT INTO workspace (name, slug, logo, ownerId) VALUES (?, ?, ?, ?)", [
            name,
            slug,
            logo,
            userId,
          ]);
          res.status(201).json({ message: "Workspace created" });
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "Something went wrong" });
        }
      }
    } else {
      res.status(400).json({ message: "Invalid slug format" });
    }
  } else {
    res.status(400).json({ message: "Missing required fields: {name, slug, ?logo}" });
  }
};

const isValidSlug = (slug) => {
  const basicCheck = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  const hasLetter = /[a-z]/.test(slug);
  return basicCheck && hasLetter;
};

export const getWorkspaceWithId = async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const userId = req.session.getUserId();

  const [result] = await db.query(
    `SELECT 
		  w.*,
		  CASE
		    WHEN w.ownerId = :userId THEN 'owner'
		    WHEN wa.userId = :userId THEN wr.name
		    ELSE NULL
		  END AS access
		FROM workspace w
		LEFT JOIN workspace_role wr ON w.workspaceId = wr.workspaceId
		LEFT JOIN workspace_access wa ON wr.roleId = wa.roleId AND wa.userId = :userId
		WHERE w.workspaceId = :workspaceId;`,
    { userId: userId, workspaceId: workspaceId }
  );
  if (result[0]) {
    if (result[0]?.access) {
      res.send(result[0]);
    } else {
      res.status(403).json({ message: "You Dont have access to this Workspace" });
    }
  } else {
    res.status(404).json({ message: "Workspace not found" });
  }
};

export const getWorkspaceWithSlug = async (req, res) => {
  const slug = req.params.slug;
  const userId = req.session.getUserId();

  const [result] = await db.query(
    `SELECT 
		  w.*,
		  CASE
		    WHEN w.ownerId = :userId THEN 'owner'
		    WHEN wa.userId = :userId THEN wr.name
		    ELSE NULL
		  END AS access
		FROM workspace w
		LEFT JOIN 
    (
      workspace_role wr
		  INNER JOIN workspace_access wa ON wr.roleId = wa.roleId AND wa.userId = :userId
    ) 
    ON w.workspaceId = wr.workspaceId
		WHERE w.slug = :slug;`,
    { userId: userId, slug: slug }
  );
  if (result[0]) {
    if (result[0].access) {
      res.send(result[0]);
    } else {
      res.status(403).json({ message: "You Dont have access to this Workspace" });
    }
  } else {
    res.status(404).json({ message: "Workspace not found" });
  }
};

export const getWorkspaces = async (req, res) => {
  const userId = req.session.getUserId();
  const [result] = await db.query(
    `SELECT DISTINCT w.*, CASE WHEN w.ownerId = :userId THEN 'owner' ELSE wr.name END AS access
			FROM workspace w
			LEFT JOIN 
      (
      workspace_role wr
		  INNER JOIN workspace_access wa ON wr.roleId = wa.roleId AND wa.userId = :userId
      ) 
      ON w.workspaceId = wr.workspaceId
			WHERE w.ownerId = :userId OR wa.userId = :userId;`,
    { userId: userId }
  );
  res.send(result);
};

export const getOwnedWorkspaces = async (req, res) => {
  const userId = req.session.getUserId();
  const [result] = await db.query("SELECT *, 'owner' AS access FROM workspace WHERE ownerId = ?", [
    userId,
  ]);
  res.send(result);
};

export const hasWorkspaceAccess = async (userId, workspaceId) => {
  const [result] = await db.query(
    `SELECT 
		  w.*,
		  CASE
		    WHEN w.ownerId = :userId THEN 'owner'
		    WHEN wa.userId = :userId THEN wr.name
		    ELSE NULL
		  END AS access
		FROM workspace w
		LEFT JOIN
    (
      workspace_role wr
		  INNER JOIN workspace_access wa ON wr.roleId = wa.roleId AND wa.userId = :userId
    )
    ON w.workspaceId = wr.workspaceId
		WHERE w.workspaceId = :workspaceId;`,
    { userId: userId, workspaceId: workspaceId }
  );
  if (result[0]) {
    if (result[0].access) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export const isWorkspaceOwner = async (userId, workspaceId) => {
  const [result] = await db.query(
    `SELECT 
		  w.*,
		  CASE
		    WHEN w.ownerId = :userId THEN 'owner'
		    WHEN wa.userId = :userId THEN wr.name
		    ELSE NULL
		  END AS access
		FROM workspace w
		LEFT JOIN
    (
      workspace_role wr
		  INNER JOIN workspace_access wa ON wr.roleId = wa.roleId AND wa.userId = :userId
    )
    ON w.workspaceId = wr.workspaceId
		WHERE w.workspaceId = :workspaceId;`,
    { userId: userId, workspaceId: workspaceId }
  );
  if (result[0]) {
    if (result[0].access == "owner") {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
