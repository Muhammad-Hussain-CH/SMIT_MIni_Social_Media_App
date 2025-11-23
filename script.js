
let posts = [];  // variables  (Global )
let users = [];
let currentUser = null;


init();


function init() {
    loadData();
    checkLogin();
    loadTheme();
}

// Load saved data form the local storage
function loadData() {
    const savedUsers = localStorage.getItem('smit_users');
    const savedPosts = localStorage.getItem('smit_posts');
    const savedUser = localStorage.getItem('smit_current_user');

    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    }
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
}

// Save  data to local  storageeee
function saveData() {
    localStorage.setItem('smit_users', JSON.stringify(users));
    localStorage.setItem('smit_posts', JSON.stringify(posts));
    if (currentUser) {
        localStorage.setItem('smit_current_user', JSON.stringify(currentUser));
    }
}

//Login & Signup
// Check if user is already logged in
function checkLogin() {
    if (currentUser) {
        showMainApp();
    }
}

// Show signup page
function showSignup() {
    document.getElementById('signupPage').style.display = 'flex';
    document.getElementById('loginPage').style.display = 'none';
}

// Show login page
function showLogin() {
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
}

// Handle signup
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    // Check if email already exists
    const emailExists = users.find(user => user.email === email);
    if (emailExists) {
        alert('This email is already registered! Please login.');
        return;
    }

    // Create new user
    const newUser = {
        name: name,
        email: email,
        password: password
    };

    users.push(newUser);
    saveData();
    
    alert('Account created successfully! Please login.');
    showLogin();
    document.getElementById('signupForm').reset();
});

// Handle login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Find user wth matching email and password
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        saveData();
        showMainApp();
        document.getElementById('loginForm').reset();
    } else {
        alert('Wrong email or password! Please try again.');
    }
});

// Show main app after login
function showMainApp() {
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userName').textContent = currentUser.name;
    showPosts();
}

// Logout user
function logout() {
    currentUser = null;
    localStorage.removeItem('smit_current_user');
    document.getElementById('mainApp').style.display = 'none';
    showLogin();
}


function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('smit_theme', isDark ? 'dark' : 'light');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('smit_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}



function createPost() {
    const text = document.getElementById('postText').value.trim();
    const imageUrl = document.getElementById('imageUrl').value.trim();

    if (!text) {
        alert('Please write something!');
        return;
    }

    // Create new post
    const newPost = {
        id: Date.now(),
        author: currentUser.email,  // Store email to identify author
        authorName: currentUser.name,
        text: text,
        imageUrl: imageUrl || null,
        likes: [],  // Array to store emails of users who liked
        timestamp: new Date().toISOString()
    };

    posts.unshift(newPost);
    saveData();
    
    // Clear inputs
    document.getElementById('postText').value = '';
    document.getElementById('imageUrl').value = '';
    
    showPosts();
}



function showPosts() {
    const feed = document.getElementById('feed');
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();

    // Filter posts by search
    let filteredPosts = posts.filter(post => 
        post.text.toLowerCase().includes(searchTerm)
    );

    if (filteredPosts.length === 0) {
        feed.innerHTML = '<div class="no-posts"><i class="fa-solid fa-inbox"></i> No posts found</div>';
        return;
    }

    // Create HTML for each post
    feed.innerHTML = filteredPosts.map(post => {
        const isAuthor = post.author === currentUser.email;
        const hasLiked = post.likes.includes(currentUser.email);
        const likeCount = post.likes.length;
        
        return `
            <div class="post">
                <div class="post-header">
                    <div class="post-author-info">
                        <div class="post-avatar">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div>
                            <div class="post-user">${post.authorName}</div>
                            <div class="post-time">${getTimeAgo(post.timestamp)}</div>
                        </div>
                    </div>
                </div>
                <div class="post-content">${post.text}</div>
                ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" onerror="this.style.display='none'">` : ''}
                <div class="post-actions-bar">
                    <button class="action-btn like-btn ${hasLiked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                        <i class="fa-solid fa-heart"></i> ${likeCount}
                    </button>
                    ${isAuthor ? `
                        <button class="action-btn edit-btn" onclick="openEditModal(${post.id})">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" onclick="openDeleteModal(${post.id})">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Convert timestamp to readable time
function getTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
    
    return date.toLocaleDateString();
}



function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    
    if (post) {
        // Check if user already liked
        const likedIndex = post.likes.indexOf(currentUser.email);
        
        if (likedIndex > -1) {
            // Unlike: remove user from likes array
            post.likes.splice(likedIndex, 1);
        } else {
            // Like: add user to likes array
            post.likes.push(currentUser.email);
        }
        
        saveData();
        showPosts();
    }
}



let postToDelete = null;

function openDeleteModal(postId) {
    postToDelete = postId;
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    postToDelete = null;
    document.getElementById('deleteModal').style.display = 'none';
}

function confirmDelete() {
    if (postToDelete) {
        posts = posts.filter(p => p.id !== postToDelete);
        saveData();
        showPosts();
        closeDeleteModal();
    }
}



let postToEdit = null;

function openEditModal(postId) {
    postToEdit = posts.find(p => p.id === postId);
    
    if (postToEdit) {
        document.getElementById('editText').value = postToEdit.text;
        document.getElementById('editImageUrl').value = postToEdit.imageUrl || '';
        document.getElementById('editModal').style.display = 'flex';
    }
}

function closeEditModal() {
    postToEdit = null;
    document.getElementById('editModal').style.display = 'none';
}

function saveEdit() {
    if (postToEdit) {
        const newText = document.getElementById('editText').value.trim();
        const newImageUrl = document.getElementById('editImageUrl').value.trim();
        
        if (!newText) {
            alert('Post cannot be empty!');
            return;
        }

        postToEdit.text = newText;
        postToEdit.imageUrl = newImageUrl || null;
        
        saveData();
        showPosts();
        closeEditModal();
    }
}



function searchPosts() {
    showPosts();
}


function sortPosts(type) {
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    
    if (type === 'latest') {
        posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (type === 'oldest') {
        posts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (type === 'likes') {
        posts.sort((a, b) => b.likes.length - a.likes.length);
    }

    saveData();
    showPosts();
}