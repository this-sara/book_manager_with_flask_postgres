// Admin CRUD Operations JavaScript - Complete Rewrite

// API Base URL
const API_BASE = '/api';

// Global state
let isLoading = false;
let currentEntity = '';
let currentEntityId = null;
let loadingModal = null;
let crudModal = null;

// Entity configurations
const entityConfigs = {
    book: {
        name: 'Book',
        endpoint: '/books/',
        fields: [
            { name: 'title', label: 'Title', type: 'text', required: true },
            { name: 'publication_year', label: 'Publication Year', type: 'number', min: 1000, max: new Date().getFullYear() + 5 },
            { name: 'isbn', label: 'ISBN', type: 'text' },
            { name: 'summary', label: 'Summary', type: 'textarea' },
            { name: 'cover_url', label: 'Cover URL', type: 'url' },
            { name: 'author_ids', label: 'Authors', type: 'multi-select', endpoint: '/authors/' },
            { name: 'category_ids', label: 'Categories', type: 'multi-select', endpoint: '/categories/' },
            { name: 'language_id', label: 'Language', type: 'select', endpoint: '/languages/' }
        ]
    },
    author: {
        name: 'Author',
        endpoint: '/authors/',
        fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'biography', label: 'Biography', type: 'textarea' },
            { name: 'birth_date', label: 'Birth Date', type: 'date' },
            { name: 'death_date', label: 'Death Date', type: 'date' },
            { name: 'image_url', label: 'Image URL', type: 'url' }
        ]
    },
    category: {
        name: 'Category',
        endpoint: '/categories/',
        fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' }
        ]
    },
    language: {
        name: 'Language',
        endpoint: '/languages/',
        fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'code', label: 'Language Code', type: 'text', pattern: '[a-z]{2}', placeholder: 'e.g., en, fr, es' }
        ]
    },
    user: {
        name: 'User',
        endpoint: '/users/',
        fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true, showOnEdit: false }
        ]
    }
};

// Load data functions
async function loadBooks() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        showLoading('Loading books...');
        const filter = document.getElementById('booksFilter').value;
        const search = document.getElementById('booksSearch').value;
        
        let url = `${API_BASE}/books/`;
        const params = new URLSearchParams();
        
        if (search) params.append('search', search);
        if (filter === 'no_cover') params.append('no_cover', 'true');
        if (filter === 'with_cover') params.append('with_cover', 'true');
        
        if (params.toString()) url += '?' + params.toString();
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const books = await response.json();
        
        displayBooks(books);
        hideLoading();
        isLoading = false;
    } catch (error) {
        console.error('Error loading books:', error);
        showToast('Error', `Failed to load books: ${error.message}`, 'error');
        hideLoading();
        isLoading = false;
    }
}

async function loadAuthors() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        showLoading('Loading authors...');
        const search = document.getElementById('authorsSearch').value;
        
        let url = `${API_BASE}/authors/`;
        if (search) url += `?search=${encodeURIComponent(search)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const authors = await response.json();
        
        displayAuthors(authors);
        hideLoading();
        isLoading = false;
    } catch (error) {
        console.error('Error loading authors:', error);
        showToast('Error', `Failed to load authors: ${error.message}`, 'error');
        hideLoading();
        isLoading = false;
    }
}

async function loadCategories() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        showLoading('Loading categories...');
        const search = document.getElementById('categoriesSearch').value;
        
        let url = `${API_BASE}/categories/`;
        if (search) url += `?search=${encodeURIComponent(search)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const categories = await response.json();
        
        displayCategories(categories);
        hideLoading();
        isLoading = false;
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Error', `Failed to load categories: ${error.message}`, 'error');
        hideLoading();
        isLoading = false;
    }
}

async function loadLanguages() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        showLoading('Loading languages...');
        const search = document.getElementById('languagesSearch').value;
        
        let url = `${API_BASE}/languages/`;
        if (search) url += `?search=${encodeURIComponent(search)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const languages = await response.json();
        
        displayLanguages(languages);
        hideLoading();
        isLoading = false;
    } catch (error) {
        console.error('Error loading languages:', error);
        showToast('Error', `Failed to load languages: ${error.message}`, 'error');
        hideLoading();
        isLoading = false;
    }
}

async function loadUsers() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        showLoading('Loading users...');
        const search = document.getElementById('usersSearch').value;
        
        let url = `${API_BASE}/users/`;
        if (search) url += `?search=${encodeURIComponent(search)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const users = await response.json();
        
        displayUsers(users);
        hideLoading();
        isLoading = false;
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Error', `Failed to load users: ${error.message}`, 'error');
        hideLoading();
        isLoading = false;
    }
}

