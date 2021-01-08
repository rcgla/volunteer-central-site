import nodemailer from 'nodemailer';

async function testEmail(emailAddress) {
    try {
        await sendEmail(
            emailAddress, 
            "Test message from RCGLAVC",
            "This is a test message from from RCGLAVC.",
            "<p>This is a test message from from RCGLAVC. </p>"
        );
        console.log("Message sent");
    }
    catch(err) {
        console.log("Error sending test email", err);
    };
}

async function sendEmail(toAddress, subject, messageBodyText, messageBodyHtml) {
    // can test locally with nodemailer server on port 1025
    let opts = process.env.NODE_ENV === 'production' ? 
        {
            host: process.env.MAILHOST,
            port: process.env.MAILPORT,
            secure: false, 
            auth: {
                user: process.env.MAILUSER,
                pass: process.env.MAILPASS
            }
        }
        :
        {
            host: 'localhost',
            port: 1025,
            secure: false, 
            tls: {
                rejectUnauthorized: false
            }
        };
    
    let transport = nodemailer.createTransport(opts);
    let info = await transport.sendMail({
        from: '"werock.la" <info@werock.la>',
        to: toAddress,
        subject: subject,
        text: messageBodyText,
        html: messageBodyHtml
    });    
}

export {
    sendEmail,
    testEmail
};

