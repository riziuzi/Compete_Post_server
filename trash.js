const jwt = require('jsonwebtoken');

const authorizeUser = (token) => {

      const decoded = jwt.verify(token, 'Random string'); // replace 'your_secret_key' with your actual secret key
      console.log(decoded)   
  };

  authorizeUser("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VySWQxIiwiaWQiOiI2NThiMWY1ZTI3MzMwOGQ2N2JiMmJmMGMiLCJpYXQiOjE3MDM2NTk4MTcsImV4cCI6MTcwMzc0NjIxN30.oT9OBGA6knSNcnyY1JU0LT9LD8AHkFFOrYVwSoN2veE")