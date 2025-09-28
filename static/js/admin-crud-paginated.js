// Admin CRUD Operations JavaScript - Optimized with Pagination

// Global configuration
const CONFIG = {
    API_BASE: '/api',
    ENDPOINTS: {
        books: '/books/',
        authors: '/authors/',
        categories: '/categories/',
        languages: '/languages/',
        users: '/users/'
    },
    PER_PAGE: 10
};

// Global state
let state = {
    isLoading: {},
    currentEntity: '',
    currentEntityId: null,
    loadingModal: null,
    crudModal: null,
    currentPage: {},
    totalPages: {}
};

// Initialize pagination state for each entity
Object.keys(CONFIG.ENDPOINTS).forEach(entity => {
    state.isLoading[entity] = false;
    state.currentPage[entity] = 1;
    state.totalPages[entity] = 1;
});

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
    },

    setTableLoading: function(tableId, isLoading) {
        const tbody = document.getElementById(tableId);
        if (!tbody) return;
        
        if (isLoading) {
            tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4"><div class="spinner-border spinner-border-sm" role="status"></div> Loading...</td></tr>';
        }
    },

    updatePagination: function(entityType, pagination) {
        const paginationContainer = document.getElementById(`${entityType}Pagination`);
        if (!paginationContainer || !pagination) return;
        
        state.currentPage[entityType] = pagination.page;
        state.totalPages[entityType] = pagination.pages;
        
        let html = '<nav><ul class="pagination pagination-sm justify-content-center">';
        
        // Previous button
        html += `<li class="page-item ${!pagination.has_prev ? 'disabled' : ''}">`;
        html += `<button class="page-link" onclick="changePage('${entityType}', ${pagination.page - 1})" ${!pagination.has_prev ? 'disabled' : ''}>Previous</button>`;
        html += '</li>';
        
        // Page numbers
        const startPage = Math.max(1, pagination.page - 2);
        const endPage = Math.min(pagination.pages, pagination.page + 2);
        
        if (startPage > 1) {
            html += '<li class="page-item"><button class="page-link" onclick="changePage(\'' + entityType + '\', 1)">1</button></li>';
            if (startPage > 2) html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<li class="page-item ${i === pagination.page ? 'active' : ''}">`;
            html += `<button class="page-link" onclick="changePage('${entityType}', ${i})">${i}</button>`;
            html += '</li>';
        }
        
        if (endPage < pagination.pages) {
            if (endPage < pagination.pages - 1) html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            html += '<li class="page-item"><button class="page-link" onclick="changePage(\'' + entityType + '\', ' + pagination.pages + ')">' + pagination.pages + '</button></li>';
        }
        
        // Next button
        html += `<li class="page-item ${!pagination.has_next ? 'disabled' : ''}">`;
        html += `<button class="page-link" onclick="changePage('${entityType}', ${pagination.page + 1})" ${!pagination.has_next ? 'disabled' : ''}>Next</button>`;
        html += '</li>';
        
        html += '</ul></nav>';
        
        // Add pagination info
        html += `<div class="text-center mt-2 small text-muted">`;
        html += `Showing ${((pagination.page - 1) * pagination.per_page) + 1}-${Math.min(pagination.page * pagination.per_page, pagination.total)} of ${pagination.total} entries`;
        html += `</div>`;
        
        paginationContainer.innerHTML = html;
    }
};

// API functions
const api = {
    loadBooks: async function(page = 1, search = '') {
        const entityType = 'book';
        if (state.isLoading[entityType]) return;
        
        try {
            state.isLoading[entityType] = true;
            utils.setTableLoading('booksTableBody', true);
            
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: CONFIG.PER_PAGE.toString()
            });
            
            if (search) params.append('search', search);
            
            const url = `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.books}?${params.toString()}`;
            const response = await utils.makeRequest(url);
            
            ui.displayBooks(response.data || response);
            if (response.pagination) {
                utils.updatePagination(entityType, response.pagination);
            }
            
        } catch (error) {
            console.error('Error loading books:', error);
            utils.showToast('Error', `Failed to load books: ${error.message}`, 'error');
            const tbody = document.getElementById('booksTableBody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-danger">Error loading books</td></tr>';
        } finally {
            state.isLoading[entityType] = false;
        }
    },

    loadAuthors: async function(page = 1, search = '') {
        const entityType = 'author';
        if (state.isLoading[entityType]) return;
        
        try {
            state.isLoading[entityType] = true;
            utils.setTableLoading('authorsTableBody', true);
            
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: CONFIG.PER_PAGE.toString()
            });
            
            if (search) params.append('search', search);
            
            const url = `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.authors}?${params.toString()}`;
            const response = await utils.makeRequest(url);
            
            ui.displayAuthors(response.data || response);
            if (response.pagination) {
                utils.updatePagination(entityType, response.pagination);
            }
            
        } catch (error) {
            console.error('Error loading authors:', error);
            utils.showToast('Error', `Failed to load authors: ${error.message}`, 'error');
            const tbody = document.getElementById('authorsTableBody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-danger">Error loading authors</td></tr>';
        } finally {
            state.isLoading[entityType] = false;
        }
    },

    loadCategories: async function(page = 1, search = '') {
        const entityType = 'category';
        if (state.isLoading[entityType]) return;
        
        try {
            state.isLoading[entityType] = true;
            utils.setTableLoading('categoriesTableBody', true);
            
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: CONFIG.PER_PAGE.toString()
            });
            
            if (search) params.append('search', search);
            
            const url = `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.categories}?${params.toString()}`;
            const response = await utils.makeRequest(url);
            
            ui.displayCategories(response.data || response);
            if (response.pagination) {
                utils.updatePagination(entityType, response.pagination);
            }
            
        } catch (error) {
            console.error('Error loading categories:', error);
            utils.showToast('Error', `Failed to load categories: ${error.message}`, 'error');
            const tbody = document.getElementById('categoriesTableBody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-danger">Error loading categories</td></tr>';
        } finally {
            state.isLoading[entityType] = false;
        }
    },

    loadLanguages: async function(page = 1, search = '') {
        const entityType = 'language';
        if (state.isLoading[entityType]) return;
        
        try {
            state.isLoading[entityType] = true;
            utils.setTableLoading('languagesTableBody', true);
            
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: CONFIG.PER_PAGE.toString()
            });
            
            if (search) params.append('search', search);
            
            const url = `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.languages}?${params.toString()}`;
            const response = await utils.makeRequest(url);
            
            ui.displayLanguages(response.data || response);
            if (response.pagination) {
                utils.updatePagination(entityType, response.pagination);
            }
            
        } catch (error) {
            console.error('Error loading languages:', error);
            utils.showToast('Error', `Failed to load languages: ${error.message}`, 'error');
            const tbody = document.getElementById('languagesTableBody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-danger">Error loading languages</td></tr>';
        } finally {
            state.isLoading[entityType] = false;
        }
    },

    loadUsers: async function(page = 1, search = '') {
        const entityType = 'user';
        if (state.isLoading[entityType]) return;
        
        try {
            state.isLoading[entityType] = true;
            utils.setTableLoading('usersTableBody', true);
            
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: CONFIG.PER_PAGE.toString()
            });
            
            if (search) params.append('search', search);
            
            const url = `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.users}?${params.toString()}`;
            const response = await utils.makeRequest(url);
            
            ui.displayUsers(response.data || response);
            if (response.pagination) {
                utils.updatePagination(entityType, response.pagination);
            }
            
        } catch (error) {
            console.error('Error loading users:', error);
            utils.showToast('Error', `Failed to load users: ${error.message}`, 'error');
            const tbody = document.getElementById('usersTableBody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-danger">Error loading users</td></tr>';
        } finally {
            state.isLoading[entityType] = false;
        }
    }
};

// UI functions
const ui = {
    displayBooks: function(books) {
        const tbody = document.getElementById('booksTableBody');
        if (!tbody) return;
        
        if (!books || books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted">No books found</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        
        books.forEach(book => {
            const row = tbody.insertRow();
            const authors = Array.isArray(book.authors) ? book.authors.map(a => a.name || a).join(', ') : (book.authors || 'No authors');
            const categories = Array.isArray(book.categories) ? book.categories.map(c => c.name || c).join(', ') : (book.categories || 'No categories');
            
            row.innerHTML = `
                <td>
                    ${book.cover_url ? 
                        `<img src="${book.cover_url}" alt="Cover" class="cover-image" style="width: 40px; height: 60px; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="placeholder-cover d-none" style="width: 40px; height: 60px; background: #e9ecef; display: flex; align-items: center; justify-content: center; font-size: 10px;">No Cover</div>` :
                        `<div class="placeholder-cover" style="width: 40px; height: 60px; background: #e9ecef; display: flex; align-items: center; justify-content: center; font-size: 10px;">No Cover</div>`
                    }
                </td>
                <td><strong>${book.title || 'Untitled'}</strong></td>
                <td>${authors}</td>
                <td>${book.publication_year || 'N/A'}</td>
                <td>${categories}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="crud.editEntity('book', ${book.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="crud.deleteEntity('book', ${book.id}, '${(book.title || '').replace(/'/g, "\\'")}')" title="Delete">
                            <i class="fas fa-trash"></i>
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
        
        if (!authors || authors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted">No authors found</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        
        authors.forEach(author => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>
                    ${author.image_url ? 
                        `<img src="${author.image_url}" alt="Author" class="author-image" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="placeholder-author d-none" style="width: 40px; height: 40px; background: #e9ecef; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;">N/A</div>` :
                        `<div class="placeholder-author" style="width: 40px; height: 40px; background: #e9ecef; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;">N/A</div>`
                    }
                </td>
                <td><strong>${author.name || 'Unknown'}</strong></td>
                <td>${author.book_count || 0} books</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="crud.editEntity('author', ${author.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="crud.deleteEntity('author', ${author.id}, '${(author.name || '').replace(/'/g, "\\'")}')" title="Delete">
                            <i class="fas fa-trash"></i>
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
        
        if (!categories || categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted">No categories found</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        
        categories.forEach(category => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><strong>${category.name || 'Unknown'}</strong></td>
                <td>${category.book_count || 0} books</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="crud.editEntity('category', ${category.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="crud.deleteEntity('category', ${category.id}, '${(category.name || '').replace(/'/g, "\\'")}')" title="Delete">
                            <i class="fas fa-trash"></i>
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
        
        if (!languages || languages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted">No languages found</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        
        languages.forEach(language => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><strong>${language.name || 'Unknown'}</strong> ${language.code ? `(${language.code})` : ''}</td>
                <td>${language.book_count || 0} books</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="crud.editEntity('language', ${language.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="crud.deleteEntity('language', ${language.id}, '${(language.name || '').replace(/'/g, "\\'")}')" title="Delete">
                            <i class="fas fa-trash"></i>
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
        
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted">No users found</td></tr>';
            return;
        }
        
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
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="crud.deleteEntity('user', ${user.id}, '${(user.name || '').replace(/'/g, "\\'")}')" title="Delete">
                            <i class="fas fa-trash"></i>
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
        // Implementation for add modal
        console.log(`Opening add modal for ${entityType}`);
        utils.showToast('Info', 'Add functionality will be implemented soon', 'info');
    },

    editEntity: async function(entityType, id) {
        // Implementation for edit
        console.log(`Editing ${entityType} with id ${id}`);
        utils.showToast('Info', 'Edit functionality will be implemented soon', 'info');
    },

    deleteEntity: async function(entityType, id, name) {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }
        
        console.log(`Deleting ${entityType} with id ${id}`);
        utils.showToast('Info', 'Delete functionality will be implemented soon', 'info');
    }
};

