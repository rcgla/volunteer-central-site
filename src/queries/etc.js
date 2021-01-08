const DBVERSION = () => `query {
    dbInfo(field:"version") {
      value
    }
  }`;
  
  const DELETE_ALL_DATA = () => `mutation {
    deleteAllData(input:{}) {
      clientMutationId
    }
  }`;
  
  const DISABLE_TRIGGERS = () => `mutation {
    disableTriggers(input:{}) {
      clientMutationId
    }
  }`;
  
  const ENABLE_TRIGGERS = () => `mutation {
    enableTriggers(input:{}) {
      clientMutationId
    }
  }`;
  
  export { DBVERSION, DELETE_ALL_DATA, DISABLE_TRIGGERS, ENABLE_TRIGGERS };