async function loadCoversManagement() {
    try {
        showLoading('Loading books without covers...');
        
        const response = await fetch(`${API_BASE}/books/?no_cover=true`);
        const books = await response.json();
        
        displayBooksForCoverManagement(books);
        hideLoading();
    } catch (error) {
        console.error('Error loading books for cover management:', error);
        showToast('Error', 'Failed to load books for cover management', 'error');
        hideLoading();
    }
}

// Display functions
function displayBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    tbody.innerHTML = '';
    
    books.forEach(book => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>
                ${book.cover_url ? 
                    `<img src="${book.cover_url}" alt="Cover" class="cover-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="placeholder-cover" style="display:none;">No Cover</div>` :
                    `<div class="placeholder-cover">No Cover</div>`
                }
            </td>
            <td><strong>${book.title}</strong></td>
            <td>${(book.authors || []).map(a => a.name).join(', ') || 'No authors'}</td>
            <td>${book.publication_year || 'N/A'}</td>
            <td>${(book.categories || []).map(c => c.name).join(', ') || 'No categories'}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editEntity('book', ${book.id})" title="Edit">
                        <i class="icon icon-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteEntity('book', ${book.id}, '${book.title.replace(/'/g, "\\'")}')" title="Delete">
                        <i class="icon icon-trash"></i>
                    </button>
                </div>
            </td>
        `;
    });
}

function displayAuthors(authors) {
    const tbody = document.getElementById('authorsTableBody');
    tbody.innerHTML = '';
    
    authors.forEach(author => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>
                ${author.image_url ? 
                    `<img src="${author.image_url}" alt="Author" class="author-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="placeholder-author" style="display:none;">N/A</div>` :
                    `<div class="placeholder-author">N/A</div>`
                }
            </td>
            <td><strong>${author.name}</strong></td>
            <td>${author.book_count || 0} books</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editEntity('author', ${author.id})" title="Edit">
                        <i class="icon icon-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteEntity('author', ${author.id}, '${author.name.replace(/'/g, "\\'")}')" title="Delete">
                        <i class="icon icon-trash"></i>
                    </button>
                </div>
            </td>
        `;
    });
}

function displayCategories(categories) {
    const tbody = document.getElementById('categoriesTableBody');
    tbody.innerHTML = '';
    
    categories.forEach(category => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${category.name}</strong></td>
            <td>${category.book_count || 0} books</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editEntity('category', ${category.id})" title="Edit">
                        <i class="icon icon-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteEntity('category', ${category.id}, '${category.name.replace(/'/g, "\\'")}')" title="Delete">
                        <i class="icon icon-trash"></i>
                    </button>
                </div>
            </td>
        `;
    });
}

function displayLanguages(languages) {
    const tbody = document.getElementById('languagesTableBody');
    tbody.innerHTML = '';
    
    languages.forEach(language => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${language.name}</strong> ${language.code ? `(${language.code})` : ''}</td>
            <td>${language.book_count || 0} books</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editEntity('language', ${language.id})" title="Edit">
                        <i class="icon icon-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteEntity('language', ${language.id}, '${language.name.replace(/'/g, "\\'")}')" title="Delete">
                        <i class="icon icon-trash"></i>
                    </button>
                </div>
            </td>
        `;
    });
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = tbody.insertRow();
        const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
        row.innerHTML = `
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>${createdDate}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editEntity('user', ${user.id})" title="Edit">
                        <i class="icon icon-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteEntity('user', ${user.id}, '${user.name.replace(/'/g, "\\'")}')" title="Delete">
                        <i class="icon icon-trash"></i>
                    </button>
                </div>
            </td>
        `;
    });
}

function displayBooksForCoverManagement(books) {
    const tbody = document.getElementById('coversTableBody');
    tbody.innerHTML = '';
    
    books.forEach(book => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${book.title}</strong></td>
            <td>${(book.authors || []).map(a => a.name).join(', ') || 'No authors'}</td>
            <td>
                ${book.cover_url ? 
                    `<img src="${book.cover_url}" alt="Cover" class="cover-image">` :
                    `<div class="placeholder-cover">No Cover</div>`
                }
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-success" onclick="updateBookCover(${book.id})" title="Update Cover">
                        <i class="icon icon-refresh"></i> Update
                    </button>
                </div>
            </td>
        `;
    });
}

