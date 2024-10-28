const filterEmailOrMobileNumber = (username) => {
  if (username.includes('@')) {
    return { email: username };
  }

  return { mobileNumber: username };
};

module.exports = {
  filterEmailOrMobileNumber,
};
