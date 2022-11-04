const form = document.getElementById('reg-form')
const validation = document.getElementById('validation')
const success = document.getElementById('success')

//check password
let regex = /^(?=.*[0-9])[A-Za-z]\w{7,14}$/

form.addEventListener('submit', event => {
    event.preventDefault()
    const password = document.getElementById('password').value
    if (password.match(regex)) {
        success.innerHTML = 'Success!'
        form.submit()      
    } else {
        validation.innerHTML = 'Password must be 7-14 characters in length and contain a digit'
    }
})