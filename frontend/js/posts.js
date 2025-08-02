// Posts module
import { showpopup } from '/frontend/js/utils.js';
import { checkSession } from '/frontend/js/auth.js';
import { fetchComments, createComment } from '/frontend/js/comments.js';
import { handleLike, handleDislike } from '/frontend/js/reactions.js';


const state = {
    filter: "all",
    category: null,
};

export async function fetchPosts(filter = "all", category = null) {
    let url = buildPostsURL(filter, category);

    const divpost = document.querySelector(".post-feed");
    divpost.innerHTML = "<p>Loading posts...</p>";

    try {
        const response = await fetch(url, {
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        if (data === null) {
            divpost.innerHTML = "<p>No posts found. Be the first to create a post!</p>";
            return;
        }

        divpost.innerHTML = "";

        data.forEach((post) => {
            const postDate = new Date(post.created_at);
            const formattedDate = postDate.toLocaleString();

            const postElement = document.createElement("div");
            postElement.className = "post-item";
            postElement.dataset.postId = post.id;

            postElement.innerHTML = `
                <div class="post-header">
                    <h2>${post.title}</h2>
                    <div class="post-meta">
                        <span class="post-author">Posted by: ${post.author}</span>
                        <span class="post-date">Date: ${formattedDate}</span>
                        <span class="post-category">Category: ${post.category}</span>
                    </div>
                </div>
                <div class="post-content">
                    <pre>${post.content}</pre>
                </div>
                <div class="post-actions">
                    <button class="comment-toggle" data-post-id="${post.id}">💬 Comments</button>
                    <button class="like-btn ${post.user_liked ? 'active' : ''}" data-post-id="${post.id}" data-liked="${post.user_liked}">
                        👍 <span class="like-count">${post.likes_count || 0}</span>
                    </button>
                    <button class="dislike-btn ${post.user_disliked ? 'active' : ''}" data-post-id="${post.id}" data-disliked="${post.user_disliked}">
                        👎 <span class="dislike-count">${post.dislikes_count || 0}</span>
                    </button>
                </div>
                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    <h3>Comments</h3>
                    <div class="comments-list" id="comments-list-${post.id}">
                        <p>Loading comments...</p>
                    </div>
                    <div class="add-comment">
                        <textarea class="comment" placeholder="Add your comment" id="comment-input-${post.id}"></textarea>
                        <button class="comment-submit" id="${post.id}">Submit</button>
                    </div>
                </div>
            `;

            divpost.appendChild(postElement);

            // Comment toggle listener
            const commentToggle = postElement.querySelector(".comment-toggle");
            commentToggle.addEventListener("click", () => {
                const commentsSection = document.getElementById(`comments-${post.id}`);
                if (commentsSection.style.display === "none") {
                    commentsSection.style.display = "block";
                    fetchComments(post.id);
                } else {
                    commentsSection.style.display = "none";
                }
            });

            // Comment submit listener
            const commentSubmit = postElement.querySelector(".comment-submit");
            commentSubmit.addEventListener("click", () => {
                createComment(post.id);
            });

            // Like button listener
            const likeBtn = postElement.querySelector(".like-btn");
            likeBtn.addEventListener("click", () => {
                handleLike(postElement, post.id);
            });

            // Dislike button listener
            const dislikeBtn = postElement.querySelector(".dislike-btn");
            dislikeBtn.addEventListener("click", () => {
                handleDislike(postElement, post.id);
            });
        });

    } catch (error) {
        console.error("Error fetching posts:", error);
        divpost.innerHTML = `<p>Error loading posts: ${error.message}</p>`;
        showpopup(error.message, "error");
    }
}

export function createPost() {
    const popup = document.createElement("div");
    popup.className = "post-popup";
    popup.innerHTML = `
        <div class="post-popup-content">
            <h2>Create New Post</h2>
            <form id="post-form">
                <input type="text" id="post-title" placeholder="Title" required>
                <textarea id="post-content" placeholder="Content" rows="4" required></textarea>
                
                <div class="categories">
                    <label><input type="checkbox" name="category" value="tech"> Tech</label>
                    <label><input type="checkbox" name="category" value="gaming"> Gaming</label>
                    <label><input type="checkbox" name="category" value="sports"> Sports</label>
                    <label><input type="checkbox" name="category" value="music"> Music</label>
                </div>
                
                <div class="form-buttons">
                    <button type="submit">Post</button>
                    <button type="button" class="cancel-post">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(popup);

    document.querySelector(".cancel-post").addEventListener("click", closePopup);
    document.getElementById("post-form").addEventListener("submit", submitPost);

    const checkboxes = document.querySelectorAll('input[name="category"]');
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
            checkboxes.forEach((cb) => {
                if (cb !== this) cb.checked = false;
            });
        });
    });

    checkboxes[0].checked = true;
}

export function closePopup() {
    const popup = document.querySelector(".post-popup");
    if (popup) {
        popup.remove();
    }
}

export async function submitPost(event) {
    event.preventDefault();

    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;
    const checkboxes = document.querySelectorAll('input[name="category"]:checked');
    let category = "";
    if (checkboxes.length > 0) {
        category = checkboxes[0].value;
    } else {
        category = "general";
    }

    if (!title || !content) {
        showpopup("Please fill in all fields");
        return;
    }

    try {
        const response = await fetch("/api/createpost", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, category }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        closePopup();
        showpopup("Post created successfully!", "success");
        fetchPosts();
    } catch (error) {
        console.error("Error creating post:", error);
        showpopup(error.message || "Error creating post");
    }
}

 


function toggleState(key, value, resetValue) {
    state[key] = state[key] === value ? resetValue : value;
    fetchPosts(state.filter, state.category);
    updateActiveButtons();
}

function filterPosts(type) {
    toggleState("filter", type, "all");
}

function filterCategory(category) {
    toggleState("category", category, null);
}


 function buildPostsURL(filter, category) {
    const params = new URLSearchParams();

    if (filter && filter !== "all") params.set("filter", filter);
    if (category) params.set("category", category);

    return `/api/fetchposts?${params.toString()}`;
}


function updateActiveButtons() {
    document.querySelectorAll("[data-filter]").forEach(btn => {
        btn.classList.toggle("filter-active", btn.dataset.filter === state.filter);
    });

    document.querySelectorAll("[data-category]").forEach(btn => {
        btn.classList.toggle("filter-active", btn.dataset.category === state.category);
    });
}


window.filterPosts = filterPosts;
window.filterByCategory = filterCategory;

window.createPost = createPost;
