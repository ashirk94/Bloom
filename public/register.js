const form = document.getElementById('reg-form')
const validation = document.getElementById('validation')
const success = document.getElementById('success')

//check password and username
let passRegex = /^(?=.*[0-9])[A-Za-z]\w{7,14}$/
let unameRegex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/

form.addEventListener('submit', event => {
    event.preventDefault()
    const confirm = document.getElementById('confirm').value
    const password = document.getElementById('password').value
    const username = document.getElementById('username').value
    if (password === confirm && password.match(passRegex) && username.match(unameRegex)) {
        success.innerHTML = 'Success!'
        form.submit()      
    } else if(!username.match(unameRegex)) {
        validation.innerHTML = 'Invalid email address'
    } else if(!password.match(passRegex)) {
        validation.innerHTML = 'Password must be 7-14 characters in length and contain a digit'
    } else if(password !== confirm) {
        validation.innerHTML = 'Password and password confirmation do not match'
    }
})

const passInput = document.getElementById('password')
const confirmInput = document.getElementById('confirm')
const passIcon = document.getElementById('pass-checkbox')
const confirmIcon = document.getElementById('confirm-checkbox')

function showPassword() {
    if (passInput.type === 'password') {
        passInput.type = 'text'
        passIcon.src = 'images/eye-regular.png'
    } else {
        passInput.type = 'password'
        passIcon.src = 'images/eye-slash-regular.png'
    }
}

function showConfirm() {
    if (confirmInput.type === 'password') {
        confirmInput.type = 'text'
        confirmIcon.src = 'images/eye-regular.png'
    } else {
        confirmInput.type = 'password'
        confirmIcon.src = 'images/eye-slash-regular.png'
    }
}