const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')

async function verify(user) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        secure: true,
        port: 465,
        auth: {
            user: 'alanshirkapps@zohomail.com', 
            pass: EMAIL_PASS
        }
    })
    
    const token = jwt.sign({
            data: 'Token Data'
        }, JWT_SECRET, { expiresIn: '10m' }
    )
    
    const mailConfigurations = {
    
        from: 'alanshirkapps@zohomail.com',
    
        to: user.username,
    
        subject: 'Bloom Email Verification',
        
        text: `Please click this link to verify your email
            http://localhost:3000/verify/${token}`     
    }
    
    transporter.sendMail(mailConfigurations, function(error, info){
        if (error) throw Error(error)
        console.log('Email Sent Successfully')
        console.log(info)
    })
}

module.exports.verify = verify