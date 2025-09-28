// Admin CRUD Operations JavaScript - Complete Rewrite for Better Functionality

// Global configuration
const CONFIG = {
    API_BASE: '/api',
    ENDPOINTS: {
        books: '/books/',
        authors: '/authors/',
        categories: '/categories/',
        languages: '/languages/',
        users: '/users/'
    }
};

// Global state
let state = {
    isLoading: false,
    currentEntity: '',
    currentEntityId: null,
    loadingModal: null,
    crudModal: null
};

// Entity configurations
const entityConfigs = {
    book: {
        name: 'Book',
        endpoint: CONFIG.ENDPOINTS.books,
        fields: [
            { name: 'title', label: 'Title', type: 'text', required: true },
            { name: 'publication_year', label: 'Publication Year', type: 'number', min: 1000, max: new Date().getFullYear() + 5 },
            { name: 'isbn', label: 'ISBN', type: 'text' },
            { name: 'summary', label: 'Summary', type: 'textarea' },
            { name: 'cover_url', label: 'Cover URL', type: 'url' },
            { name: 'author_ids', label: 'Authors', type: 'multi-select', endpoint: CONFIG.ENDPOINTS.authors },
            { name: 'category_ids', label: 'Categories', type: 'multi-select', endpoint: CONFIG.ENDPOINTS.categories },
            { name: 'language_id', label: 'Language', type: 'select', endpoint: CONFIG.ENDPOINTS.languages }
        ]
    },
    author: {
        name: 'Author',
        endpoint: CONFIG.ENDPOINTS.authors,
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
        endpoint: CONFIG.ENDPOINTS.categories,
        fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' }
        ]
    },
    language: {
        name: 'Language',
        endpoint: CONFIG.ENDPOINTS.languages,
        fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'code', label: 'Language Code', type: 'text', pattern: '[a-z]{2}', placeholder: 'e.g., en, fr, es' }
        ]
    },
    user: {
        name: 'User',
        endpoint: CONFIG.ENDPOINTS.users,
        fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true, showOnEdit: false }
        ]
    }
};

