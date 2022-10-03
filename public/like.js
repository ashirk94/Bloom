const likeBtn = document.getElementById('like-btn')

likeBtn.addEventListener('click', () => {
    const like = {'like': 1}
    fetch("http://localhost:3000/like", {
        method: 'post',
        body: like,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        return response.json()
    }).then((res) => {
        if (res.status === 201) {
            console.log("Post successfully created!")
        }
    }).catch((error) => {
        console.log(error)
    })
})

