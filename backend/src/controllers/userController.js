const db = require("./db");
const supertokens = require("supertokens-node");

const getUserData = async (userId) => {
  const [result] = await db.query("SELECT * FROM user WHERE userId = ?", [userId]);

  if (result[0]) {
    const userData = await supertokens.getUser(userId);
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

const createUser = async (req, res) => {
  const { username } = req?.body;
  let userId = req.session.getUserId();
  if (username) {
    try {
      const [result] = await db.query(
        "INSERT INTO user (userId, username, created_at) Values (?, ?, ?)",
        [userId, username, new Date()]
      );
      if (result.affectedRows == 1) {
        res.status(201).json({ message: "User Created successfully" });
      } else {
        res.status(400).json({ message: "something went wrong" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "please specify username" });
  }
};

const getUsers = async (req, res) => {
  try {
    const [result] = await db.query("SELECT userId FROM user");
    const users = await Promise.all(result.map(async (user) => await getUserData(user.userId)));
    res.json({ results: users });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

const getOwnUser = async (req, res) => {
  let userId = req.session.getUserId();
  const user = await getUserData(userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

module.exports = { createUser, getUsers, getOwnUser };
