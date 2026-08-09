function sanitizeUser(user) {
  const source = typeof user.toObject === "function" ? user.toObject() : user;

  return {
    id: String(source._id || source.id),
    name: source.name,
    email: source.email,
    role: source.role,
    preferredLocation: source.preferredLocation || null,
    notificationPreferences: source.notificationPreferences || {},
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

module.exports = sanitizeUser;
