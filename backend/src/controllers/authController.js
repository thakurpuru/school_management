export const login = (req, res) => {
  res.json({
    message: "Login successful",
    admin: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email
    }
  });
};

export const logout = (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  });
};

export const getCurrentAdmin = (req, res) => {
  if (!req.user) {
    return res.json({
      isAuthenticated: false,
      admin: null
    });
  }

  res.json({
    isAuthenticated: true,
    admin: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email
    }
  });
};
