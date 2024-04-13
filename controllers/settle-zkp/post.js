const { Proof } = require('o1js');

const hash = require('../../utils/hash');
const sign = require('../../utils/sign');
const verify = require('../../utils/verify');

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const sendGossip = require('../../layer/sendGossip');

const getPublicInput = require('../../near/getPublicInput');
const getVerificationKey = require('../../near/getVerificationKey');
const settleZKP = require('../../near/settleZKP');
const receiveListOfNodes = require('../../near/receiveListOfNodes');

module.exports = async (req, res) => {
  if (!req.body || !req.body.proof || !req.body.application_key)
    return res.json({ success: false, error: 'bad_request' });

  const application_key = req.body.application_key;

  const signatures = req.body.signatures && Array.isArray(req.body.signatures) ? req.body.signatures : [];

  try {
    const proof = Proof.fromJSON(req.body.proof);
    const { verification_key_real } = await proof.verify();

    const public_input_response = await getPublicInput(application_key);
    if (!public_input_response.success) return res.json(public_input_response);
    const public_input = public_input_response.public_input;

    const verification_key_response = await getVerificationKey(application_key);
    if (!verification_key_response.success) return res.json(verification_key_response);
    const verification_key = verification_key_response.verification_key;

    if (proof.publicInput != public_input)
      return res.json({ success: false, error: 'bad_request' });

    if (verification_key_real != verification_key)
      return res.json({ success: false, error: 'bad_request' });

    const output = JSON.stringify(proof.publicOutput);

    const list_of_nodes_response = await receiveListOfNodes();

    if (!list_of_nodes_response.success)
      return list_of_nodes_response;
  
    const list_of_nodes = list_of_nodes_response.list_of_nodes;

    for (let i = 0; i < signatures.length; i++) {
      const { public_key, signature } = signatures[i];

      if (!list_of_nodes.includes(public_key) || !signature)
        return res.json({ success: false, error: 'bad_request' });

      if (!verify(output, public_key, signature))
        return res.json({ success: false, error: 'bad_signature' });
    };

    signatures.push({
      public_key: PUBLIC_KEY,
      signature: sign(output, PRIVATE_KEY)
    });

    if (signatures.length * 0.66 >= list_of_nodes.length) {
      const response = await settleZKP(verification_key, hash(output), signatures);

      if (!response.success)
        return res.json(response);
    } else {
      const response = await sendGossip({
        type: 'settle-zkp',
        proof: req.body.proof,
        application_key: req.body.application_key,
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