// Search functions
function searchBooks() {
    loadBooks();
}

function searchAuthors() {
    loadAuthors();
}

function searchCategories() {
    loadCategories();
}

function searchLanguages() {
    loadLanguages();
}

function searchUsers() {
    loadUsers();
}

// Modal and CRUD operations
async function openAddModal(entityType) {
    currentEntity = entityType;
    currentEntityId = null;
    
    const config = entityConfigs[entityType];
    const modal = new bootstrap.Modal(document.getElementById('crudModal'));
    
    document.getElementById('crudModalTitle').textContent = `Add ${config.name}`;
    
    const form = await buildForm(config, null);
    document.getElementById('crudForm').innerHTML = form;
    
    modal.show();
}

async function editEntity(entityType, id) {
    try {
        currentEntity = entityType;
        currentEntityId = id;
        
        const config = entityConfigs[entityType];
        
        // Fetch entity data
        const response = await fetch(`${API_BASE}${config.endpoint}/${id}`);
        const entity = await response.json();
        
        const modal = new bootstrap.Modal(document.getElementById('crudModal'));
        
        document.getElementById('crudModalTitle').textContent = `Edit ${config.name}`;
        
        const form = await buildForm(config, entity);
        document.getElementById('crudForm').innerHTML = form;
        
        modal.show();
    } catch (error) {
        console.error('Error loading entity for edit:', error);
        showToast('Error', 'Failed to load entity for editing', 'error');
    }
}

async function buildForm(config, entityData) {
    let html = '';
    
    for (const field of config.fields) {
        // Skip password field on edit
        if (field.showOnEdit === false && entityData) continue;
        
        const value = entityData ? (entityData[field.name] || '') : '';
        const required = field.required ? 'required' : '';
        
        html += `<div class="mb-3">`;
        html += `<label for="${field.name}" class="form-label">${field.label} ${field.required ? '<span class="text-danger">*</span>' : ''}</label>`;
        
        switch (field.type) {
            case 'textarea':
                html += `<textarea class="form-control" id="${field.name}" name="${field.name}" ${required}>${value}</textarea>`;
                break;
            case 'select':
                html += await buildSelectField(field, value);
                break;
            case 'multi-select':
                html += await buildMultiSelectField(field, value);
                break;
            default:
                const pattern = field.pattern ? `pattern="${field.pattern}"` : '';
                const placeholder = field.placeholder ? `placeholder="${field.placeholder}"` : '';
                const min = field.min ? `min="${field.min}"` : '';
                const max = field.max ? `max="${field.max}"` : '';
                html += `<input type="${field.type}" class="form-control" id="${field.name}" name="${field.name}" value="${value}" ${required} ${pattern} ${placeholder} ${min} ${max}>`;
        }
        
        html += `</div>`;
    }
    
    return html;
}

async function buildSelectField(field, selectedValue) {
    try {
        const response = await fetch(`${API_BASE}${field.endpoint}`);
        const options = await response.json();
        
        let html = `<select class="form-select" id="${field.name}" name="${field.name}">`;
        html += `<option value="">Select ${field.label}</option>`;
        
        options.forEach(option => {
            const selected = option.id == selectedValue ? 'selected' : '';
            html += `<option value="${option.id}" ${selected}>${option.name}</option>`;
        });
        
        html += `</select>`;
        return html;
    } catch (error) {
        console.error('Error building select field:', error);
        return `<input type="text" class="form-control" id="${field.name}" name="${field.name}" value="${selectedValue}" placeholder="Error loading options">`;
    }
}

