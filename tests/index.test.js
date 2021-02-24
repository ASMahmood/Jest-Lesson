const server = require("../src/server");
const request = require("supertest")(server);
const mongoose = require("mongoose");

const UserSchema = require("../src/services/users/schema");
const {
  verifyAccess,
  generateAccessToken,
} = require("../src/services/authTools");
const UserModel = require("mongoose").model("User", UserSchema);

beforeAll((done) => {
  mongoose.connect(
    `${process.env.ATLAS_URL}/test`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log("Successfully connected to Atlas.");
      done();
    }
  );
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

// I: Testing a test

describe("Stage I: Testing tests", () => {
  it("should check that true is true", () => {
    expect(true).toBe(true);
  });

  it("should check that the /test endpoint is working correctly", async () => {
    const response = await request.get("/test");
    expect(response.status).toEqual(200);
    expect(response.body.message).not.toBeFalsy();
    expect(response.body.message).toEqual("Test success");
  });
});

// II: Testing user creation and login

describe("Stage II: testing user creation and login", () => {
  const validCredentials = {
    username: "luisanton.io",
    password: "password",
  };

  const invalidCredentials = {
    username: "luisanton.io",
  };

  const incorrectCredentials = {
    username: "luisanton.io",
    password: "incorrectPassword",
  };

  const validToken = "VALID_TOKEN";

  it("should return an id from a /users/register endpoint when provided with valid credentials", async () => {
    const response = await request
      .post("/users/register")
      .send(validCredentials);

    const { _id } = response.body;
    expect(_id).not.toBeFalsy();
    expect(typeof _id).toBe("string");

    const user = await UserModel.findById(_id);

    expect(user).toBeDefined();
  });

  it("should NOT return an id from a /users/register endpoint when provided with incorrect credentials", async () => {
    const response = await request
      .post("/users/register")
      .send(invalidCredentials);

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe("wrong_credentials");
  });

  it("should return a valid token when loggin in with correct credentials", async () => {
    // "VALID_TOKEN"
    const response = await request.post("/users/login").send(validCredentials); //

    const { token } = response.body;
    const verified = await verifyAccess(token);
    expect(verified).toBe(true);
  });

  it("should NOT return a valid token when loggin in with INCORRECT credentials", async () => {
    const response = await request
      .post("/users/login")
      .send(invalidCredentials);

    expect(response.status).toBe(400);

    const { token } = response.body;
    expect(token).not.toBeDefined();
  });

  it("should reject with a 401 error when logging in with INCORRECT credentials", async () => {
    const response = await request
      .post("/users/login")
      .send(incorrectCredentials);
    expect(response.status).toBe(401);
  });
});

// III: Testing protected endpoints

describe("Stage III: testint protected /cats endpoint", () => {
  const validToken = {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhlbGxvIiwiaWF0IjoxNjE0MTgxMjMzLCJleHAiOjE2MTQxODQ4MzN9.4qldef7SqzfSqEIrrgFnywbLAnFlo29q18LuIzMAHTI",
  };
  it("should return a 200 code when accepted", async () => {
    const response = await request.post("/cats/").send(validToken);
    expect(response.status).toBe(200);
  });
  it("should make sure that response.body.url is defined", async () => {
    const response = await request.post("/cats/").send(validToken);
    expect(response.body.url).toBeDefined();
  });
  it("should make sure that response.body.url is a string", async () => {
    const response = await request.post("/cats/").send(validToken);
    expect(typeof response.body.url).toBe("string");
  });
});
