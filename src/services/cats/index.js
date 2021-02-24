const router = require("express").Router();
const { generateAccessToken, verifyAccess } = require("../authTools");
const fetch = require("node-fetch");

router.post("/", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) throw new Error("Provide token");
    let catjson;
    await fetch("https://cataas.com/cat?json=true")
      .then((res) => res.json())
      .then((json) => (catjson = json));

    const verifiedMaybe = await verifyAccess(token);

    verifiedMaybe === true
      ? res.status(200).send({ url: catjson.url })
      : res.status(401).send({ message: "token not authorized" });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      errorCode: "wrong_token",
    });
  }
});

module.exports = router;
