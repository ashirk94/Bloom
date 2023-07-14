const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')

async function verify(user) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        secure: true,
        port: 465,
        auth: {
            user: 'alanshirkapps@zohomail.com', 
            pass: process.env.EMAIL_PASS
        }
    })
    
    const token = jwt.sign({
            data: 'Token Data'
        }, process.env.JWT_SECRET, { expiresIn: '10m' }
    )
    
    const mailConfigurations = {
    
        from: 'alanshirkapps@zohomail.com',
    
        to: user.username,
    
        subject: 'Bloom Email Verification',
        
        text: `Please click this link to verify your email
        https://bloom-friend-finder.herokuapp.com/verify/${token}`     
    }
    
    transporter.sendMail(mailConfigurations, function(error, info){
        if (error) throw Error(error)
    })
}

module.exports.verify = verify