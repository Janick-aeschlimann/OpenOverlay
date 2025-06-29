import db from "./db.js";
import SuperTokens from "supertokens-node";

import fs from "fs";
import path from "path";

const getUserData = async (userId) => {
  const [result] = await db.query("SELECT * FROM user WHERE userId = ?", [userId]);

  if (result[0]) {
    const userData = await SuperTokens.getUser(userId);
    return {
      userId: userId,
      username: result[0].username,
      email: userData.loginMethods[0]?.email,
      profile_picture: result[0].profile_picture,
      created_at: result[0].created_at,
    };
  } else {
    return null;
  }
};

export const createUser = async (req, res) => {
  const { username } = req?.body;
  const userId = req.session.getUserId();
  const filename = req.file?.filename || null;

  if (username) {
    const [userResult] = await db.query("SELECT * FROM user WHERE userId = ?", [userId]);
    if (userResult[0]) {
      if (filename) {
        deleteUpload(filename);
      }
      res.status(409).json({ message: "Userprofile already exists" });
    } else {
      const [usernameResult] = await db.query("SELECT * FROM user WHERE username = ?", [username]);
      if (usernameResult[0]) {
        if (filename) {
          deleteUpload(filename);
        }
        res.status(409).json({ message: "username taken" });
      } else {
        await db.query(
          "INSERT INTO user (userId, username, created_at, profile_picture) Values (?, ?, ?, ?)",
          [userId, username, new Date(), filename]
        );
        res.status(201).json({ message: "User Created successfully" });
      }
    }
  } else {
    res.status(400).json({ message: "Required Fields missing: { username }" });
  }
};

const deleteUpload = (filename) => {
  const fullPath = path.join(__dirname, "../..", "uploads", "profile-pictures", filename);
  fs.unlink(fullPath, (err) => {
    if (err) console.error("Failed to delete file:", err);
  });
};

export const getUsers = async (req, res) => {
  try {
    const [result] = await db.query("SELECT userId FROM user");
    const users = await Promise.all(result.map(async (user) => await getUserData(user.userId)));
    res.json({ results: users });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

export const getOwnUser = async (req, res) => {
  let userId = req.session.getUserId();
  const user = await getUserData(userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
