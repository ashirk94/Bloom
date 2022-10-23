const latInput = document.getElementById('lat')
const lonInput = document.getElementById('lon')

//update position
const successCallback = (position) => {
    latInput.value = position.coords.latitude
    lonInput.value = position.coords.longitude
}

const errorCallback = (error) => {
	console.log(error)
}

const position = navigator.geolocation.getCurrentPosition(successCallback, errorCallback)