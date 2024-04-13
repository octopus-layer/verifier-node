const crypto = require('crypto');

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const receiveListOfNodes = require('../../near/receiveListOfNodes');
const sendGossip = require('../../layer/sendGossip');
const settleNewNode = require('../../near/settleNewNode');

module.exports = async (req, res) => {
  if (!req.body || !req.body.new_node_key)
    return res.json({ success: false, error: 'bad_request' });

  const signatures = req.body.signatures && Array.isArray(req.body.signatures) ? req.body.signatures : [];

  const new_node_key_hash = crypto.createHash('sha256').update(req.body.new_node_key).digest('hex');

  try {
    const list_of_nodes_response = await receiveListOfNodes();

    if (!list_of_nodes_response.success)
      return list_of_nodes_response;
  
    const list_of_nodes = list_of_nodes_response.list_of_nodes;

    for (let i = 0; i < signatures.length; i++) {
      const { public_key, signature } = signatures[i];

      if (!list_of_nodes.includes(public_key) || !signature)
        return res.json({ success: false, error: 'bad_request' });

      const public_key_hash = crypto.createHash('sha256').update(public_key).digest('hex')

      const verifier = crypto.createVerify('sha256');
      verifier.update(new_node_key_hash);

      if (!verifier.verify(public_key_hash, signature, 'base64'))
        return res.json({ success: false, error: 'bad_signature' });
    };

    signatures.push(crypto.createSign('sha256').update(new_node_key_hash).sign(PRIVATE_KEY, 'base64'));

    if (signatures.length * 0.66 >= list_of_nodes.length) {
      const response = await settleNewNode(req.body.new_node_key, signatures);

      if (!response.success)
        return res.json(response);
    } else {
      const response = await sendGossip({
        type: 'add-node',
        new_node_key: req.body.new_node_key,
        signatures
      });

      if (!response.success)
        return res.json(response);
    };

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, error });
  };
}