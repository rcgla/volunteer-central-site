module.exports = {
    
    USERS: 
    `query {
        users {
          nodes {
            name
            login {
              email
            }
            bio
            phone
            address
            photoUrl
            participationsByUserId {
              nodes {
                role {
                  name
                }
                session {
                  name
                }
              }
            }
          }
        }
      }`
}