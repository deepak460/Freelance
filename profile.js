
// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB221RejvHWwYHPbMF4-J5NaU6g0sdAjEI",
    authDomain: "freelanceflow-93fa9.firebaseapp.com",
    projectId: "freelanceflow-93fa9",
    storageBucket: "freelanceflow-93fa9.appspot.com",
    messagingSenderId: "296748017027",
    appId: "1:296748017027:web:677499aade0ad0188f82b6",
    measurementId: "G-C0GN3LHQ2G"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Cloudinary Configuration
const cloudinaryConfig = {
    cloudName: 'dhily4og7',
    uploadPreset: 'deepak',
    cropping: true,
    croppingAspectRatio: 1,
    croppingDefaultSelectionRatio: 1,
    croppingShowDimensions: true,
    sources: ['local', 'url', 'camera'],
    multiple: false,
    clientAllowedFormats: ['jpg', 'png', 'webp'],
    maxImageFileSize: 5000000, // 5MB
    styles: {
        palette: {
            window: '#FFFFFF',
            windowBorder: '#9078E3',
            tabIcon: '#9078E3',
            menuIcons: '#9078E3',
            textDark: '#333333',
            textLight: '#FFFFFF',
            link: '#9078E3',
            action: '#9078E3',
            inactiveTabIcon: '#777777',
            error: '#F44235',
            inProgress: '#9078E3',
            complete: '#20B832',
            sourceBg: '#F5F5F5'
        }
    }
};

// DOM Elements
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const profileAbout = document.getElementById('profileAbout');
const profileEmail = document.getElementById('profileEmail');
const profilePhone = document.getElementById('profilePhone');
const profileInstagram = document.getElementById('profileInstagram');
const profileLinkedIn = document.getElementById('profileLinkedIn');
const profilePicPreview = document.getElementById('profilePicPreview');
const uploadTrigger = document.getElementById('uploadTrigger');
const portfolioUrlPreview = document.getElementById('portfolioUrlPreview');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const previewPortfolioBtn = document.getElementById('previewPortfolioBtn');
const portfolioPreviewContainer = document.getElementById('portfolioPreviewContainer');

// Project related elements
const projectsList = document.getElementById('projectsList');
const projectTitle = document.getElementById('projectTitle');
const projectDescription = document.getElementById('projectDescription');
const projectVideoUrl = document.getElementById('projectVideoUrl');
const projectMediaPreview = document.getElementById('projectMediaPreview');
const addProjectBtn = document.getElementById('addProjectBtn');
const uploadImageBtn = document.getElementById('uploadImageBtn');

// Modal elements
const projectModal = document.getElementById('projectModal');
const openProjectModal = document.getElementById('openProjectModal');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Error elements
const errorElements = {
    profileName: document.getElementById('profileNameError'),
    profileUsername: document.getElementById('profileUsernameError'),
    profileAbout: document.getElementById('profileAboutError'),
    profileEmail: document.getElementById('profileEmailError')
};

// Global variables
let profileData = {};
let profileImageUrl = '';

// Initialize the page
function init() {
    auth.onAuthStateChanged(user => {
        if (user) {
            setupAuthState(user);
            loadProjects(user.uid);
        } else {
            window.location.href = 'dashboard.html';
        }
    });

    // Event listeners
    setupEventListeners();
}

function setupAuthState(user) {
    userName.textContent = user.displayName || 'User';
    userAvatar.src = user.photoURL || 'https://via.placeholder.com/150';

    loadProfileData(user.uid).catch(error => {
        console.error("Profile load error:", error);
        showToast("Error loading profile. Please refresh.", "error");
    });
}

function setupEventListeners() {
    logoutBtn.addEventListener('click', handleLogout);
    uploadTrigger.addEventListener('click', openCloudinaryWidget);
    saveProfileBtn.addEventListener('click', saveProfile);
    previewPortfolioBtn.addEventListener('click', previewPortfolio);
    profileUsername.addEventListener('input', updatePortfolioUrlPreview);
    
    // Project modal listeners
    openProjectModal.addEventListener('click', () => toggleModal(true));
    closeModalButtons.forEach(btn => btn.addEventListener('click', () => toggleModal(false)));
    uploadImageBtn.addEventListener('click', openProjectImageWidget);
    addProjectBtn.addEventListener('click', addProject);
    
    // Modal close handlers
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) toggleModal(false);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal.style.display === 'block') {
            toggleModal(false);
        }
    });
    
    // Delete project handler
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-project')) {
            const projectId = e.target.closest('.delete-project').dataset.id;
            if (confirm('Are you sure you want to delete this project?')) {
                try {
                    await db.collection('projects').doc(projectId).delete();
                    showToast('Project deleted successfully');
                    loadProjects(auth.currentUser.uid);
                } catch (error) {
                    console.error('Error deleting project:', error);
                    showToast('Error deleting project', 'error');
                }
            }
        }
    });
}

