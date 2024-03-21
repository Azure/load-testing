/**
 * @author Charles Markovich
 * @summary  Check if JWT is expired
 * @description A global validator utility to share validation rules across all apps for a given project.
 * @public
 */

var jwtDecode = require('jwt-decode');

const isJwtExpired = (token) => {
  if (typeof(token) !== 'string' || !token) throw new Error('Invalid token provided');

  let isJwtExpired = false;
  const { exp } = jwtDecode(token);
  const currentTime = new Date().getTime() / 1000;

  if (currentTime > exp) isJwtExpired = true;

  return isJwtExpired;
}

module.exports.isJwtExpired = isJwtExpired;
