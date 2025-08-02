const form = document.getElementById("reg-form");
const validation = document.getElementById("validation");
const success = document.getElementById("success");

//check password and username
let passRegex = /^(?=.*[0-9])[A-Za-z]\w{7,14}$/;
let unameRegex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const confirm = document.getElementById("confirm").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;
  if (
    password === confirm &&
    password.match(passRegex) &&
    username.match(unameRegex)
  ) {
    success.innerHTML = "Success!";
    form.submit();
  } else if (!username.match(unameRegex)) {
    validation.innerHTML = "Invalid email address";
  } else if (!password.match(passRegex)) {
    validation.innerHTML =
      "Password must be 7-14 characters in length and contain a digit";
  } else if (password !== confirm) {
    validation.innerHTML = "Password and password confirmation do not match";
  }
});

const passInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm");
const passIcon = document.getElementById("pass-checkbox");
const confirmIcon = document.getElementById("confirm-checkbox");

function showPassword() {
  if (passInput.type === "password") {
    passInput.type = "text";
    passIcon.src = "images/eye-regular.png";
  } else {
    passInput.type = "password";
    passIcon.src = "images/eye-slash-regular.png";
  }
}

function showConfirm() {
  if (confirmInput.type === "password") {
    confirmInput.type = "text";
    confirmIcon.src = "images/eye-regular.png";
  } else {
    confirmInput.type = "password";
    confirmIcon.src = "images/eye-slash-regular.png";
  }
}

// Initialize ranking functionality
document.addEventListener('DOMContentLoaded', function() {
    const interestItems = document.querySelectorAll('#step-3 .interest-item');
    const valueItems = document.querySelectorAll('#step-4 .value-item');
    
    const interestHiddenInputs = {
        1: document.getElementById('interest1'),
        2: document.getElementById('interest2'),
        3: document.getElementById('interest3'),
        4: document.getElementById('interest4'),
        5: document.getElementById('interest5')
    };
    
    const valueHiddenInputs = {
        1: document.getElementById('value1'),
        2: document.getElementById('value2'),
        3: document.getElementById('value3'),
        4: document.getElementById('value4'),
        5: document.getElementById('value5')
    };

    // Setup interest ranking functionality
    interestItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const rankSelect = item.querySelector('.rank-select');
        
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                const selectedCount = document.querySelectorAll('#step-3 input[name="interests"]:checked').length;
                if (selectedCount > 5) {
                    this.checked = false;
                    alert('You can select maximum 5 interests');
                    return;
                }
                
                item.classList.add('selected');
                rankSelect.disabled = false;
                
                // Auto-assign next available rank
                const usedRanks = Array.from(document.querySelectorAll('#step-3 .rank-select:enabled'))
                    .map(select => select.value)
                    .filter(value => value !== '');
                
                for (let i = 1; i <= 5; i++) {
                    if (!usedRanks.includes(i.toString())) {
                        rankSelect.value = i.toString();
                        break;
                    }
                }
            } else {
                item.classList.remove('selected');
                rankSelect.disabled = true;
                rankSelect.value = '';
            }
            updateInterestHiddenInputs();
        });

        rankSelect.addEventListener('change', function() {
            updateInterestHiddenInputs();
        });
    });

    // Setup value ranking functionality
    valueItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const rankSelect = item.querySelector('.rank-select');
        
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                const selectedCount = document.querySelectorAll('#step-4 input[name="values"]:checked').length;
                if (selectedCount > 5) {
                    this.checked = false;
                    alert('You can select maximum 5 values');
                    return;
                }
                
                item.classList.add('selected');
                rankSelect.disabled = false;
                
                // Auto-assign next available rank
                const usedRanks = Array.from(document.querySelectorAll('#step-4 .rank-select:enabled'))
                    .map(select => select.value)
                    .filter(value => value !== '');
                
                for (let i = 1; i <= 5; i++) {
                    if (!usedRanks.includes(i.toString())) {
                        rankSelect.value = i.toString();
                        break;
                    }
                }
            } else {
                item.classList.remove('selected');
                rankSelect.disabled = true;
                rankSelect.value = '';
            }
            updateValueHiddenInputs();
        });

        rankSelect.addEventListener('change', function() {
            updateValueHiddenInputs();
        });
    });

    function updateInterestHiddenInputs() {
        // Clear all hidden inputs
        Object.values(interestHiddenInputs).forEach(input => input.value = '');
        
        // Get all selected items with ranks
        const rankedItems = Array.from(document.querySelectorAll('#step-3 .interest-item.selected'))
            .map(item => ({
                interest: item.getAttribute('data-interest'),
                rank: parseInt(item.querySelector('.rank-select').value) || 999
            }))
            .filter(item => item.rank !== 999)
            .sort((a, b) => a.rank - b.rank);

        // Update hidden inputs based on ranks
        rankedItems.forEach((item) => {
            if (interestHiddenInputs[item.rank]) {
                interestHiddenInputs[item.rank].value = item.interest;
            }
        });
    }

    function updateValueHiddenInputs() {
        // Clear all hidden inputs
        Object.values(valueHiddenInputs).forEach(input => input.value = '');
        
        // Get all selected items with ranks
        const rankedItems = Array.from(document.querySelectorAll('#step-4 .value-item.selected'))
            .map(item => ({
                value: item.getAttribute('data-value'),
                rank: parseInt(item.querySelector('.rank-select').value) || 999
            }))
            .filter(item => item.rank !== 999)
            .sort((a, b) => a.rank - b.rank);

        // Update hidden inputs based on ranks
        rankedItems.forEach((item) => {
            if (valueHiddenInputs[item.rank]) {
                valueHiddenInputs[item.rank].value = item.value;
            }
        });
    }
});