// Modal functions
function toggleModal(show) {
    if (show) {
        projectModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } else {
        projectModal.style.display = 'none';
        document.body.style.overflow = '';
        // Clear form when closing
        projectTitle.value = '';
        projectDescription.value = '';
        projectVideoUrl.value = '';
        projectMediaPreview.innerHTML = '';
        if (document.getElementById('projectImageUrl')) {
            document.getElementById('projectImageUrl').remove();
        }
    }
}

// Cloudinary config for projects
const cloudinaryProjectConfig = {
    ...cloudinaryConfig,
    folder: 'freelancer-projects',
    cropping: false,
    multiple: false
};

function openProjectImageWidget(e) {
    e.preventDefault();
    
    const widget = cloudinary.createUploadWidget(
        cloudinaryProjectConfig,
        (error, result) => {
            if (!error && result && result.event === "success") {
                projectMediaPreview.innerHTML = `
                    <img src="${result.info.secure_url}" class="media-preview">
                    <input type="hidden" id="projectImageUrl" value="${result.info.secure_url}">
                `;
            } else if (error) {
                console.error('Project image upload error:', error);
                showToast('Error uploading image. Please try again.', 'error');
            }
        }
    );
    
    widget.open();
}

async function addProject() {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const title = projectTitle.value.trim();
    const description = projectDescription.value.trim();
    const videoUrl = projectVideoUrl.value.trim();
    const imageUrl = document.getElementById('projectImageUrl')?.value;

    if (!title) {
        showToast('Project title is required', 'error');
        return;
    }

    if (!imageUrl && !videoUrl) {
        showToast('Please add either an image or video URL', 'error');
        return;
    }

    try {
        addProjectBtn.disabled = true;
        addProjectBtn.innerHTML = '<span class="spinner"></span> Adding...';

        const projectData = {
            title,
            description,
            imageUrl: imageUrl || '',
            videoUrl: videoUrl || '',
            userId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0,
            views: 0
        };

        // Add the project to Firestore
        await db.collection('projects').add(projectData);
        
        showToast('Project added successfully!');
        
        // Refresh the projects list
        await loadProjects(userId);
        
        // Close the modal and clear the form
        toggleModal(false);

    } catch (error) {
        console.error('Error adding project:', error);
        showToast('Error adding project. Please try again.', 'error');
    } finally {
        addProjectBtn.disabled = false;
        addProjectBtn.innerHTML = '<span class="material-icons btn-icon">add</span> Add Project';
    }
}

async function loadProjects(userId) {
    try {
        const querySnapshot = await db.collection('projects')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        if (querySnapshot.empty) {
            projectsList.innerHTML = '<p style="color: var(--text-light); text-align: center; margin-top: 1rem;">No projects added yet</p>';
            return;
        }

        // Clear existing projects
        projectsList.innerHTML = '';

        // Process each document
        querySnapshot.forEach(doc => {
            const project = {
                id: doc.id,
                ...doc.data()
            };
            const projectElement = createProjectElement(project);
            projectsList.appendChild(projectElement);
        });

    } catch (error) {
        console.error('Error loading projects:', error);
        showToast('Error loading projects', 'error');
        
        // Fallback without ordering if index isn't ready
        if (error.code === 'failed-precondition') {
            console.log('Retrying without ordering...');
            await loadProjectsWithoutOrdering(userId);
        }
    }
}

// Fallback function without ordering
async function loadProjectsWithoutOrdering(userId) {
    const querySnapshot = await db.collection('projects')
        .where('userId', '==', userId)
        .get();
    
    projectsList.innerHTML = '';
    querySnapshot.forEach(doc => {
        const project = {
            id: doc.id,
            ...doc.data()
        };
        const projectElement = createProjectElement(project);
        projectsList.appendChild(projectElement);
    });
}