async function buildMultiSelectField(field, selectedValues) {
    try {
        const response = await fetch(`${API_BASE}${field.endpoint}`);
        const options = await response.json();
        
        const selectedIds = Array.isArray(selectedValues) ? selectedValues.map(v => v.id || v) : 
                           selectedValues ? [selectedValues] : [];
        
        let html = `<select class="form-select" id="${field.name}" name="${field.name}" multiple size="4">`;
        
        options.forEach(option => {
            const selected = selectedIds.includes(option.id) ? 'selected' : '';
            html += `<option value="${option.id}" ${selected}>${option.name}</option>`;
        });
        
        html += `</select>`;
        html += `<small class="form-text text-muted">Hold Ctrl (Cmd on Mac) to select multiple options</small>`;
        
        return html;
    } catch (error) {
        console.error('Error building multi-select field:', error);
        return `<input type="text" class="form-control" id="${field.name}" name="${field.name}" value="${selectedValues}" placeholder="Error loading options">`;
    }
}

async function saveEntity() {
    try {
        const form = document.getElementById('crudForm');
        const formData = new FormData(form);
        const data = {};
        
        // Convert form data to object
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (multi-select)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Handle multi-select fields that might be empty
        const config = entityConfigs[currentEntity];
        config.fields.forEach(field => {
            if (field.type === 'multi-select' && !data[field.name]) {
                data[field.name] = [];
            }
        });
        
        const endpoint = `${API_BASE}${config.endpoint}${currentEntityId ? '/' + currentEntityId : ''}`;
        const method = currentEntityId ? 'PUT' : 'POST';
        
        showLoading(currentEntityId ? 'Updating...' : 'Creating...');
        
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save entity');
        }
        
        hideLoading();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('crudModal'));
        modal.hide();
        
        showToast('Success', `${config.name} ${currentEntityId ? 'updated' : 'created'} successfully!`, 'success');
        
        // Reload the appropriate data
        switch (currentEntity) {
            case 'book': loadBooks(); break;
            case 'author': loadAuthors(); break;
            case 'category': loadCategories(); break;
            case 'language': loadLanguages(); break;
            case 'user': loadUsers(); break;
        }
        
    } catch (error) {
        console.error('Error saving entity:', error);
        showToast('Error', error.message || 'Failed to save entity', 'error');
        hideLoading();
    }
}

async function deleteEntity(entityType, id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const config = entityConfigs[entityType];
        
        showLoading('Deleting...');
        
        const response = await fetch(`${API_BASE}${config.endpoint}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete entity');
        }
        
        hideLoading();
        
        showToast('Success', `${config.name} deleted successfully!`, 'success');
        
        // Reload the appropriate data
        switch (entityType) {
            case 'book': loadBooks(); break;
            case 'author': loadAuthors(); break;
            case 'category': loadCategories(); break;
            case 'language': loadLanguages(); break;
            case 'user': loadUsers(); break;
        }
        
    } catch (error) {
        console.error('Error deleting entity:', error);
        showToast('Error', error.message || 'Failed to delete entity', 'error');
        hideLoading();
    }
}

// Cover management functions
async function updateBookCover(bookId) {
    try {
        showLoading('Updating cover...');
        
        const response = await fetch(`/api/frontend/books/update-cover/${bookId}`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update cover');
        }
        
        const result = await response.json();
        
        hideLoading();
        
        if (result.success) {
            showToast('Success', 'Cover updated successfully!', 'success');
            loadCoversManagement();
        } else {
            showToast('Warning', result.message || 'Cover could not be updated', 'warning');
        }
        
    } catch (error) {
        console.error('Error updating cover:', error);
        showToast('Error', error.message || 'Failed to update cover', 'error');
        hideLoading();
    }
}

async function updateAllCovers() {
    if (!confirm('This will attempt to find and update covers for all books without covers. This may take a while. Continue?')) {
        return;
    }
    
    try {
        showLoading('Updating all missing covers...');
        
        const response = await fetch('/api/frontend/covers/update-missing', {
            method: 'POST'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update covers');
        }
        
        const result = await response.json();
        
        hideLoading();
        
        showToast('Success', `Updated ${result.updated_count || 0} covers out of ${result.total_count || 0} books`, 'success');
        
        // Refresh the covers management table
        loadCoversManagement();
        
        // Refresh the page to update statistics
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('Error updating all covers:', error);
        showToast('Error', error.message || 'Failed to update covers', 'error');
        hideLoading();
    }
}