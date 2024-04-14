const fetch = require('node-fetch');

const receiveListOfNodes = require('../near/receiveListOfNodes');

const NODE_URL = process.env.NODE_URL;

module.exports = async data => {
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
      if (!data.new_node_key || !data.new_node_url || !data.signatures)
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
            new_node_url: data.new_node_url,
            signatures: data.signatures
          }
        });
      }

      return { success: true };
    } else if (data.type == 'settle-zkp') {
      if (!data.proof || !data.application_key || !data.signatures)
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
            application_key: data.application_key,
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
  } catch (error) {
    return { success: false, error };
  };
};
