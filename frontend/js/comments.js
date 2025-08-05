// Comments module
import { showpopup, timeAgo } from '/frontend/js/utils.js';

export async function fetchComments(postId) {
    const commentsList = document.getElementById(`comments-list-${postId}`);

    if (!commentsList) return;

    commentsList.innerHTML = "<p>Loading comments...</p>";

    try {
        const response = await fetch(`/api/comments?post_id=${postId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "Failed to fetch comments");
        }

        const comments = await response.json();
        if (comments !== null) {
            if (comments.length === 0) {
                commentsList.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
                return;
            }

            commentsList.innerHTML = "";

            comments.forEach(comment => {
                const formattedDate = timeAgo(comment.created_at);

                const commentElement = document.createElement("div");
                commentElement.className = "comment-item";
                commentElement.innerHTML = `
                    <div class="comment-header">
                        <span class="comment-author">${comment.author}</span>
                        <span class="comment-date">${formattedDate}</span>
                    </div>
                    <div class="comment-content">
                        <pre>${comment.content}</pre>
                    </div>
                `;

                commentsList.appendChild(commentElement);
            });
        }
    } catch (error) {
        console.error("Error fetching comments:", error);
        commentsList.innerHTML = `<p>Error loading comments: ${error.message}</p>`;
    }
}

export async function createComment(postId) {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    if (!commentInput) return;

    const commentText = commentInput.value.trim();
    if (!commentText) {
        showpopup("Comment cannot be empty", "error");
        return;
    }

    try {
        const response = await fetch("/api/createcomment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                post_id: postId.toString(),
                content: commentText
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to submit comment");
        }

        commentInput.value = "";
        fetchComments(postId);
         
    } catch (error) {
        console.error("Error submitting comment:", error);
         
    }
}
