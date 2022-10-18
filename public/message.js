const messageBtns = document.querySelectorAll('#message-btn')

//ajax post the message then remove the user's box
for (const messageBtn of messageBtns) {
    messageBtn.addEventListener('click', async () => {
        const id = likeBtn.dataset.id.toString()
        messageBtn.setAttribute('disabled', '')
        messageBtn.classList.add('btn-liked')
        likeBtn.innerHTML = 'Message Sent'
        
        //new logic for message
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


