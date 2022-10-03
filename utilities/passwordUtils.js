const bcrypt = require('bcrypt')

//hash password with bcrypt
async function genPassword(password) {
    const hash = await bcrypt.hash(password, 10)

    return hash
}

async function validPassword(password, hash) {
    let hashVerify = await bcrypt.compare(password, hash)
    return hashVerify
}

module.exports.validPassword = validPassword
module.exports.genPassword = genPassword