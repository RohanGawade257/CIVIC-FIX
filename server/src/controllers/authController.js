const { loginUser, registerUser } = require("../services/auth/authService");
const { clearAuthCookie, createAuthToken, setAuthCookie } = require("../services/auth/tokenService");

async function register(req, res) {
  const user = await registerUser(req.body);
  const token = createAuthToken(user);

  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    user,
    token,
  });
}

async function login(req, res) {
  const user = await loginUser(req.body);
  const token = createAuthToken(user);

  setAuthCookie(res, token);

  res.status(200).json({
    success: true,
    user,
    token,
  });
}

async function logout(_req, res) {
  clearAuthCookie(res);

  res.status(200).json({
    success: true,
  });
}

module.exports = {
  login,
  logout,
  register,
};
