// scripts/PASSWORD.js
var password = null;
if (!password)
  throw new Error("Forgot to set db password in ~/scripts/PASSWORD.js.");
var PASSWORD_default = password;
export {
  PASSWORD_default as default
};
