const likeBtns = document.querySelectorAll('#like-btn')

for (const likeBtn of likeBtns) {
    likeBtn.addEventListener('click', async () => {
        const id = likeBtn.dataset.id.toString()

        const text = document.getElementById(id)
        let count = parseInt(text.dataset.num)
        //would stop count increase by bringing in like data, instead remove the user box after like
        text.innerHTML = count + 1
        
        const like = JSON.stringify({count : 1})

        await fetch("/like/" + id, {
            method: 'post',
            body: like,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
    })
}


