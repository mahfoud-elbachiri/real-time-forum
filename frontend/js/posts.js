// Posts module
import { showpopup, timeAgo } from '/frontend/js/utils.js';
import { checkSession } from '/frontend/js/auth.js';
import { fetchComments, createComment } from '/frontend/js/comments.js';
import { handleLike, handleDislike } from '/frontend/js/reactions.js';


const state = {
    filter: "all",
    category: null,
    sort: null, // "hot" for most liked
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

        let data = await response.json();
        if (data === null) {
            divpost.innerHTML = "<p>No posts found. Be the first to create a post!</p>";
            return;
        }


        if (state.sort === "hot") {
            data = data.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        }

        divpost.innerHTML = "";

        data.forEach((post) => {
            const formattedDate = timeAgo(post.created_at);

            const postElement = document.createElement("div");
            postElement.className = "post-item";
            postElement.dataset.postId = post.id;

            postElement.innerHTML = `
                <div class="vote-section">
                    <button class="vote-btn upvote ${post.user_liked ? 'active' : ''}" data-post-id="${post.id}">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 19V5M5 12l7-7 7 7"/>
                        </svg>
                    </button>
                    <span class="vote-count ${post.user_liked ? 'upvoted' : ''} ${post.user_disliked ? 'downvoted' : ''}">${(post.likes_count || 0) - (post.dislikes_count || 0)}</span>
                    <button class="vote-btn downvote ${post.user_disliked ? 'active' : ''}" data-post-id="${post.id}">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12l7 7 7-7"/>
                        </svg>
                    </button>
                </div>
                <div class="post-body">
                    <div class="post-header">
                        <h2 class="post-title">${post.title}</h2>
                        <span class="category-tag">${post.category}</span>
                    </div>
                    <div class="post-content">
                        <pre>${post.content}</pre>
                    </div>
                    <div class="post-meta">
                        <span class="post-author">Posted by <strong>u/${post.author}</strong></span>
                        <span class="post-date">${formattedDate}</span>
                        <button class="comment-toggle" data-post-id="${post.id}">💬 Comments</button>
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
            const upvoteBtn = postElement.querySelector(".upvote");
            upvoteBtn.addEventListener("click", () => {
                handleLike(postElement, post.id);
            });

            // Dislike button listener
            const downvoteBtn = postElement.querySelector(".downvote");
            downvoteBtn.addEventListener("click", () => {
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

function filterCategory(category) {
    toggleState("category", category, null);
}

// Dropdown toggle
function toggleSortDropdown() {
    const menu = document.getElementById('sort-dropdown-menu');
    menu.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.sort-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        const menu = document.getElementById('sort-dropdown-menu');
        if (menu) menu.classList.remove('show');
    }
});

// Sort options mapping
const sortOptions = {
    latest: { icon: '🕐', label: 'Latest', filter: 'all', sort: null },
    hot: { icon: '🔥', label: 'Hot', filter: 'all', sort: 'hot' },
    my: { icon: '📝', label: 'My Posts', filter: 'my', sort: null },
    rising: { icon: '📈', label: 'Rising', filter: 'liked', sort: null }
};

function setSort(sortKey) {
    const option = sortOptions[sortKey];
    if (!option) return;

    state.filter = option.filter;
    state.sort = option.sort;
    state.currentSortKey = sortKey;

    // Update dropdown button display
    const iconSpan = document.getElementById('current-sort-icon');
    const labelSpan = document.getElementById('current-sort-label');
    if (iconSpan) iconSpan.textContent = option.icon;
    if (labelSpan) labelSpan.textContent = option.label;

    // Close dropdown
    const menu = document.getElementById('sort-dropdown-menu');
    if (menu) menu.classList.remove('show');

    // Update active state in dropdown
    document.querySelectorAll('.sort-dropdown-menu button[data-sort]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === sortKey);
    });

    fetchPosts(state.filter, state.category);
    updateActiveButtons();
}

function buildPostsURL(filter, category) {
    const params = new URLSearchParams();

    if (filter && filter !== "all") params.set("filter", filter);
    if (category) params.set("category", category);

    return `/api/fetchposts?${params.toString()}`;
}

function updateActiveButtons() {
    document.querySelectorAll("[data-category]").forEach(btn => {
        btn.classList.toggle("filter-active", btn.dataset.category === state.category);
    });
}

window.filterPosts = setSort;
window.filterByCategory = filterCategory;
window.sortPosts = setSort;
window.toggleSortDropdown = toggleSortDropdown;
window.setSort = setSort;

window.createPost = createPost;
