const express = require("express");
const router = express.Router();

const { verifySession } = require("supertokens-node/recipe/session/framework/express");

const {
  getWorkspaceWithId,
  getWorkspaceWithSlug,
  getWorkspaces,
  getOwnedWorkspaces,
  createWorkspace,
} = require("../controllers/workspaceController");

router.get("/", verifySession(), getWorkspaces);
router.get("/owned", verifySession(), getOwnedWorkspaces);
router.get("/id/:workspaceId", verifySession(), getWorkspaceWithId);
router.get("/slug/:slug", verifySession(), getWorkspaceWithSlug);
router.post("/create", verifySession(), createWorkspace);

module.exports = router;
