// Admin CRUD Operations - Simplified and Optimized

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
    isLoading: {},
    currentEntity: '',
    currentEntityId: null,
    crudModal: null
};

// Initialize loading state
Object.keys(CONFIG.ENDPOINTS).forEach(entity => {
    state.isLoading[entity] = false;
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
    debounce: (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    showToast: (title, message, type = 'info') => {
        const toast = document.getElementById('alertToast');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastTitle && toastMessage && window.bootstrap) {
            toastTitle.textContent = title;
            toastMessage.textContent = message;
            toast.className = `toast bg-${type === 'error' ? 'danger' : type} text-white`;
            new bootstrap.Toast(toast).show();
        } else {
            console.log(`${type.toUpperCase()}: ${title} - ${message}`);
        }
    },

    makeRequest: async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json', ...options.headers },
                ...options
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    },

    setTableLoading: (tableId, isLoading) => {
        const tbody = document.getElementById(tableId);
        if (!tbody) return;
        if (isLoading) {
            tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4"><div class="spinner-border spinner-border-sm" role="status"></div> Loading...</td></tr>';
        }
    }
};

// API and UI functions
const api = {
    loadData: async (entityType, search = '') => {
        if (state.isLoading[entityType]) return;
        
        try {
            state.isLoading[entityType] = true;
            utils.setTableLoading(`${entityType}sTableBody`, true);
            
            const endpoint = `${CONFIG.API_BASE}${entityConfigs[entityType].endpoint}`;
            const url = search ? `${endpoint}?search=${encodeURIComponent(search)}` : endpoint;
            
            const data = await utils.makeRequest(url);
            ui.displayData(entityType, data);
            
        } catch (error) {
            console.error(`Error loading ${entityType}s:`, error);
            utils.showToast('Error', `Failed to load ${entityType}s: ${error.message}`, 'error');
            const tbody = document.getElementById(`${entityType}sTableBody`);
            if (tbody) tbody.innerHTML = `<tr><td colspan="100%" class="text-center py-4 text-danger">Error loading ${entityType}s</td></tr>`;
        } finally {
            state.isLoading[entityType] = false;
        }
    }
};

