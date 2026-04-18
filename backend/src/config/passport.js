import { Strategy as LocalStrategy } from "passport-local";
import Admin from "../models/Admin.js";

const configurePassport = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password"
      },
      async (email, password, done) => {
        try {
          const admin = await Admin.findOne({ email });

          if (!admin || admin.password !== password) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, {
            id: admin._id,
            email: admin.email,
            name: admin.name
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const admin = await Admin.findById(id).select("-password");

      if (!admin) {
        return done(null, false);
      }

      return done(null, admin);
    } catch (error) {
      return done(error);
    }
  });
};

export default configurePassport;
