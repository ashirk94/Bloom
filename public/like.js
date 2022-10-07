const likeBtns = document.querySelectorAll('#like-btn')

for (const likeBtn of likeBtns) {
    likeBtn.addEventListener('click', async () => {
        
        const like = JSON.stringify({count : 1})
        console.log(like)
        await fetch("/like/" + likeBtn.dataset.id.toString(), {
            method: 'post',
            body: like,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).catch((error) => {
            console.log(error)
        })
        //could ajax get user with likes instead of reload
        window.location.reload()
    })
}


