const bcrypt = require('bcrypt')

//hash password with bcrypt
async function genPassword(password) {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, 10)

    return {
        salt: salt,
        hash: hash
    }
}

async function validPassword(password, hash) {
    let hashVerify = await bcrypt.compare(password, hash)
    return hash === hashVerify
}

module.exports.validPassword = validPassword
module.exports.genPassword = genPassword