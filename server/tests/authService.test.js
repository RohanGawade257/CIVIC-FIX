const assert = require("node:assert/strict");
const test = require("node:test");
const { loginUser, registerUser } = require("../src/services/auth/authService");
const { hashPassword, verifyPassword } = require("../src/services/auth/passwordService");
const ApiError = require("../src/utils/ApiError");

test("registerUser creates a sanitized user with a hashed password", async () => {
  let createdRecord;
  const userModel = {
    async exists() {
      return null;
    },
    async create(record) {
      createdRecord = record;
      return {
        _id: "user-1",
        ...record,
        role: "USER",
        createdAt: new Date("2026-08-09T00:00:00.000Z"),
        updatedAt: new Date("2026-08-09T00:00:00.000Z"),
      };
    },
  };

  const user = await registerUser(
    {
      name: "Asha Citizen",
      email: "ASHA@example.com",
      password: "correct horse battery",
    },
    { userModel },
  );

  assert.equal(createdRecord.email, "asha@example.com");
  assert.notEqual(createdRecord.passwordHash, "correct horse battery");
  assert.equal(await verifyPassword("correct horse battery", createdRecord.passwordHash), true);
  assert.equal(user.email, "asha@example.com");
  assert.equal(user.role, "USER");
  assert.equal(user.passwordHash, undefined);
});

test("registerUser rejects duplicate emails", async () => {
  const userModel = {
    async exists() {
      return { _id: "existing-user" };
    },
  };

  await assert.rejects(
    registerUser(
      {
        name: "Asha Citizen",
        email: "asha@example.com",
        password: "correct horse battery",
      },
      { userModel },
    ),
    (error) => error instanceof ApiError && error.statusCode === 409 && error.code === "EMAIL_ALREADY_REGISTERED",
  );
});

test("loginUser returns a sanitized user for valid credentials", async () => {
  const passwordHash = await hashPassword("correct horse battery");
  let capturedQuery;
  let capturedSelection;
  const userModel = {
    findOne(query) {
      capturedQuery = query;

      return {
        async select(selection) {
          capturedSelection = selection;

          return {
            _id: "user-1",
            name: "Asha Citizen",
            email: "asha@example.com",
            passwordHash,
            role: "USER",
          };
        },
      };
    },
  };

  const user = await loginUser(
    {
      email: "ASHA@example.com",
      password: "correct horse battery",
    },
    { userModel },
  );

  assert.deepEqual(capturedQuery, { email: "asha@example.com" });
  assert.equal(capturedSelection, "+passwordHash");
  assert.equal(user.id, "user-1");
  assert.equal(user.passwordHash, undefined);
});

test("loginUser rejects invalid credentials with a generic error", async () => {
  const passwordHash = await hashPassword("correct horse battery");
  const userModel = {
    findOne() {
      return {
        async select() {
          return {
            _id: "user-1",
            name: "Asha Citizen",
            email: "asha@example.com",
            passwordHash,
            role: "USER",
          };
        },
      };
    },
  };

  await assert.rejects(
    loginUser(
      {
        email: "asha@example.com",
        password: "wrong password",
      },
      { userModel },
    ),
    (error) => error instanceof ApiError && error.statusCode === 401 && error.code === "INVALID_CREDENTIALS",
  );
});
