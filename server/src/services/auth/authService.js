const User = require("../../models/User");
const ApiError = require("../../utils/ApiError");
const sanitizeUser = require("../../utils/sanitizeUser");
const { loginSchema, registerSchema } = require("../../validators/authValidators");
const { hashPassword, verifyPassword } = require("./passwordService");

function invalidCredentialsError() {
  return new ApiError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
}

async function registerUser(input, dependencies = {}) {
  const userModel = dependencies.userModel || User;
  const data = registerSchema.parse(input);
  const existingUser = await userModel.exists({ email: data.email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.", "EMAIL_ALREADY_REGISTERED");
  }

  const passwordHash = await hashPassword(data.password);

  // Allow admin role if correct secret code is provided
  const adminSecret = process.env.ADMIN_SECRET_CODE;
  const role = adminSecret && input.adminCode && input.adminCode === adminSecret ? "ADMIN" : "USER";

  let preferredLocation = null;
  if (data.preferredLocation) {
    preferredLocation = {
      locality: data.preferredLocation.locality || "",
      point: {
        type: "Point",
        coordinates: data.preferredLocation.coordinates,
      },
    };
  }

  const user = await userModel.create({
    name: data.name,
    email: data.email,
    passwordHash,
    role,
    preferredLocation,
  });

  return sanitizeUser(user);
}

async function loginUser(input, dependencies = {}) {
  const userModel = dependencies.userModel || User;
  const data = loginSchema.parse(input);
  const user = await userModel.findOne({ email: data.email }).select("+passwordHash");

  if (!user || !user.passwordHash) {
    throw invalidCredentialsError();
  }

  const passwordMatches = await verifyPassword(data.password, user.passwordHash);

  if (!passwordMatches) {
    throw invalidCredentialsError();
  }

  return sanitizeUser(user);
}

module.exports = {
  loginUser,
  registerUser,
};
