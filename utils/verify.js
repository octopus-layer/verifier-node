const { createVerify, sign } = require('crypto');
const verify = createVerify('SHA256');

module.exports = (data, public_key, signature) => {
  verify.update(data);
  verify.end();
  return verify.verify(public_key, signature);
};