const near = require('near-api-js');

module.exports = async application_contract_id => {
  try {
    const response = await near.connection.provider.query({
      request_type: 'view_state',
      finality: 'final',
      account_id: application_contract_id,
      prefix_base64: '',
    });

    const values = response.result.values.map(each => {
      return {
        key: new Buffer(each.key, 'base64'),
        value: new Buffer(each.value, 'base64')
      }
    });

    if (!values.find(any => any.key == 'public_input'))
      return {
        success: false,
        error: 'bad_request'
      };

    return {
      success: true,
      public_input: JSON.parse(JSON.stringify(values.find(any => any.key == 'public_input').value))
    };
  } catch (error) {
    return {
      success: false,
      error
    }
  };
};
