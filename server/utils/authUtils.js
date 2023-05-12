import jwt from "jsonwebtoken";

// to keep logged in info
export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isItanimulli: user.isItanimulli,
      isMaster: user.isMaster,
      isAlly: user.isAlly,
      isBrand: user.isBrand,
      isViewer: user.isViewer,
      defaultWallet: user.defaultWallet,
      createdAt: user.createdAt,
    },
    process.env.ACCESS_TOKEN_JWT_SECRET || "mysecretkey",
    {
      expiresIn: "100h",
    }
  );
};

// to authenticate user
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization || req.body.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); //Bearer XXXXXXXX... (removes Bearer_ and gives token XXXXXXXXX...)
    // console.log("isAuth : ", token);
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_JWT_SECRET || "mysecretkey",
      (err, decode) => {
        if (err) {
          res.status(401).send({ message: "Please Signin Again to continue" });
        } else {
          req.user = decode;
          next();
          return;
        }
      }
    );
  } else {
    return res.status(401).send({ message: "Sign in issue" });
  }
};

// admin

export const isItanimulli = (req, res, next) => {
  if (req.user && req.user.isItanimulli) {
    next();
  } else {
    res.status(401).send({
      message: 'Please contact moderators for "MASTER" access',
    });
  }
};

// master

export const isMaster = (req, res, next) => {
  if (req.user && req.user.isMaster) {
    next();
  } else {
    res.status(401).send({
      message: "Not a master",
    });
  }
};

// Ally

export const isAlly = (req, res, next) => {
  if (req.user && req.user.isAlly) {
    next();
  } else {
    res.status(401).send({
      message: "Not an ally",
    });
  }
};

// Brand

export const isBrand = (req, res, next) => {
  if (req.user && req.user.isBrand) {
    next();
  } else {
    res.status(401).send({
      message: "Not a brand",
    });
  }
};

// Commissioner

export const isCommissioner = (req, res, next) => {
  if (req.user && req.user.isCommissioner) {
    next();
  } else {
    res.status(401).send({
      message: "Not a commissioner",
    });
  }
};
