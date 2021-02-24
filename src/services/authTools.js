const jwt = require("jsonwebtoken");

const verifyAccess = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.ACCESS_SECRET, (err, decodedToken) => {
      if (err) rej(err);
      res("VALID_TOKEN");
    })
  );

const generateAccessToken = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" },
      (err, token) => {
        if (err) rej(err);
        res(token);
      }
    )
  );

module.exports = { verifyAccess, generateAccessToken };
