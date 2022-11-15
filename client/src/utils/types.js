/**
 * @typedef {Object} LoginForm
 * @property {string} emailOrNickname - User's email or Nickname
 * @property {password} password - User's password
 */

/**
 * Response returned by request to login when the request fails
 * 
 * @typedef {Object} LoginFormResponseFailure
 * @property {string}  message - Error message
 */


/**
 * Response returned by request to login when the request succeeds
 * 
 * @typedef {Object} LoginFormResponseSuccess
 * @property {string}  email - User's email address
 */

/**
 * @typedef {LoginFormResponseFailure | LoginFormResponseSuccess} LoginFormResponse
 */