const jwt = require('jsonwebtoken');

const checkCountryIsolation = (req, res, next) => {
  const user = req.user;
  
  if (user.role === 'SUPER_ADMIN') {
    req.countryFilter = {};
  } else {
    req.countryFilter = { country_code: user.country_code };
  }
  next();
};

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send({ message: "No token provided!" });

  jwt.verify(token, process.env.JWT_SECRET || 'rasan_secret_key', (err, decoded) => {
    if (err) return res.status(401).send({ message: "Unauthorized!" });
    req.user = decoded;
    next();
  });
};

module.exports = { verifyToken, checkCountryIsolation };
