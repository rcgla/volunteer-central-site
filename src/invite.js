import db from '../database.js';
import * as Q from '../queries/index.js';
import * as utils from 'utils.js';
import * as mail from '../mail.js';
import * as emails from '../emails.js';

async function inviteUser(userId, adminJwt) {
    // TODO write these queries and uncomment

    // let user = await db.query(Q.USERS.USER_EMAIL, {id: parseInt(userId)}, adminJwt);
    // let userEmail = user.data.data.user.login.email;
            
    // let result = await db.query(
    //     Q.AUTH.TEMPORARY_TOKEN,
    //     {
    //         input: {
    //             email: userEmail
    //         }
    //     });
    // let jwt = result.data.data.createTemporaryToken.jwtToken;
    // let token = utils.parseToken(jwt);
    // if (token) {
    //     let inviteUrl = process.env.MODE === 'LOCALDEV' ? 
    //         `http://localhost:${process.env.PORT}/accept-invitation?token=${jwt}`
    //         : 
    //         `http://vol.werock.la/accept-invitation?token=${jwt}`;
    //     await mail.sendEmail(userEmail, 
    //         emails.reinvite.subject, 
    //         emails.reinvite.text(inviteUrl), 
    //         emails.reinvite.html(inviteUrl));   
        
    //     await db.query(
    //         Q.CREATE_INVITATION, 
    //         { 
    //             input: {
    //                 invitation: {
    //                     userId: parseInt(userId)
    //                 }
    //             }
    //         },
    //         adminJwt);
    // }
    // else {
    //     console.log(`Could not create token for user with ID ${userId}`);
    // }
}

export {
    inviteUser
};