const near = require('near-api-js');

const VERIFIER_CONTRACT_ID = process.env.VERIFIER_CONTRACT_ID;

module.exports = async () => {
  try {
    const response = await near.connection.provider.query({
      request_type: 'view_state',
      finality: 'final',
      account_id: VERIFIER_CONTRACT_ID,
      prefix_base64: '',
    });

    const values = response.result.values.map(each => {
      return {
        key: new Buffer(each.key, 'base64'),
        value: new Buffer(each.value, 'base64')
      }
    });

    if (!values.list_of_nodes)
      return {
        success: false,
        error: 'unknown_error'
      };

    return {
      success: true,
      list_of_nodes: JSON.parse(JSON.stringify(values.list_of_nodes.value))
    };
  } catch (error) {
    return {
      success: false,
      error
    }
  };
};