const ui = {
    displayData: (entityType, data) => {
        const tbody = document.getElementById(`${entityType}sTableBody`);
        if (!tbody) return;
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="100%" class="text-center py-4 text-muted">No ${entityType}s found</td></tr>`;
            return;
        }
        
        tbody.innerHTML = data.map(item => ui.renderRow(entityType, item)).join('');
        console.log(`Displayed ${data.length} ${entityType}s`);
    },

    renderRow: (entityType, item) => {
        switch (entityType) {
            case 'book':
                return `
                    <tr>
                        <td class="text-center">
                            ${item.cover_url ? 
                                `<img src="${item.cover_url}" alt="Cover" class="cover-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                 <div class="placeholder-cover d-none">No Cover</div>` :
                                `<div class="placeholder-cover">No Cover</div>`
                            }
                        </td>
                        <td><strong>${item.title || 'Untitled'}</strong></td>
                        <td>${(item.authors || []).map(a => a.name).join(', ') || 'No authors'}</td>
                        <td>${item.publication_year || 'N/A'}</td>
                        <td>${(item.categories || []).map(c => c.name).join(', ') || 'No categories'}</td>
                        <td>${ui.renderActionButtons(entityType, item.id, item.title)}</td>
                    </tr>`;
            case 'author':
                return `
                    <tr>
                        <td>
                            ${item.image_url ? 
                                `<img src="${item.image_url}" alt="Author" class="author-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                 <div class="placeholder-author d-none">N/A</div>` :
                                `<div class="placeholder-author">N/A</div>`
                            }
                        </td>
                        <td><strong>${item.name || 'Unknown'}</strong></td>
                        <td>${item.book_count || 0} books</td>
                        <td>${ui.renderActionButtons(entityType, item.id, item.name)}</td>
                    </tr>`;
            case 'category':
                return `
                    <tr>
                        <td><strong>${item.name || 'Unknown'}</strong></td>
                        <td>${item.book_count || 0} books</td>
                        <td>${ui.renderActionButtons(entityType, item.id, item.name)}</td>
                    </tr>`;
            case 'language':
                return `
                    <tr>
                        <td><strong>${item.name || 'Unknown'}</strong> ${item.code ? `(${item.code})` : ''}</td>
                        <td>${item.book_count || 0} books</td>
                        <td>${ui.renderActionButtons(entityType, item.id, item.name)}</td>
                    </tr>`;
            case 'user':
                const createdDate = item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A';
                return `
                    <tr>
                        <td><strong>${item.name || 'Unknown'}</strong></td>
                        <td>${item.email || 'N/A'}</td>
                        <td>${item.collection_count || 0} collections</td>
                        <td>${createdDate}</td>
                        <td>${ui.renderActionButtons(entityType, item.id, item.name)}</td>
                    </tr>`;
            default:
                return '';
        }
    },

    renderActionButtons: (entityType, id, name) => `
        <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="crud.editEntity('${entityType}', ${id})">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-outline-danger" onclick="crud.deleteEntity('${entityType}', ${id}, '${(name || '').replace(/'/g, "\\'")}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>`
};

// CRUD operations
const crud = {
    openAddModal: async (entityType) => {
        state.currentEntity = entityType;
        state.currentEntityId = null;
        
        const config = entityConfigs[entityType];
        if (!config) return;
        
        if (!state.crudModal) {
            const crudModalElement = document.getElementById('crudModal');
            if (crudModalElement) state.crudModal = new bootstrap.Modal(crudModalElement);
        }
        
        document.getElementById('crudModalTitle').textContent = `Add ${config.name}`;
        document.getElementById('crudForm').innerHTML = await crud.buildForm(config, null);
        state.crudModal.show();
    },

    editEntity: async (entityType, id) => {
        try {
            state.currentEntity = entityType;
            state.currentEntityId = id;
            
            const config = entityConfigs[entityType];
            if (!config) return;
            
            const entity = await utils.makeRequest(`${CONFIG.API_BASE}${config.endpoint}${id}`);
            
            if (!state.crudModal) {
                const crudModalElement = document.getElementById('crudModal');
                if (crudModalElement) state.crudModal = new bootstrap.Modal(crudModalElement);
            }
            
            document.getElementById('crudModalTitle').textContent = `Edit ${config.name}`;
            document.getElementById('crudForm').innerHTML = await crud.buildForm(config, entity);
            state.crudModal.show();
            
        } catch (error) {
            utils.showToast('Error', 'Failed to load entity for editing', 'error');
        }
    },

    buildForm: async (config, entityData) => {
        let html = '';
        for (const field of config.fields) {
            if (field.showOnEdit === false && entityData) continue;
            
            const value = entityData ? (entityData[field.name] || '') : '';
            const required = field.required ? 'required' : '';
            
            html += `<div class="mb-3"><label for="${field.name}" class="form-label">${field.label} ${field.required ? '<span class="text-danger">*</span>' : ''}</label>`;
            
            switch (field.type) {
                case 'textarea':
                    html += `<textarea class="form-control" id="${field.name}" name="${field.name}" ${required}>${value}</textarea>`;
                    break;
                case 'select':
                case 'multi-select':
                    html += await crud.buildSelectField(field, value, field.type === 'multi-select');
                    break;
                default:
                    html += `<input type="${field.type}" class="form-control" id="${field.name}" name="${field.name}" value="${value}" ${required} ${field.pattern ? `pattern="${field.pattern}"` : ''} ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>`;
            }
            html += `</div>`;
        }
        return html;
    },

    buildSelectField: async (field, selectedValue, isMultiple) => {
        try {
            const options = await utils.makeRequest(`${CONFIG.API_BASE}${field.endpoint}`);
            const selectedIds = isMultiple ? (Array.isArray(selectedValue) ? selectedValue.map(v => v.id || v) : []) : [selectedValue];
            
            let html = `<select class="form-select" id="${field.name}" name="${field.name}" ${isMultiple ? 'multiple size="4"' : ''}>`;
            if (!isMultiple) html += `<option value="">Select ${field.label}</option>`;
            
            options.forEach(option => {
                const selected = selectedIds.includes(option.id) ? 'selected' : '';
                html += `<option value="${option.id}" ${selected}>${option.name}</option>`;
            });
            
            html += `</select>`;
            if (isMultiple) html += `<small class="form-text text-muted">Hold Ctrl/Cmd to select multiple</small>`;
            return html;
        } catch (error) {
            return `<input type="text" class="form-control" value="${selectedValue}" placeholder="Error loading options">`;
        }
    },

    saveEntity: async () => {
        try {
            const form = document.getElementById('crudForm');
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    if (!Array.isArray(data[key])) data[key] = [data[key]];
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }
            
            const config = entityConfigs[state.currentEntity];
            config.fields.forEach(field => {
                if (field.type === 'multi-select' && !data[field.name]) data[field.name] = [];
            });
            
            const endpoint = `${CONFIG.API_BASE}${config.endpoint}${state.currentEntityId ? state.currentEntityId : ''}`;
            const method = state.currentEntityId ? 'PUT' : 'POST';
            
            await utils.makeRequest(endpoint, { method, body: JSON.stringify(data) });
            
            state.crudModal.hide();
            utils.showToast('Success', `${config.name} ${state.currentEntityId ? 'updated' : 'created'} successfully!`, 'success');
            api.loadData(state.currentEntity);
            
        } catch (error) {
            utils.showToast('Error', error.message || 'Failed to save entity', 'error');
        }
    },

    deleteEntity: async (entityType, id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
        
        try {
            const config = entityConfigs[entityType];
            await utils.makeRequest(`${CONFIG.API_BASE}${config.endpoint}${id}`, { method: 'DELETE' });
            utils.showToast('Success', `${config.name} deleted successfully!`, 'success');
            api.loadData(entityType);
        } catch (error) {
            utils.showToast('Error', error.message || 'Failed to delete entity', 'error');
        }
    }
};

// Global functions for onclick handlers
window.crud = crud;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin CRUD System Initialized');
    
    // Load initial data
    api.loadData('book');
    
    // Set up tab change listeners
    document.querySelectorAll('button[data-bs-toggle="pill"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const entityType = e.target.getAttribute('data-bs-target').substring(1).slice(0, -1);
            if (entityConfigs[entityType]) {
                api.loadData(entityType);
            }
        });
    });
    
    // Set up search listeners
    Object.keys(entityConfigs).forEach(entityType => {
        const searchInput = document.getElementById(`${entityType}sSearch`);
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce(() => {
                api.loadData(entityType, searchInput.value);
            }, 300));
        }
    });
});