// Utility functions
const utils = {
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    showLoading: function(message = 'Loading...') {
        try {
            const loadingMessage = document.getElementById('loadingMessage');
            if (loadingMessage) {
                loadingMessage.textContent = message;
            }
            
            if (!state.loadingModal) {
                const loadingModalElement = document.getElementById('loadingModal');
                if (loadingModalElement && window.bootstrap) {
                    state.loadingModal = new bootstrap.Modal(loadingModalElement);
                }
            }
            
            if (state.loadingModal) {
                state.loadingModal.show();
            }
            
            console.log('Loading:', message);
        } catch (error) {
            console.error('Error showing loading modal:', error);
        }
    },

    hideLoading: function() {
        try {
            if (state.loadingModal) {
                state.loadingModal.hide();
            }
            state.isLoading = false;
        } catch (error) {
            console.error('Error hiding loading modal:', error);
            state.isLoading = false;
        }
    },

    showToast: function(title, message, type = 'info') {
        try {
            const toast = document.getElementById('alertToast');
            const toastTitle = document.getElementById('toastTitle');
            const toastMessage = document.getElementById('toastMessage');
            
            if (toast && toastTitle && toastMessage && window.bootstrap) {
                toastTitle.textContent = title;
                toastMessage.textContent = message;
                toast.className = `toast bg-${type === 'error' ? 'danger' : type} text-white`;
                
                const bsToast = new bootstrap.Toast(toast);
                bsToast.show();
            } else {
                console.log(`${type.toUpperCase()}: ${title} - ${message}`);
            }
        } catch (error) {
            console.error('Error showing toast:', error);
            console.log(`${type.toUpperCase()}: ${title} - ${message}`);
        }
    },

    makeRequest: async function(url, options = {}) {
        try {
            console.log('Making request to:', url);
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    }
};

// API functions
const api = {
    loadBooks: async function() {
        if (state.isLoading) return;
        
        try {
            state.isLoading = true;
            utils.showLoading('Loading books...');
            
            const filter = document.getElementById('booksFilter')?.value || '';
            const search = document.getElementById('booksSearch')?.value || '';
            
            let url = `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.books}`;
            const params = new URLSearchParams();
            
            if (search) params.append('search', search);
            if (filter === 'no_cover') params.append('no_cover', 'true');
            if (filter === 'with_cover') params.append('with_cover', 'true');
            
            if (params.toString()) url += '?' + params.toString();
            
            const books = await utils.makeRequest(url);
            ui.displayBooks(books);
            
        } catch (error) {
            console.error('Error loading books:', error);
            utils.showToast('Error', `Failed to load books: ${error.message}`, 'error');
        } finally {
            utils.hideLoading();
        }
    },

    loadAuthors: async function() {
        if (state.isLoading) return;
        
        try {
            state.isLoading = true;
            utils.showLoading('Loading authors...');
            
            const search = document.getElementById('authorsSearch')?.value || '';
            let url = `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.authors}`;
            if (search) url += `?search=${encodeURIComponent(search)}`;
            
            const authors = await utils.makeRequest(url);
            ui.displayAuthors(authors);
            
        } catch (error) {
            console.error('Error loading authors:', error);
            utils.showToast('Error', `Failed to load authors: ${error.message}`, 'error');
        } finally {
            utils.hideLoading();
        }
    },

    loadCategories: async function() {
        if (state.isLoading) return;
        
        try {
            state.isLoading = true;
            utils.showLoading('Loading categories...');
            
            const search = document.getElementById('categoriesSearch')?.value || '';
            let url = `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.categories}`;
            if (search) url += `?search=${encodeURIComponent(search)}`;
            
            const categories = await utils.makeRequest(url);
            ui.displayCategories(categories);
            
        } catch (error) {
            console.error('Error loading categories:', error);
            utils.showToast('Error', `Failed to load categories: ${error.message}`, 'error');
        } finally {
            utils.hideLoading();
        }
    },

    loadLanguages: async function() {
        if (state.isLoading) return;
        
        try {
            state.isLoading = true;
            utils.showLoading('Loading languages...');
            
            const search = document.getElementById('languagesSearch')?.value || '';
            let url = `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.languages}`;
            if (search) url += `?search=${encodeURIComponent(search)}`;
            
            const languages = await utils.makeRequest(url);
            ui.displayLanguages(languages);
            
        } catch (error) {
            console.error('Error loading languages:', error);
            utils.showToast('Error', `Failed to load languages: ${error.message}`, 'error');
        } finally {
            utils.hideLoading();
        }
    },

    loadUsers: async function() {
        if (state.isLoading) return;
        
        try {
            state.isLoading = true;
            utils.showLoading('Loading users...');
            
            const search = document.getElementById('usersSearch')?.value || '';
            let url = `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.users}`;
            if (search) url += `?search=${encodeURIComponent(search)}`;
            
            const users = await utils.makeRequest(url);
            ui.displayUsers(users);
            
        } catch (error) {
            console.error('Error loading users:', error);
            utils.showToast('Error', `Failed to load users: ${error.message}`, 'error');
        } finally {
            utils.hideLoading();
        }
    }
};

// UI functions
const ui = {
    displayBooks: function(books) {
        const tbody = document.getElementById('booksTableBody');
        if (!tbody) return;
        
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
                <td><strong>${book.title || 'Untitled'}</strong></td>
                <td>${(book.authors || []).map(a => a.name).join(', ') || 'No authors'}</td>
                <td>${book.publication_year || 'N/A'}</td>
                <td>${(book.categories || []).map(c => c.name).join(', ') || 'No categories'}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="crud.editEntity('book', ${book.id})" title="Edit">
                            <i class="icon icon-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="crud.deleteEntity('book', ${book.id}, '${(book.title || '').replace(/'/g, "\\'")}')" title="Delete">
                            <i class="icon icon-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        });
        
        console.log(`Displayed ${books.length} books`);
    },

    displayAuthors: function(authors) {
        const tbody = document.getElementById('authorsTableBody');
        if (!tbody) return;
        
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
                <td><strong>${author.name || 'Unknown'}</strong></td>
                <td>${author.book_count || 0} books</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="crud.editEntity('author', ${author.id})" title="Edit">
                            <i class="icon icon-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="crud.deleteEntity('author', ${author.id}, '${(author.name || '').replace(/'/g, "\\'")}')" title="Delete">
                            <i class="icon icon-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        });
        
        console.log(`Displayed ${authors.length} authors`);
    },

    displayCategories: function(categories) {
        const tbody = document.getElementById('categoriesTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        categories.forEach(category => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><strong>${category.name || 'Unknown'}</strong></td>
                <td>${category.book_count || 0} books</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="crud.editEntity('category', ${category.id})" title="Edit">
                            <i class="icon icon-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="crud.deleteEntity('category', ${category.id}, '${(category.name || '').replace(/'/g, "\\'")}')" title="Delete">
                            <i class="icon icon-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        });
        
        console.log(`Displayed ${categories.length} categories`);
    },

    displayLanguages: function(languages) {
        const tbody = document.getElementById('languagesTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        languages.forEach(language => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><strong>${language.name || 'Unknown'}</strong> ${language.code ? `(${language.code})` : ''}</td>
                <td>${language.book_count || 0} books</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="crud.editEntity('language', ${language.id})" title="Edit">
                            <i class="icon icon-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="crud.deleteEntity('language', ${language.id}, '${(language.name || '').replace(/'/g, "\\'")}')" title="Delete">
                            <i class="icon icon-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        });
        
        console.log(`Displayed ${languages.length} languages`);
    },

    displayUsers: function(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = tbody.insertRow();
            const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
            row.innerHTML = `
                <td><strong>${user.name || 'Unknown'}</strong></td>
                <td>${user.email || 'N/A'}</td>
                <td>${createdDate}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="crud.editEntity('user', ${user.id})" title="Edit">
                            <i class="icon icon-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="crud.deleteEntity('user', ${user.id}, '${(user.name || '').replace(/'/g, "\\'")}')" title="Delete">
                            <i class="icon icon-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        });
        
        console.log(`Displayed ${users.length} users`);
    }
};

// CRUD operations
const crud = {
    openAddModal: async function(entityType) {
        state.currentEntity = entityType;
        state.currentEntityId = null;
        
        const config = entityConfigs[entityType];
        if (!config) return;
        
        if (!state.crudModal) {
            const crudModalElement = document.getElementById('crudModal');
            if (crudModalElement && window.bootstrap) {
                state.crudModal = new bootstrap.Modal(crudModalElement);
            }
        }
        
        const titleElement = document.getElementById('crudModalTitle');
        if (titleElement) {
            titleElement.textContent = `Add ${config.name}`;
        }
        
        const formElement = document.getElementById('crudForm');
        if (formElement) {
            formElement.innerHTML = await this.buildForm(config, null);
        }
        
        if (state.crudModal) {
            state.crudModal.show();
        }
    },

    editEntity: async function(entityType, id) {
        try {
            state.currentEntity = entityType;
            state.currentEntityId = id;
            
            const config = entityConfigs[entityType];
            if (!config) return;
            
            // Fetch entity data
            const entity = await utils.makeRequest(`${CONFIG.API_BASE}${config.endpoint}${id}`);
            
            if (!state.crudModal) {
                const crudModalElement = document.getElementById('crudModal');
                if (crudModalElement && window.bootstrap) {
                    state.crudModal = new bootstrap.Modal(crudModalElement);
                }
            }
            
            const titleElement = document.getElementById('crudModalTitle');
            if (titleElement) {
                titleElement.textContent = `Edit ${config.name}`;
            }
            
            const formElement = document.getElementById('crudForm');
            if (formElement) {
                formElement.innerHTML = await this.buildForm(config, entity);
            }
            
            if (state.crudModal) {
                state.crudModal.show();
            }
            
        } catch (error) {
            console.error('Error loading entity for edit:', error);
            utils.showToast('Error', 'Failed to load entity for editing', 'error');
        }
    },

    buildForm: async function(config, entityData) {
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
                    html += await this.buildSelectField(field, value);
                    break;
                case 'multi-select':
                    html += await this.buildMultiSelectField(field, value);
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
    },

    buildSelectField: async function(field, selectedValue) {
        try {
            const options = await utils.makeRequest(`${CONFIG.API_BASE}${field.endpoint}`);
            
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
    },

    buildMultiSelectField: async function(field, selectedValues) {
        try {
            const options = await utils.makeRequest(`${CONFIG.API_BASE}${field.endpoint}`);
            
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
    },

    saveEntity: async function() {
        try {
            const form = document.getElementById('crudForm');
            if (!form) return;
            
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
            const config = entityConfigs[state.currentEntity];
            config.fields.forEach(field => {
                if (field.type === 'multi-select' && !data[field.name]) {
                    data[field.name] = [];
                }
            });
            
            const endpoint = `${CONFIG.API_BASE}${config.endpoint}${state.currentEntityId ? state.currentEntityId : ''}`;
            const method = state.currentEntityId ? 'PUT' : 'POST';
            
            utils.showLoading(state.currentEntityId ? 'Updating...' : 'Creating...');
            
            await utils.makeRequest(endpoint, {
                method: method,
                body: JSON.stringify(data)
            });
            
            utils.hideLoading();
            
            if (state.crudModal) {
                state.crudModal.hide();
            }
            
            utils.showToast('Success', `${config.name} ${state.currentEntityId ? 'updated' : 'created'} successfully!`, 'success');
            
            // Reload the appropriate data
            this.reloadCurrentEntityData();
            
        } catch (error) {
            console.error('Error saving entity:', error);
            utils.showToast('Error', error.message || 'Failed to save entity', 'error');
            utils.hideLoading();
        }
    },

    deleteEntity: async function(entityType, id, name) {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            const config = entityConfigs[entityType];
            
            utils.showLoading('Deleting...');
            
            await utils.makeRequest(`${CONFIG.API_BASE}${config.endpoint}${id}`, {
                method: 'DELETE'
            });
            
            utils.hideLoading();
            
            utils.showToast('Success', `${config.name} deleted successfully!`, 'success');
            
            // Reload the appropriate data
            this.reloadEntityData(entityType);
            
        } catch (error) {
            console.error('Error deleting entity:', error);
            utils.showToast('Error', error.message || 'Failed to delete entity', 'error');
            utils.hideLoading();
        }
    },

    reloadCurrentEntityData: function() {
        this.reloadEntityData(state.currentEntity);
    },

    reloadEntityData: function(entityType) {
        switch (entityType) {
            case 'book': api.loadBooks(); break;
            case 'author': api.loadAuthors(); break;
            case 'category': api.loadCategories(); break;
            case 'language': api.loadLanguages(); break;
            case 'user': api.loadUsers(); break;
        }
    }
};

// Global functions (for onclick handlers)
window.loadBooks = api.loadBooks;
window.loadAuthors = api.loadAuthors;
window.loadCategories = api.loadCategories;
window.loadLanguages = api.loadLanguages;
window.loadUsers = api.loadUsers;
window.openAddModal = crud.openAddModal;
window.saveEntity = crud.saveEntity;
window.crud = crud;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin CRUD System initialized');
    
    // Initialize modals
    try {
        const loadingModalElement = document.getElementById('loadingModal');
        const crudModalElement = document.getElementById('crudModal');
        
        if (loadingModalElement && window.bootstrap) {
            state.loadingModal = new bootstrap.Modal(loadingModalElement);
        }
        
        if (crudModalElement && window.bootstrap) {
            state.crudModal = new bootstrap.Modal(crudModalElement);
        }
    } catch (error) {
        console.error('Error initializing modals:', error);
    }
    
    // Load initial data after a short delay
    setTimeout(() => {
        api.loadBooks();
    }, 200);
    
    // Set up tab change listeners
    document.querySelectorAll('button[data-bs-toggle="pill"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (e) {
            const target = e.target.getAttribute('data-bs-target').substring(1);
            console.log('Tab switched to:', target);
            
            // Reset loading state
            state.isLoading = false;
            
            // Load appropriate data
            setTimeout(() => {
                switch(target) {
                    case 'books': api.loadBooks(); break;
                    case 'authors': api.loadAuthors(); break;
                    case 'categories': api.loadCategories(); break;
                    case 'languages': api.loadLanguages(); break;
                    case 'users': api.loadUsers(); break;
                }
            }, 100);
        });
    });
    
    // Set up search listeners
    const searchElements = [
        { id: 'booksSearch', func: api.loadBooks },
        { id: 'authorsSearch', func: api.loadAuthors },
        { id: 'categoriesSearch', func: api.loadCategories },
        { id: 'languagesSearch', func: api.loadLanguages },
        { id: 'usersSearch', func: api.loadUsers }
    ];
    
    searchElements.forEach(({ id, func }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', utils.debounce(func, 300));
        }
    });
    
    // Set up books filter listener
    const booksFilter = document.getElementById('booksFilter');
    if (booksFilter) {
        booksFilter.addEventListener('change', api.loadBooks);
    }
});