const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    // const { token } = await authService.login(req.body);
    // res.json({ token });
    res.send('Login');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login
};
