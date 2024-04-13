const { createSign } = require('crypto');
const sign = createSign('SHA256');

module.exports = (data, private_key) => {
  sign.update(data);
  sign.end();
  return sign.sign(private_key);
};