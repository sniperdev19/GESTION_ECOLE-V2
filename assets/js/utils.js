// ===================================
// Utility Functions - Fonctions utilitaires
// ===================================

// ===== Formatage =====

// Formater un montant en FCFA
function formatMoney(amount) {
    if (!amount && amount !== 0) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
}

// Formater une date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

// Formater une date et heure
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Obtenir la date actuelle formatée
function getCurrentDate() {
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());
}

// Obtenir la date actuelle au format YYYY-MM-DD
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ===== Notifications Toast =====

function showToast(message, type = 'info', title = '') {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const titles = {
        success: 'Succès',
        error: 'Erreur',
        warning: 'Attention',
        info: 'Information'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <div class="toast-content">
            <div class="toast-title">${title || titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ===== Modale de confirmation =====

function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmBtn');
    
    messageEl.textContent = message;
    
    // Nettoyer les anciens event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        closeModal('confirmModal');
    });
    
    openModal('confirmModal');
}

// ===== Gestion des modales =====

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Fermer la modale en cliquant en dehors
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===== Pagination =====

function createPagination(totalItems, itemsPerPage, currentPage, containerId, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Bouton précédent
    html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="${onPageChange}(${currentPage - 1})">
        <i class="fas fa-chevron-left"></i>
    </button>`;
    
    // Numéros de page
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="${onPageChange}(${i})">
                ${i}
            </button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span style="padding: 8px;">...</span>`;
        }
    }
    
    // Bouton suivant
    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="${onPageChange}(${currentPage + 1})">
        <i class="fas fa-chevron-right"></i>
    </button>`;
    
    container.innerHTML = html;
}

// ===== Filtrage de tableau =====

function filterTable(data, filters) {
    return data.filter(item => {
        for (let key in filters) {
            if (filters[key] && item[key] !== filters[key]) {
                return false;
            }
        }
        return true;
    });
}

// Recherche dans un tableau
function searchInData(data, searchTerm, fields) {
    if (!searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(item => {
        return fields.some(field => {
            const value = item[field];
            if (!value) return false;
            return String(value).toLowerCase().includes(term);
        });
    });
}

// ===== Export de données =====

function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('Aucune donnée à exporter', 'warning');
        return;
    }
    
    // En-têtes
    const headers = Object.keys(data[0]);
    
    // Construire le CSV
    let csv = headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Échapper les virgules et guillemets
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csv += values.join(',') + '\n';
    });
    
    // Télécharger
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${getTodayDate()}.csv`;
    link.click();
    
    showToast('Export réussi', 'success');
}

// Export en JSON
function exportToJSON(data, filename) {
    if (!data || data.length === 0) {
        showToast('Aucune donnée à exporter', 'warning');
        return;
    }
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${getTodayDate()}.json`;
    link.click();
    
    showToast('Export réussi', 'success');
}

// ===== Impression =====

function printContent(title, content) {
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `
        <div style="padding: 20px;">
            <h1 style="text-align: center; margin-bottom: 20px;">${title}</h1>
            ${content}
            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
                Imprimé le ${getCurrentDate()}
            </div>
        </div>
    `;
    window.print();
}

// ===== Validation de formulaire =====

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--danger-color)';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
    }
    
    return isValid;
}

// ===== Calculs financiers =====

function calculateStudentBalance(student, payments) {
    const totalDue = parseFloat(student.total_amount || 0);
    const studentPayments = payments.filter(p => p.student_id == student.id && p.status === 'completed');
    const totalPaid = studentPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const balance = totalDue - totalPaid;
    
    return {
        totalDue,
        totalPaid,
        balance
    };
}

// ===== Statistiques =====

function calculatePaymentsByMonth(payments) {
    const months = {};
    
    payments.forEach(payment => {
        if (!payment.payment_date) return;
        
        const date = new Date(payment.payment_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!months[monthKey]) {
            months[monthKey] = 0;
        }
        
        months[monthKey] += parseFloat(payment.amount || 0);
    });
    
    return months;
}

function calculateExpensesByCategory(expenses) {
    const categories = {};
    
    expenses.forEach(expense => {
        const category = expense.category || 'Autre';
        
        if (!categories[category]) {
            categories[category] = 0;
        }
        
        categories[category] += parseFloat(expense.amount || 0);
    });
    
    return categories;
}

// ===== Gestion du thème =====

function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    const icon = document.querySelector('#themeToggle i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = 'fas fa-sun';
    }
}

// ===== Plein écran =====

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        document.querySelector('#fullscreenBtn i').className = 'fas fa-compress';
    } else {
        document.exitFullscreen();
        document.querySelector('#fullscreenBtn i').className = 'fas fa-expand';
    }
}

// ===== Debounce =====

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Tri de tableau =====

function sortData(data, key, ascending = true) {
    return [...data].sort((a, b) => {
        const valueA = a[key];
        const valueB = b[key];
        
        if (valueA === valueB) return 0;
        
        const comparison = valueA > valueB ? 1 : -1;
        return ascending ? comparison : -comparison;
    });
}

// ===== Loading State =====

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
            </div>
        `;
    }
}

function hideLoading() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => el.remove());
}

// ===== Empty State =====

function showEmptyState(containerId, message = 'Aucune donnée disponible', icon = 'fa-inbox') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas ${icon}"></i>
                <h3>Aucune donnée</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// ===== Utilitaires de texte =====

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function truncate(str, length = 50) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
}

// ===== Génération de couleurs =====

function getRandomColor() {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe',
        '#43e97b', '#38f9d7', '#fa709a', '#fee140',
        '#30cfd0', '#330867', '#a8edea', '#fed6e3'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ===== Status Badge =====

function getStatusBadge(status) {
    const statusMap = {
        'active': { class: 'active', text: 'Actif' },
        'inactive': { class: 'inactive', text: 'Inactif' },
        'completed': { class: 'completed', text: 'Complété' },
        'pending': { class: 'pending', text: 'En attente' },
        'paid': { class: 'paid', text: 'Payé' },
        'cancelled': { class: 'cancelled', text: 'Annulé' },
        'graduated': { class: 'completed', text: 'Diplômé' }
    };
    
    const statusInfo = statusMap[status] || { class: 'pending', text: status };
    return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

// ===== Local Storage Helpers =====

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function getFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}
