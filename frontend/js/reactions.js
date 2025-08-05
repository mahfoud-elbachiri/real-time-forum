
import { showpopup } from '/frontend/js/utils.js';

export async function handleLike(postElement, postId) {
    const upvoteBtn = postElement.querySelector(".upvote");
    const downvoteBtn = postElement.querySelector(".downvote");
    const voteCount = postElement.querySelector(".vote-count");

   
    if (downvoteBtn.classList.contains("active")) {
        await handleDislike(postElement, postId);
        return;
    }

    try {
        const response = await fetch('/api/like', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_id: postId }),
        });

        if (!response.ok) {
            throw new Error("Failed to like post");
        }

        const isLiked = upvoteBtn.classList.contains("active");

        if (isLiked) {
            // unlike
            upvoteBtn.classList.remove("active");
            voteCount.classList.remove("upvoted");
            voteCount.textContent = parseInt(voteCount.textContent) - 1;
        } else {
            // like
            upvoteBtn.classList.add("active");
            voteCount.classList.add("upvoted");
            voteCount.classList.remove("downvoted");
            voteCount.textContent = parseInt(voteCount.textContent) + 1;
        }
    } catch (error) {
        console.error("Error liking post:", error);
        showpopup("Error liking post", "error");
    }
}

export async function handleDislike(postElement, postId) {
    const upvoteBtn = postElement.querySelector(".upvote");
    const downvoteBtn = postElement.querySelector(".downvote");
    const voteCount = postElement.querySelector(".vote-count");

    // If currently liked, just undo the like (step 1 of 2)
    if (upvoteBtn.classList.contains("active")) {
        await handleLike(postElement, postId);
        return;
    }

    try {
        const response = await fetch('/api/dislike', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_id: postId }),
        });

        if (!response.ok) {
            throw new Error("Failed to dislike post");
        }

        const isDisliked = downvoteBtn.classList.contains("active");

        if (isDisliked) {
            // rremove dislike
            downvoteBtn.classList.remove("active");
            voteCount.classList.remove("downvoted");
            voteCount.textContent = parseInt(voteCount.textContent) + 1;
        } else {
            // dislike
            downvoteBtn.classList.add("active");
            voteCount.classList.add("downvoted");
            voteCount.classList.remove("upvoted");
            voteCount.textContent = parseInt(voteCount.textContent) - 1;
        }
    } catch (error) {
        console.error("Error disliking post:", error);
        showpopup("Error disliking post", "error");
    }
}
