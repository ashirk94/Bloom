const likeBtns = document.querySelectorAll("#like-btn");

//ajax post the like then remove the user's box
for (const likeBtn of likeBtns) {
  likeBtn.addEventListener("click", async () => {
    const id = likeBtn.dataset.id.toString();
    likeBtn.setAttribute("disabled", "");
    likeBtn.classList.add("btn-liked");
    likeBtn.innerHTML = "Accepted";
    const like = JSON.stringify({ count: 1 });

    await fetch("/like/" + id, {
      method: "post",
      body: like,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  });
}
