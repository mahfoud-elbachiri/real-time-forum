import { showError, clearErrors, showpopup, validateEmail } from '/frontend/js/error.js'
import { navigateTo } from '/frontend/js/pages.js'
import { getWebSocket } from '/frontend/js/wbs.js';
window.currentUser = null;
export async function Register() {
    clearErrors()
    const obj = {
        nickname: document.getElementById("nickname").value,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        age: Number(document.getElementById("age").value),
        gender: document.getElementById("gender").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

    const fields = {
        nickname: { value: obj.nickname, message: "Nickname is required." },
        age: { value: obj.age, condition: obj.age <= 7 || isNaN(obj.age), message: "Please enter a valid age." },
        firstName: { value: obj.firstName, message: "First name is required." },
        lastName: { value: obj.lastName, message: "Last name is required." },
        email: { value: obj.email, condition: !validateEmail(obj.email), message: "Please enter a valid email address." },
        password: { value: obj.password, condition: obj.password.length < 6, message: "Password must be at least 6 characters." }
    };

    let hasError = Object.keys(fields).some(field => {
        const { value, condition, message } = fields[field];
        if (!value || condition) {
            document.getElementById(field).value = "";
            showError(field, message);
            return true;
        }
        return false;
    });

    if (hasError) return;


    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj),
        });

        const result = await response.json();
        console.log("Response:", result);

        if (!response.ok) {
            throw new Error(result.message);
        }

        showpopup("Registered successfully!", "success");
        navigateTo("login")
    } catch (error) {
        console.error("Error:", error);
        showpopup(error.message, "error");
    }
}
export async function Login() {
    var obj2 = {
        email: document.querySelector("#user").value,
        password: document.querySelector("#password").value
    }

    if (!obj2.email || !obj2.password) {
        showpopup("Please fill in all fields");
        return;
    }
    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj2)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error("login ghalat");
        }

        showpopup("Login successful!", "success");
        navigateTo("/");

    } catch (error) {
        // console.log("Error:", error);
        showpopup(error.message, "error");
    }
}

export async function checkSession() {
    try {
        const response = await fetch("/checksession", {
            method: "GET",
            credentials: "include",
        });

        if (response.ok) {
            const data = await response.json();
            window.currentUser = data;
            return true;
        } else {
            window.currentUser = null;
            return false;
        }
    } catch (error) {
        console.error("Session check error:", error);
        return false;
    }
}

export async function logout() {
    try {
        const response = await fetch("/api/logout", {
            method: "POST"
        });

        if (response.ok) {
            showpopup("Logged out successfully", "success");
            const websocket = getWebSocket();
            websocket.close()
            // websocket = null 
        } else {
            const result = await response.json();
            throw new Error(result.message);
        }
    } catch (error) {

        showpopup(error.message, "error");
    } finally {
        // always navigate to login page after logout 
        navigateTo("login");
    }
}


export async function fetchPosts() {
    let islogg = checkSession()

    console.log("in fetch :", islogg.value);

    const divpost = document.querySelector(".post-feed");
    divpost.innerHTML = "<p>Loading posts...</p>";

    try {
        const response = await fetch("/api/fetchposts", {
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

        // Clear loading message
        divpost.innerHTML = "";

        // Create posts
        data.forEach((post) => {
            // Format the date
            const postDate = new Date(post.created_at);
            const formattedDate = postDate.toLocaleString();

            // Create the post element
            const postElement = document.createElement("div");
            postElement.className = "post-item";
            postElement.dataset.postId = post.id;

            // Create the post content HTML
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

            // Add event listener for comment toggle
            const commentToggle = postElement.querySelector(".comment-toggle");
            commentToggle.addEventListener("click", () => {
                const commentsSection = document.getElementById(`comments-${post.id}`);
                if (commentsSection.style.display === "none") {
                    commentsSection.style.display = "block";
                    // Fetch comments when the section is opened
                    fetchComments(post.id);
                } else {
                    commentsSection.style.display = "none";
                }
            });

            // Add event listener for comment submit button
            const commentSubmit = postElement.querySelector(".comment-submit");
            commentSubmit.addEventListener("click", () => {
                createcomment(post.id);
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

    document.querySelector(".cancel-post").addEventListener("click", closePoopup);
    document.getElementById("post-form").addEventListener("submit", submitPost);

    const checkboxes = document.querySelectorAll('input[name="category"]');
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
            checkboxes.forEach((cb) => {
                if (cb !== this) cb.checked = false;
            });
        });
    });

    // Check the first category by default
    checkboxes[0].checked = true;
}

export function closePoopup() {
    const popup = document.querySelector(".post-popup");
    if (popup) {
        popup.remove();
    }
}

export async function submitPost(event) {
    event.preventDefault();

    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;
    const checkboxes = document.querySelectorAll(
        'input[name="category"]:checked'
    );
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

        closePoopup();
        showpopup("Post created successfully!", "success");

        fetchPosts();
    } catch (error) {
        console.error("Error creating post:", error);
        showpopup(error.message || "Error creating post");
    }
}

window.createPost = function () {
    createPost();
};


export async function fetchComments(postId) {
    const commentsList = document.getElementById(`comments-list-${postId}`);

    if (!commentsList) return;

    commentsList.innerHTML = "<p>Loading comments...</p>";

    try {
        const response = await fetch(`/api/comments?post_id=${postId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include" // for the koki
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
                const commentDate = new Date(comment.created_at);
                const formattedDate = commentDate.toLocaleString();

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


export async function createcomment(postId) {
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

        showpopup("Comment added successfully", "success");
    } catch (error) {
        console.error("Error submitting comment:", error);
        showpopup(error.message, "error");
    }
}

//============================================================================
