
const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Query {
    user: {
        id: ID
        bankAccounts: Object
        identity: {
            dateOfBirth: String
            email: String
            familyName: String
            
        }
    }
  }
`);

module.exports = schema;