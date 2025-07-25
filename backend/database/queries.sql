# Get Workspace with user Permission
SELECT 
  w.*,
  CASE
    WHEN w.ownerId = ? THEN 'owner'
    WHEN wa.userId = ? THEN wr.name
    ELSE NULL
  END AS access
FROM workspace w
LEFT JOIN workspace_role wr ON w.workspaceId = wr.workspaceId
LEFT JOIN workspace_access wa ON wr.roleId = wa.roleId AND wa.userId = ?
WHERE w.workspaceId = ?;



# Select Workspaces user has access to + role name
SELECT DISTINCT w.*, CASE WHEN w.ownerId = ? THEN 'owner' ELSE wr.name END AS access
FROM workspace w
LEFT JOIN workspace_role wr ON w.workspaceId = wr.workspaceId
LEFT JOIN workspace_access wa ON wr.roleId = wa.roleId
WHERE w.ownerId = ? OR wa.userId = ?;

#workspace members
SELECT 
  us.*, wr.name, wr.roleId
FROM workspace_role wr
INNER JOIN workspace_access wa ON wr.roleId = wa.roleId
INNER JOIN user us ON wa.userId = us.userId
WHERE wr.workspaceId = 1;