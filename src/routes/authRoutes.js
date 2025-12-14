const express = require("express");
const bcrypt = require("bcryptjs");
const { getDbPool } = require("../config/db");

const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "No autenticado" });
  }
  next();
}

router.post("/login", async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;

    if (!email || !password) {
      return res.status(400).send("Correo y contraseña son obligatorios.");
    }

    const pool = getDbPool();
    const [rows] = await pool.query(
      "SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).send("Credenciales inválidas.");
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).send("Usuario inactivo. Contacta al administrador.");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).send("Credenciales inválidas.");
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      name: user.full_name,
      role: user.role
    };

    if (remember) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
    }

    return res.redirect("/app");
  } catch (err) {
    return next(err);
  }
});

router.get("/me", requireLogin, (req, res) => {
  const user = req.session.user;
  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName || user.name,
    name: user.name || user.fullName,
    role: user.role
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

module.exports = router;