function createProjectElement(project) {
    const projectItem = document.createElement('div');
    projectItem.className = 'project-item';
    projectItem.dataset.id = project.id; // Store project ID for deletion

    let mediaElement = '';
    if (project.imageUrl) {
        mediaElement = `<img src="${project.imageUrl}" class="project-media" alt="${project.title}">`;
    } else if (project.videoUrl) {
        const videoId = extractVideoId(project.videoUrl);
        if (videoId) {
            mediaElement = `
                <iframe src="https://www.youtube.com/embed/${videoId}" 
                        class="project-video" 
                        allowfullscreen></iframe>
            `;
        } else {
            mediaElement = `<div class="project-media" style="display: flex; align-items: center; justify-content: center; background: #f0f0f0;">
                <span class="material-icons" style="font-size: 3rem; color: var(--text-light);">link</span>
            </div>`;
        }
    }

    projectItem.innerHTML = `
        ${mediaElement}
        <div class="project-info">
            <h4 style="margin-bottom: 0.5rem;">${project.title}</h4>
            <p style="color: var(--text-light); font-size: 0.9rem;">${project.description || 'No description'}</p>
        </div>
        <div class="project-actions">
            <button class="delete-project" data-id="${project.id}">
                <span class="material-icons">delete</span>
            </button>
        </div>
    `;

    return projectItem;
}
function setupAuthState(user) {
    userName.textContent = user.displayName || 'User';
    userAvatar.src = user.photoURL || 'https://via.placeholder.com/150';

    loadProfileData(user.uid).catch(error => {
        console.error("Profile load error:", error);
        showToast("Error loading profile. Please refresh.", "error");
    });
    
    // Load projects when user is authenticated
    loadProjects(user.uid);
}

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

async function loadProfileData(userId) {
    try {
        const doc = await db.collection('websiteDetails').doc(userId).get();

        if (!doc.exists) {
            await initializeProfile(userId);
            return;
        }

        profileData = doc.data();
        populateFormFields(profileData);
        updatePortfolioUrlPreview();
        renderPortfolioPreview(profileData);

    } catch (error) {
        console.error("Firestore error:", error);
        throw error;
    }
}

async function initializeProfile(userId) {
    const defaultProfile = {
        name: "",
        username: "",
        about: "",
        email: auth.currentUser.email || "",
        phone: "",
        social: {
            instagram: "",
            linkedin: ""
        },
        profilePic: "",
        userId: userId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('websiteDetails').doc(userId).set(defaultProfile);
        profileData = defaultProfile;
        populateFormFields(profileData);
    } catch (error) {
        console.error("Init profile error:", error);
        throw error;
    }
}

function populateFormFields(data) {
    profileName.value = data.name || '';
    profileUsername.value = data.username || '';
    profileAbout.value = data.about || '';
    profileEmail.value = data.email || '';
    profilePhone.value = data.phone || '';
    profileInstagram.value = data.social?.instagram || '';
    profileLinkedIn.value = data.social?.linkedin || '';

    if (data.profilePic) {
        profileImageUrl = data.profilePic;
        profilePicPreview.src = data.profilePic;
    }
}

function updatePortfolioUrlPreview() {
    const username = profileUsername.value.trim().toLowerCase() || 'username';
    portfolioUrlPreview.textContent = `freelancerpro.com/${username.replace(/\s+/g, '-')}`;
}

function openCloudinaryWidget(e) {
    e.preventDefault();

    const widget = cloudinary.createUploadWidget(
        cloudinaryConfig,
        (error, result) => {
            if (!error && result && result.event === "success") {
                profileImageUrl = result.info.secure_url;
                profilePicPreview.src = profileImageUrl;
                showToast('Profile picture uploaded successfully!');
            } else if (error) {
                console.error('Cloudinary upload error:', error);
                showToast('Error uploading image. Please try again.', 'error');
            }
        }
    );

    widget.open();
}

function validateForm() {
    let isValid = true;

    // Clear previous errors
    Object.values(errorElements).forEach(el => {
        el.style.display = 'none';
    });

    // Validate each required field
    if (!profileName.value.trim()) {
        showError('profileName', 'Full name is required');
        isValid = false;
    }

    if (!profileUsername.value.trim()) {
        showError('profileUsername', 'Username is required');
        isValid = false;
    } else if (!/^[a-z0-9_-]+$/.test(profileUsername.value.trim())) {
        showError('profileUsername', 'Only lowercase letters, numbers, hyphens and underscores');
        isValid = false;
    }

    if (!profileAbout.value.trim()) {
        showError('profileAbout', 'About section is required');
        isValid = false;
    }

    if (!profileEmail.value.trim()) {
        showError('profileEmail', 'Email is required');
        isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(profileEmail.value.trim())) {
        showError('profileEmail', 'Invalid email format');
        isValid = false;
    }

    return isValid;
}

function showError(field, message) {
    if (errorElements[field]) {
        errorElements[field].textContent = message;
        errorElements[field].style.display = 'block';
    }
}

