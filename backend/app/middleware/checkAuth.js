const jwt = require("jsonwebtoken");
const Admin = require("mongoose").model("admin");

module.exports = (function () {
  const JWT_SECRET = process.env.JWT_SECRET;

  this.decodeTokenAndGetUser = async (token) => {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  };

  this.authMiddleware = async (req, res, next) => {
    const token = req.header("authorization");
    if (!token) {
      res.statusCode = 401;
      res.json({ success: false, message: "Please login!" });
      return;
    }
    try {
      const data = await this.decodeTokenAndGetUser(token);
      if (!data) {
        res.json({ success: false, message: "Please login again!" }, 401);
        return;
      }

      if (data.role === "admin") {
        req.user = await Admin.findById(data.id);
        req.user.role = data.role;
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  this.getToken = (id, email, role) => {
    return jwt.sign({ id, email, role }, JWT_SECRET, {
      expiresIn: "90 days",
    });
  };

  return this;
})();
