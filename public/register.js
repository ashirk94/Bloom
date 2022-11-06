const form = document.getElementById('reg-form')
const validation = document.getElementById('validation')
const success = document.getElementById('success')

//check password and username
let passRegex = /^(?=.*[0-9])[A-Za-z]\w{7,14}$/
let unameRegex = /^[A-Za-z]\w{3,14}$/

form.addEventListener('submit', event => {
    event.preventDefault()
    const password = document.getElementById('password').value
    const username = document.getElementById('username').value
    if (password.match(passRegex) && username.match(unameRegex)) {
        success.innerHTML = 'Success!'
        form.submit()      
    } else if(!password.match(passRegex)) {
        validation.innerHTML = 'Password must be 7-14 characters in length and contain a digit'
    } else if(!username.match(unameRegex)) {
        validation.innerHTML = 'Username must be between 3-14 characters in length'
    }
})