// Pagination function
function changePage(entityType, page) {
    if (page < 1 || page > state.totalPages[entityType]) return;
    
    const searchElement = document.getElementById(`${entityType}sSearch`);
    const search = searchElement ? searchElement.value : '';
    
    switch (entityType) {
        case 'book': api.loadBooks(page, search); break;
        case 'author': api.loadAuthors(page, search); break;
        case 'category': api.loadCategories(page, search); break;
        case 'language': api.loadLanguages(page, search); break;
        case 'user': api.loadUsers(page, search); break;
    }
}

// Global functions (for onclick handlers)
window.loadBooks = () => api.loadBooks();
window.loadAuthors = () => api.loadAuthors();
window.loadCategories = () => api.loadCategories();
window.loadLanguages = () => api.loadLanguages();
window.loadUsers = () => api.loadUsers();
window.openAddModal = crud.openAddModal;
window.crud = crud;
window.changePage = changePage;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin CRUD System initialized with pagination');
    
    // Load initial data
    setTimeout(() => {
        api.loadBooks();
    }, 100);
    
    // Set up tab change listeners
    document.querySelectorAll('button[data-bs-toggle="pill"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (e) {
            const target = e.target.getAttribute('data-bs-target').substring(1);
            console.log('Tab switched to:', target);
            
            setTimeout(() => {
                switch(target) {
                    case 'books': api.loadBooks(); break;
                    case 'authors': api.loadAuthors(); break;
                    case 'categories': api.loadCategories(); break;
                    case 'languages': api.loadLanguages(); break;
                    case 'users': api.loadUsers(); break;
                }
            }, 50);
        });
    });
    
    // Set up search listeners
    const searchElements = [
        { id: 'booksSearch', func: () => api.loadBooks(1, document.getElementById('booksSearch').value) },
        { id: 'authorsSearch', func: () => api.loadAuthors(1, document.getElementById('authorsSearch').value) },
        { id: 'categoriesSearch', func: () => api.loadCategories(1, document.getElementById('categoriesSearch').value) },
        { id: 'languagesSearch', func: () => api.loadLanguages(1, document.getElementById('languagesSearch').value) },
        { id: 'usersSearch', func: () => api.loadUsers(1, document.getElementById('usersSearch').value) }
    ];
    
    searchElements.forEach(({ id, func }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', utils.debounce(func, 300));
        }
    });
});