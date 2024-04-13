const { createHash } = require('crypto');
const hash = createHash('sha256');

module.exports = data => {
  return hash.update(data).digest('base64');
};