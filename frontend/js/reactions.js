
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

        const upvoteBtn = postElement.querySelector(".upvote");
        const downvoteBtn = postElement.querySelector(".downvote");
        const voteCount = postElement.querySelector(".vote-count");

        const isLiked = upvoteBtn.classList.contains("active");

        if (isLiked) {
            // Unlike
            upvoteBtn.classList.remove("active");
            voteCount.classList.remove("upvoted");
            voteCount.textContent = parseInt(voteCount.textContent) - 1;
        } else {
            // Like
            upvoteBtn.classList.add("active");
            voteCount.classList.add("upvoted");
            voteCount.classList.remove("downvoted");
            voteCount.textContent = parseInt(voteCount.textContent) + 1;

            // Remove dislike if exists
            if (downvoteBtn.classList.contains("active")) {
                downvoteBtn.classList.remove("active");
                voteCount.textContent = parseInt(voteCount.textContent) + 1;
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

        const upvoteBtn = postElement.querySelector(".upvote");
        const downvoteBtn = postElement.querySelector(".downvote");
        const voteCount = postElement.querySelector(".vote-count");

        const isDisliked = downvoteBtn.classList.contains("active");

        if (isDisliked) {
            // Remove dislike
            downvoteBtn.classList.remove("active");
            voteCount.classList.remove("downvoted");
            voteCount.textContent = parseInt(voteCount.textContent) + 1;
        } else {
            // Dislike
            downvoteBtn.classList.add("active");
            voteCount.classList.add("downvoted");
            voteCount.classList.remove("upvoted");
            voteCount.textContent = parseInt(voteCount.textContent) - 1;

            // Remove like if exists
            if (upvoteBtn.classList.contains("active")) {
                upvoteBtn.classList.remove("active");
                voteCount.textContent = parseInt(voteCount.textContent) - 1;
            }
        }
    } catch (error) {
        console.error("Error disliking post:", error);
        showpopup("Error disliking post", "error");
    }
}
