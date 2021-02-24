const router = require("express").Router();
const { generateAccessToken } = require("../authTools");
const UserSchema = require("./schema");
const UserModel = require("mongoose").model("User", UserSchema);

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new Error("Provide credentials");

    const user = new UserModel({ username, password });
    const { _id } = await user.save();

    res.status(201).send({ _id });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      errorCode: "wrong_credentials",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new Error("Provide credentials");

    const user = await UserModel.findOne({ username });
    const token = await generateAccessToken({ username: req.body.username });

    user.password === password
      ? res.status(200).send({ token: token })
      : res.status(401).send({ message: "No username/password match" });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      errorCode: "wrong_credentials",
    });
  }
});

module.exports = router;