function nextStep(step) {
    // Validate current step
    const currentStep = document.querySelector('.form-step.active');
    const inputs = currentStep.querySelectorAll('input[required]');
    let valid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            valid = false;
        }
    });
    
    // Special validation for interests and values (max 5)
    if (step === 4) {
        const checkedInterests = document.querySelectorAll('#step-3 input[name="interests"]:checked');
        const rankedCount = Object.values(document.querySelectorAll('#step-3 input[type="hidden"]')).filter(input => input.value !== '').length;
        
        if (checkedInterests.length === 0) {
            alert('Please select at least one interest');
            return;
        }
        if (checkedInterests.length !== rankedCount) {
            alert('Please assign ranks to all selected interests');
            return;
        }
    }
    
    if (currentStep.id === 'step-4') {
        const checkedValues = document.querySelectorAll('#step-4 input[name="values"]:checked');
        const rankedCount = Object.values(document.querySelectorAll('#step-4 input[type="hidden"]')).filter(input => input.value !== '').length;
        
        if (checkedValues.length === 0) {
            alert('Please select at least one value');
            return;
        }
        if (checkedValues.length !== rankedCount) {
            alert('Please assign ranks to all selected values');
            return;
        }
    }
    
    if (!valid) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Hide current step and show next
    currentStep.classList.remove('active');
    document.getElementById('step-' + step).classList.add('active');
}

function prevStep(step) {
    const currentStep = document.querySelector('.form-step.active');
    currentStep.classList.remove('active');
    document.getElementById('step-' + step).classList.add('active');
}

// Profile picture preview
document.getElementById('profile-pic-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('profile-pic-preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = '<img src="' + e.target.result + '" alt="Profile Preview">';
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
});

// Location functionality
document.getElementById('get-location-btn').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            document.getElementById('lat').value = position.coords.latitude;
            document.getElementById('lon').value = position.coords.longitude;
            document.getElementById('location-status').innerHTML = '✅ Location captured successfully!';
            document.getElementById('location-status').style.color = 'green';
        }, function() {
            document.getElementById('location-status').innerHTML = '❌ Unable to get location';
            document.getElementById('location-status').style.color = 'red';
        });
    } else {
        document.getElementById('location-status').innerHTML = '❌ Geolocation not supported';
        document.getElementById('location-status').style.color = 'red';
    }
});
