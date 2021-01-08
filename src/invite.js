import db from '../database.js';
import * as Q from '../queries/index.js';
import * as utils from 'utils.js';
import * as mail from '../mail.js';
import * as emails from '../emails.js';

async function inviteUser(userId, adminJwt) {
    let dbres = await db.query(Q.USERS.GET(), {id: parseInt(userId)}, adminJwt);
    if (!dbres.success) {
        throw new Error("inviteUser error");
    }
    let username = dbres.data.user.login.username;
    let userEmail = dbres.data.user.usersPrivateInfo.email;
    let result = await db.query(
        Q.AUTH.TEMPORARY_TOKEN(),
        {
            input: {
                username
            }
        });
    let jwt = result.data.data.createTemporaryToken.jwtToken;
    let token = utils.parseToken(jwt);
    if (token) {
        let inviteUrl = process.env.NODE_ENV === 'production' ? 
            `http://vol.werock.la/accept-invitation?token=${jwt}`
            : 
            `http://localhost:${process.env.PORT}/accept-invitation?token=${jwt}`;
        await mail.sendEmail(userEmail, 
            emails.reinvite.subject, 
            emails.reinvite.text(inviteUrl), 
            emails.reinvite.html(inviteUrl));   
        
        await db.query(
            Q.INVITATION.CREATE(), 
            { 
                input: {
                    invitation: {
                        userId: parseInt(userId)
                    }
                }
            },
            adminJwt);
    }
    else {
        console.log(`Could not create token for user with ID ${userId}`);
    }
}

export {
    inviteUser
};