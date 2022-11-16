const passInput = document.getElementById('password')
const passIcon = document.getElementById('pass-checkbox')

function showPassword() {
    if (passInput.type === 'password') {
        passInput.type = 'text'
        passIcon.src = 'images/eye-regular.svg'
    } else {
        passInput.type = 'password'
        passIcon.src = 'images/eye-slash-regular.svg'
    }
}