async function saveProfile() {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast("Authentication error. Please login again.", "error");
        return;
    }

    // Validate form
    if (!validateForm()) return;

    try {
        // Disable save button during operation
        saveProfileBtn.disabled = true;
        saveProfileBtn.innerHTML = '<span class="spinner"></span> Saving...';

        const updatedProfile = {
            name: profileName.value.trim(),
            username: profileUsername.value.trim().toLowerCase(),
            about: profileAbout.value.trim(),
            email: profileEmail.value.trim(),
            phone: profilePhone.value.trim(),
            social: {
                instagram: profileInstagram.value.trim(),
                linkedin: profileLinkedIn.value.trim()
            },
            profilePic: profileImageUrl || profileData.profilePic || '',
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            userId: userId
        };

        await db.collection('websiteDetails').doc(userId).set(updatedProfile, { merge: true });
        profileData = updatedProfile;

        showToast("Profile saved successfully!");
        renderPortfolioPreview(updatedProfile);

    } catch (error) {
        console.error("Save error:", error);
        showToast("Error saving profile: " + error.message, "error");

    } finally {
        saveProfileBtn.disabled = false;
        saveProfileBtn.innerHTML = '<span class="material-icons btn-icon">save</span> Save Profile';
    }
}

function previewPortfolio() {
    if (!profileData.name) {
        showToast("Please save your profile first", "error");
        return;
    }

    // Check if we have a username
    if (!profileData.username) {
        showToast("Please set a username first", "error");
        return;
    }

    // Open portfolio in new tab
    const portfolioUrl = `portfolio.html?username=${encodeURIComponent(profileData.username)}`;
    window.open(portfolioUrl, '_blank');
}

function renderPortfolioPreview(data) {
    portfolioPreviewContainer.innerHTML = `
        <div class="portfolio-header" style="text-align: center; margin-bottom: 2rem;">
            <img src="${data.profilePic || 'https://via.placeholder.com/150'}" 
                 alt="${data.name}" 
                 style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-color); margin-bottom: 1rem;">
            <h1 style="color: var(--primary-color); margin-bottom: 0.5rem;">${data.name}</h1>
            <p style="font-size: 1.2rem; color: var(--text-light); margin-bottom: 1.5rem;">${data.about}</p>
        </div>
        
        <div class="portfolio-contact" style="background-color: var(--card-bg); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
            <h2 style="margin-bottom: 1rem; color: var(--primary-color);">Contact Information</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <h3 style="font-size: 1rem; margin-bottom: 0.5rem; color: var(--text-light);">Email</h3>
                    <p>${data.email}</p>
                </div>
                <div>
                    <h3 style="font-size: 1rem; margin-bottom: 0.5rem; color: var(--text-light);">Phone</h3>
                    <p>${data.phone || 'Not provided'}</p>
                </div>
            </div>
        </div>
        
        <div class="portfolio-social" style="margin-bottom: 2rem;">
            <h2 style="margin-bottom: 1rem; color: var(--primary-color);">Social Links</h2>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                ${data.social?.instagram ? `
                    <a href="${ensureHttps(data.social.instagram)}" target="_blank" style="display: inline-flex; align-items: center; color: var(--primary-color); text-decoration: none; padding: 0.5rem 1rem; background-color: rgba(144, 120, 227, 0.1); border-radius: 6px;">
                        <span class="material-icons" style="margin-right: 8px;">camera_alt</span>
                        Instagram
                    </a>
                ` : ''}
                ${data.social?.linkedin ? `
                    <a href="${ensureHttps(data.social.linkedin)}" target="_blank" style="display: inline-flex; align-items: center; color: var(--primary-color); text-decoration: none; padding: 0.5rem 1rem; background-color: rgba(144, 120, 227, 0.1); border-radius: 6px;">
                        <span class="material-icons" style="margin-right: 8px;">work</span>
                        LinkedIn
                    </a>
                ` : ''}
                ${!data.social?.instagram && !data.social?.linkedin ? '<p>No social links provided</p>' : ''}
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 2rem;">
            <a href="dashboard.html" style="display: inline-block; padding: 0.75rem 1.5rem; background-color: var(--primary-color); color: white; text-decoration: none; border-radius: 6px; transition: background-color 0.3s;">
                Visit My Dashboard
            </a>
        </div>
    `;
}

function ensureHttps(url) {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url.replace('http://', 'https://');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="material-icons toast-icon">${type === 'success' ? 'check_circle' : 'error'}</span>
        ${message}
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function handleLogout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            console.error('Logout error:', error);
            showToast('Error during logout. Please try again.', 'error');
        });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', init);
