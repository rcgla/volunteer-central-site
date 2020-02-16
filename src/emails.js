module.exports = {
    
    reset: {
        subject: 'Password reset requested for RCGLA Volunteer Central',
        text: linkTokenUrl => `
Hello,

Someone has requested a password reset for this account on vol.werock.la. If it was not you, then please disregard this message.

To reset your password, paste this link into your browser:
${linkTokenUrl}.

Don't hesitate to contact us at info@werock.la with any questions.

Thanks,

Rock n' Roll Camp for Girls Los Angeles
werock.la
`,

        html: linkTokenUrl => `
<p>Hello,</p>

<p>Someone has requested a password reset for this account on  <a href="http://vol.werock.la">RCGLA Volunteer Central</a>.
If it was not you, then please disregard this message.</p>

<p><a href="${linkTokenUrl}">Reset your password</a></p>

<p>Don't hesitate to <a href="mailto:info@werock.la">contact us</a> with any questions.</p>

<p>Thanks,
<br/>
<span>Rock n' Roll Camp for Girls Los Angeles</span>
<br/>
<a href="http://werock.la">werock.la</a>
`
}
}