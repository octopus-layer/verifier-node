const fetch = require('node-fetch');

const receiveListOfNodes = require('./receiveListOfNodes');

const NODE_URL = process.env.NODE_URL;

module.exports = async (data) => {
  if (!data || typeof data != 'object')
    return {
      success: false,
      error: 'bad_request'
    };

  try {
    const list_of_nodes_response = await receiveListOfNodes();

    if (!list_of_nodes_response.success)
      return list_of_nodes_response;
  
    const list_of_nodes = list_of_nodes_response.list_of_nodes;
  
    if (data.type == 'add-node') {
      if (!data.new_node_key || !data.signatures)
        return {
          success: false,
          error: 'bad_request'
        };
  
      for (url in list_of_nodes) {
        if (url == NODE_URL) continue;
  
        await fetch(`${url}/add-node`, {
          method: 'POST',
          body: {
            new_node_key: data.new_node_key,
            signatures: data.signatures
          }
        });
      }

      return { success: true };
    } else if (data.type == 'settle-zkp') {
      if (!data.proof || !data.signatures)
        return {
          success: false,
          error: 'bad_request'
        };

      for (url in list_of_nodes) {
        if (url == NODE_URL) continue;

        await fetch(`${url}/settle-zkp`, {
          method: 'POST',
          body: {
            proof: data.proof,
            signatures: data.signatures
          }
        });
      }

      return { success: true };
    } else {
      return {
        success: false,
        error: 'bad_request'
      };
    };
  } catch (err) {
    return {
      success: false,
      error: 'unknown_error'
    };
  };
};
