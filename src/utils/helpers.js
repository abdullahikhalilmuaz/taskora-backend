const cleanUser = (u) => {
  if (!u) return null;
  const obj = u.toObject ? u.toObject() : u;
  delete obj.password;
  return obj;
};

module.exports = { cleanUser };
