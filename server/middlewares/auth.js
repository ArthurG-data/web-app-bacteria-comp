const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');

const {fetchLoginSecret} = require('./secretManager');

const authenticateCookie = (req, res, next) => {
   // Check to see if the cookie has a token
   console.log(req.path)
   if (req.path.startsWith('/styles.css') || req.path.startsWith('/assets/')) {
      return next();
   }

   const token = req.cookies.token;

   if (!token) {
      console.log("Cookie auth token missing.");
      return res.redirect("/login");
   }

   // Check that the token is valid
   try {
      const user = jwt.verify(token, userManagement.secret);

      console.log(
         `Cookie token verified for user: ${user.username} at URL ${req.url}`
      );

      // Add user info to the request for the next handler
      req.user = user;
      next();
   } catch (err) {
      console.log(
         `JWT verification failed at URL ${req.url}`,
         err.name,
         err.message
      );
      return res.redirect("/login");
   }
};

// Middleware to verify a token and respond with user information
const authenticateToken = async (req, res, next) => {
   try{
   const tokenSecret = await fetchLoginSecret();
   // Assume we are using Bearer auth.  The token is in the authorization header.
   const authHeader = req.headers["authorization"];
   const token = authHeader && authHeader.split(" ")[1]
   if (!token) {
      console.log("JSON web token missing.");
      return res.sendStatus(401);
   }

   // Check that the token is valid

      const user = jwt.verify(token, tokenSecret);

      console.log(
         `authToken verified for user: ${user.username} at URL ${req.url}`
      );

      // Add user info to the request for the next handler
      req.user = user;
      next();
   } catch (err) {
      console.log(
         `JWT verification failed at URL ${req.url}`,
         err.name,
         err.message
      );
      return res.sendStatus(401);
   }
};

module.exports = {authenticateCookie, authenticateToken };
