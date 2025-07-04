import { hasOverlayAccess } from "./overlayController.js";

export const roomUpdate = async (req, res, next) => {
  console.log(`${req.params.room} updated`);
  res.sendStatus(200);
};

export const getDocumentPermission = async (req, res) => {
  const yroom = req.params.room;
  const yuserid = req.params.userid;
  // always access for testing
  const permission = await hasOverlayAccess(yroom, yuserid);

  res.json({
    yroom,
    yaccess: permission ? "rw" : null, // read and write access
    yuserid,
  });
};
