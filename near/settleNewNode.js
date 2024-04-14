const near = require('near-api-js');

const VERIFIER_CONTRACT_ID = process.env.VERIFIER_CONTRACT_ID;

module.exports = async (new_node_key, new_node_url, signatures) => {
  if (!new_node_key || !new_node_url || !signatures || !Array.isArray(signatures))
    return { success: false, error: 'bad_request' };

  try {
    const response = await near.connection.provider.query({
      request_type: 'call_function',
      finality: 'final',
      account_id: VERIFIER_CONTRACT_ID,
      method_name: 'addNode',
      args_base64: Buffer.from(JSON.stringify({
        public_key: new_node_key,
        url: new_node_url,
        signatures
      })).toString('base64')
    });

    if (response.error)
      return { success: false, error: response.error };

    return { success: true };
  } catch (_) {
    return { success: false, error: 'unknown_error' };
  }
}