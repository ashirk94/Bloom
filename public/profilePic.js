//create image preview
window.onload = function () {
	const fileInput = document.getElementById('fileInput')
	const fileDisplayArea = document.getElementById('fileDisplayArea')

	fileInput.addEventListener('change', () => {
		const file = fileInput.files[0]
		const imageType = /image.*/

		if (file.type.match(imageType)) {
			const reader = new FileReader()

			reader.onload = () => {
				fileDisplayArea.innerHTML = ''

				const img = new Image()
				img.src = reader.result

				fileDisplayArea.appendChild(img)
			}

			reader.readAsDataURL(file)
		} else {
			fileDisplayArea.innerHTML = 'File not supported!'
		}
	})
}
