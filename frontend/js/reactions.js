
import { showpopup } from '/frontend/js/utils.js';

export async function handleLike(postElement, postId) {
    try {
        const response = await fetch('/api/like', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_id: postId }),
        });

        if (!response.ok) {
            throw new Error("Failed to like post");
        }

        const likeBtn = postElement.querySelector(".like-btn");
        const dislikeBtn = postElement.querySelector(".dislike-btn");
        const likeCount = likeBtn.querySelector(".like-count");
        const dislikeCount = dislikeBtn.querySelector(".dislike-count");

        const isLiked = likeBtn.dataset.liked === "true";

        if (isLiked) {
            // Unlike
            likeBtn.classList.remove("active");
            likeBtn.dataset.liked = "false";
            likeCount.textContent = parseInt(likeCount.textContent) - 1;
        } else {
            // Like
            likeBtn.classList.add("active");
            likeBtn.dataset.liked = "true";
            likeCount.textContent = parseInt(likeCount.textContent) + 1;

            // Remove dislike if exists
            if (dislikeBtn.dataset.disliked === "true") {
                dislikeBtn.classList.remove("active");
                dislikeBtn.dataset.disliked = "false";
                dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
            }
        }
    } catch (error) {
        console.error("Error liking post:", error);
        showpopup("Error liking post", "error");
    }
}

export async function handleDislike(postElement, postId) {
    try {
        const response = await fetch('/api/dislike', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_id: postId }),
        });

        if (!response.ok) {
            throw new Error("Failed to dislike post");
        }

        const likeBtn = postElement.querySelector(".like-btn");
        const dislikeBtn = postElement.querySelector(".dislike-btn");
        const likeCount = likeBtn.querySelector(".like-count");
        const dislikeCount = dislikeBtn.querySelector(".dislike-count");

        const isDisliked = dislikeBtn.dataset.disliked === "true";

        if (isDisliked) {
           
            dislikeBtn.classList.remove("active");
            dislikeBtn.dataset.disliked = "false";
            dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
        } else {
           
            dislikeBtn.classList.add("active");
            dislikeBtn.dataset.disliked = "true";
            dislikeCount.textContent = parseInt(dislikeCount.textContent) + 1;

           
            if (likeBtn.dataset.liked === "true") {
                likeBtn.classList.remove("active");
                likeBtn.dataset.liked = "false";
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
            }
        }
    } catch (error) {
        console.error("Error disliking post:", error);
        showpopup("Error disliking post", "error");
    }
}
