// ===================================
// Application Principale - EduManage
// ===================================

// ===== État global de l'application =====
const appState = {
    currentPage: 'dashboard',
    students: [],
    teachers: [],
    payments: [],
    expenses: [],
    currentStudent: null,
    currentTeacher: null,
    currentPayment: null,
    currentExpense: null,
    pagination: {
        students: { current: 1, perPage: 10 },
        teachers: { current: 1, perPage: 10 },
        payments: { current: 1, perPage: 10 },
        expenses: { current: 1, perPage: 10 }
    },
    filters: {
        students: {},
        teachers: {},
        payments: {},
        expenses: {}
    }
};

// ===== Initialisation de l'application =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Afficher le loader (si présent)
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.remove('hidden');
    }
    
    // Petite pause pour l'effet visuel
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Vérifier l'authentification
    if (!api.isAuthenticated()) {
        showLoginPage();
    } else {
        await showAppPage();
    }
    
    // Masquer le loader (si présent)
    if (loader) {
        loader.classList.add('hidden');
    }
    
    // Initialiser les event listeners
    initEventListeners();
}

// ===== Afficher la page de connexion =====
function showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

// ===== Afficher l'application =====
async function showAppPage() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    
    // Charger le nom d'utilisateur
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    document.getElementById('currentUser').textContent = user.username || 'Administrateur';
    
    // Afficher la date actuelle
    document.getElementById('currentDate').textContent = getCurrentDate();
    
    // Charger les données du dashboard
    await loadDashboard();
}

// ===== Obtenir l'utilisateur actuel =====
function getCurrentUser() {
    try {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error parsing current user:', error);
        return null;
    }
}

// ===== Obtenir la date actuelle =====
function getCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return now.toLocaleDateString('fr-FR', options);
}

// ===== Gestion du thème =====
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

function applyTheme(theme) {
    // Nettoyer les classes de thème existantes
    document.body.classList.remove('theme-light', 'theme-dark');
    
    // Appliquer le nouveau thème
    document.body.classList.add(`theme-${theme}`);
    
    // Mettre à jour l'icône du bouton toggle si elle existe
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ===== Gestion de la connexion =====
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        await api.login(username, password);
        errorDiv.classList.add('hidden');
        await showAppPage();
    } catch (error) {
        errorDiv.classList.remove('hidden');
        errorDiv.querySelector('span').textContent = error.message;
    }
});

// Toggle password visibility
document.querySelector('.toggle-password')?.addEventListener('click', function() {
    const input = document.getElementById('password');
    const icon = this.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});

// ===== Event Listeners =====
function initEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('mobileSidebarToggle')?.addEventListener('click', toggleMobileSidebar);
    
    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    // Fullscreen toggle
    document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);
    
    // Search global
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', debounce((e) => {
            handleGlobalSearch(e.target.value);
        }, 300));
    }
    
    // Formulaires
    initFormHandlers();
    
    // Filtres
    initFilterHandlers();
    
    // Charger le thème sauvegardé
    loadTheme();
}

// ===== Navigation =====
function navigateTo(page) {
    appState.currentPage = page;
    
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
    
    // Mettre à jour les pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(`${page}Page`)?.classList.add('active');
    
    // Mettre à jour le titre
    const titles = {
        dashboard: 'Tableau de bord',
        students: 'Gestion des Élèves',
        teachers: 'Gestion des Enseignants',
        payments: 'Gestion des Paiements',
        expenses: 'Gestion des Dépenses',
        reports: 'Rapports & Statistiques',
        settings: 'Paramètres'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;
    
    // Charger les données de la page
    loadPageData(page);
}

// ===== Charger les données d'une page =====
async function loadPageData(page) {
    switch (page) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'students':
            await loadStudents();
            break;
        case 'teachers':
            await loadTeachers();
            break;
        case 'payments':
            await loadPayments();
            break;
        case 'expenses':
            await loadExpenses();
            break;
        case 'reports':
            await loadReports();
            break;
        case 'settings':
            await loadSettings();
            break;
    }
}

// ===== Dashboard =====
async function loadDashboard() {
    try {
        const stats = await api.getDashboardStats();
        
        // Mettre à jour les statistiques
        document.getElementById('totalStudents').textContent = stats.totalStudents;
        document.getElementById('totalTeachers').textContent = stats.totalTeachers;
        document.getElementById('totalPayments').textContent = formatMoney(stats.totalPayments);
        document.getElementById('pendingPayments').textContent = formatMoney(stats.pendingPayments);
        
        // Stocker les données
        appState.students = stats.students;
        appState.teachers = stats.teachers;
        appState.payments = stats.payments;
        appState.expenses = stats.expenses;
        
        // Charger les graphiques
        loadDashboardCharts(stats);
        
        // Charger les derniers paiements
        loadRecentPayments(stats.payments);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Erreur lors du chargement du tableau de bord', 'error');
    }
}

function loadRecentPayments(payments) {
    const container = document.getElementById('recentPaymentsList');
    const recent = payments
        .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
        .slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Aucun paiement récent</p>';
        return;
    }
    
    container.innerHTML = recent.map(payment => {
        const student = appState.students.find(s => s.id == payment.student_id);
        const studentName = student ? `${student.first_name} ${student.last_name}` : 'N/A';
        
        return `
            <div class="payment-item">
                <div class="payment-info">
                    <strong>${studentName}</strong>
                    <small>${formatDate(payment.payment_date)} • ${payment.payment_type || 'scolarité'}</small>
                </div>
                <div class="payment-amount">${formatMoney(payment.amount)}</div>
            </div>
        `;
    }).join('');
}

// ===== Charts =====
let paymentsChart = null;
let classDistributionChart = null;

function loadDashboardCharts(stats) {
    // Graphique des paiements
    const paymentsCtx = document.getElementById('paymentsChart');
    if (paymentsCtx) {
        const monthlyData = calculatePaymentsByMonth(stats.payments);
        const months = Object.keys(monthlyData).sort().slice(-6);
        const amounts = months.map(m => monthlyData[m]);
        
        if (paymentsChart) paymentsChart.destroy();
        
        paymentsChart = new Chart(paymentsCtx, {
            type: 'line',
            data: {
                labels: months.map(m => {
                    const [year, month] = m.split('-');
                    return new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
                }),
                datasets: [{
                    label: 'Paiements reçus (FCFA)',
                    data: amounts,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatMoney(value);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Graphique de répartition par classe
    const classCtx = document.getElementById('classDistributionChart');
    if (classCtx) {
        const classCounts = {};
        stats.students.forEach(student => {
            const classLevel = student.class_level || 'Non défini';
            classCounts[classLevel] = (classCounts[classLevel] || 0) + 1;
        });
        
        if (classDistributionChart) classDistributionChart.destroy();
        
        classDistributionChart = new Chart(classCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(classCounts),
                datasets: [{
                    data: Object.values(classCounts),
                    backgroundColor: [
                        '#6366f1', '#10b981', '#f59e0b', '#ef4444',
                        '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// ===== Students =====
async function loadStudents() {
    try {
        showLoading('studentsTableBody');
        
        if (appState.students.length === 0) {
            appState.students = await api.getStudents();
        }
        
        if (appState.payments.length === 0) {
            appState.payments = await api.getPayments();
        }
        
        renderStudents();
    } catch (error) {
        console.error('Error loading students:', error);
        showToast('Erreur lors du chargement des élèves', 'error');
    }
}

function renderStudents() {
    const tbody = document.getElementById('studentsTableBody');
    let filteredStudents = [...appState.students];
    
    // Appliquer les filtres
    const search = document.getElementById('studentSearch')?.value;
    if (search) {
        filteredStudents = searchInData(filteredStudents, search, ['first_name', 'last_name', 'parent_name', 'class_level']);
    }
    
    const classFilter = document.getElementById('classFilter')?.value;
    if (classFilter) {
        filteredStudents = filteredStudents.filter(s => s.class_level === classFilter);
    }
    
    const statusFilter = document.getElementById('statusFilter')?.value;
    if (statusFilter) {
        filteredStudents = filteredStudents.filter(s => s.status === statusFilter);
    }
    
    // Pagination
    const { current, perPage } = appState.pagination.students;
    const start = (current - 1) * perPage;
    const end = start + perPage;
    const paginatedStudents = filteredStudents.slice(start, end);
    
    // Afficher
    if (paginatedStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">Aucun élève trouvé</td></tr>';
    } else {
        tbody.innerHTML = paginatedStudents.map(student => {
            const balance = calculateStudentBalance(student, appState.payments);
            const isPaid = balance.balance <= 0;
            
            return `
                <tr>
                    <td><input type="checkbox" class="student-checkbox" data-id="${student.id}"></td>
                    <td>${student.id}</td>
                    <td><strong>${student.first_name} ${student.last_name}</strong></td>
                    <td>${student.class_level || 'N/A'}</td>
                    <td>${student.parent_name || 'N/A'}</td>
                    <td>${student.parent_phone || 'N/A'}</td>
                    <td><strong style="color: ${isPaid ? 'var(--success-color)' : 'var(--danger-color)'};">${formatMoney(balance.balance)}</strong></td>
                    <td>${getStatusBadge(student.status)}</td>
                    <td class="table-actions">
                        <button class="action-icon view" onclick="viewStudent(${student.id})" title="Voir">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-icon edit" onclick="editStudent(${student.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-icon delete" onclick="deleteStudent(${student.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // Mise à jour des informations
    document.getElementById('studentsShowing').textContent = paginatedStudents.length;
    document.getElementById('studentsTotal').textContent = filteredStudents.length;
    
    // Pagination
    createPagination(filteredStudents.length, perPage, current, 'studentsPagination', 'goToStudentsPage');
}

function goToStudentsPage(page) {
    appState.pagination.students.current = page;
    renderStudents();
}

// Ouvrir le modal étudiant
function openStudentModal(student = null) {
    const modal = document.getElementById('studentModal');
    const form = document.getElementById('studentForm');
    const title = document.getElementById('studentModalTitle');
    
    if (student) {
        title.textContent = 'Modifier l\'élève';
        document.getElementById('studentId').value = student.id;
        document.getElementById('studentLastName').value = student.last_name;
        document.getElementById('studentFirstName').value = student.first_name;
        document.getElementById('studentDob').value = student.date_of_birth;
        document.getElementById('studentGender').value = student.gender;
        document.getElementById('studentClass').value = student.class_level;
        document.getElementById('studentStatus').value = student.status;
        document.getElementById('parentName').value = student.parent_name || '';
        document.getElementById('parentPhone').value = student.parent_phone || '';
        document.getElementById('studentAddress').value = student.address || '';
        document.getElementById('isSchoolStudent').checked = student.is_school_student == 1;
        document.getElementById('isCanteenStudent').checked = student.is_canteen_student == 1;
        document.getElementById('isDormitoryStudent').checked = student.is_dormitory_student == 1;
    } else {
        title.textContent = 'Nouvel Élève';
        form.reset();
        document.getElementById('studentId').value = '';
        document.getElementById('isSchoolStudent').checked = true;
    }
    
    openModal('studentModal');
}

function viewStudent(id) {
    const student = appState.students.find(s => s.id == id);
    if (!student) return;
    
    const balance = calculateStudentBalance(student, appState.payments);
    const studentPayments = appState.payments.filter(p => p.student_id == id);
    
    const content = document.getElementById('viewStudentContent');
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
            <div>
                <h4 style="margin-bottom: 16px; color: var(--primary-color);">Informations personnelles</h4>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div><strong>Nom complet:</strong> ${student.first_name} ${student.last_name}</div>
                    <div><strong>Date de naissance:</strong> ${formatDate(student.date_of_birth)}</div>
                    <div><strong>Genre:</strong> ${student.gender === 'M' ? 'Masculin' : 'Féminin'}</div>
                    <div><strong>Classe:</strong> ${student.class_level}</div>
                    <div><strong>Statut:</strong> ${getStatusBadge(student.status)}</div>
                </div>
            </div>
            <div>
                <h4 style="margin-bottom: 16px; color: var(--primary-color);">Informations parent</h4>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div><strong>Nom parent:</strong> ${student.parent_name || 'N/A'}</div>
                    <div><strong>Téléphone:</strong> ${student.parent_phone || 'N/A'}</div>
                    <div><strong>Adresse:</strong> ${student.address || 'N/A'}</div>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 24px;">
            <h4 style="margin-bottom: 16px; color: var(--primary-color);">Situation financière</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                <div class="info-card">
                    <span class="label">Total dû</span>
                    <span class="value">${formatMoney(balance.totalDue)}</span>
                </div>
                <div class="info-card">
                    <span class="label">Déjà payé</span>
                    <span class="value" style="color: var(--success-color);">${formatMoney(balance.totalPaid)}</span>
                </div>
                <div class="info-card">
                    <span class="label">Reste à payer</span>
                    <span class="value" style="color: ${balance.balance > 0 ? 'var(--danger-color)' : 'var(--success-color)'};">${formatMoney(balance.balance)}</span>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 24px;">
            <h4 style="margin-bottom: 16px; color: var(--primary-color);">Historique des paiements (${studentPayments.length})</h4>
            <div style="max-height: 200px; overflow-y: auto;">
                ${studentPayments.length > 0 ? `
                    <table class="data-table" style="font-size: 13px;">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Montant</th>
                                <th>Type</th>
                                <th>Méthode</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${studentPayments.map(p => `
                                <tr>
                                    <td>${formatDate(p.payment_date)}</td>
                                    <td><strong>${formatMoney(p.amount)}</strong></td>
                                    <td>${p.payment_type || 'scolarité'}</td>
                                    <td>${p.payment_method || 'cash'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Aucun paiement enregistré</p>'}
            </div>
        </div>
    `;
    
    openModal('viewStudentModal');
}

function editStudent(id) {
    const student = appState.students.find(s => s.id == id);
    if (student) {
        openStudentModal(student);
    }
}

function deleteStudent(id) {
    showConfirmModal('Êtes-vous sûr de vouloir supprimer cet élève ?', async () => {
        try {
            await api.deleteStudent(id);
            appState.students = appState.students.filter(s => s.id != id);
            renderStudents();
            showToast('Élève supprimé avec succès', 'success');
        } catch (error) {
            showToast('Erreur lors de la suppression', 'error');
        }
    });
}

// ===== Teachers =====
async function loadTeachers() {
    try {
        showLoading('teachersTableBody');
        
        if (appState.teachers.length === 0) {
            appState.teachers = await api.getTeachers();
        }
        
        renderTeachers();
    } catch (error) {
        console.error('Error loading teachers:', error);
        showToast('Erreur lors du chargement des enseignants', 'error');
    }
}

function renderTeachers() {
    const tbody = document.getElementById('teachersTableBody');
    let filteredTeachers = [...appState.teachers];
    
    // Appliquer les filtres
    const search = document.getElementById('teacherSearch')?.value;
    if (search) {
        filteredTeachers = searchInData(filteredTeachers, search, ['first_name', 'last_name', 'subject', 'email']);
    }
    
    const subjectFilter = document.getElementById('subjectFilter')?.value;
    if (subjectFilter) {
        filteredTeachers = filteredTeachers.filter(t => t.subject === subjectFilter);
    }
    
    const statusFilter = document.getElementById('teacherStatusFilter')?.value;
    if (statusFilter) {
        filteredTeachers = filteredTeachers.filter(t => t.status === statusFilter);
    }
    
    // Pagination
    const { current, perPage } = appState.pagination.teachers;
    const start = (current - 1) * perPage;
    const end = start + perPage;
    const paginatedTeachers = filteredTeachers.slice(start, end);
    
    // Afficher
    if (paginatedTeachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">Aucun enseignant trouvé</td></tr>';
    } else {
        tbody.innerHTML = paginatedTeachers.map(teacher => `
            <tr>
                <td><input type="checkbox" class="teacher-checkbox" data-id="${teacher.id}"></td>
                <td>${teacher.id}</td>
                <td><strong>${teacher.first_name} ${teacher.last_name}</strong></td>
                <td>${teacher.subject || 'N/A'}</td>
                <td>${teacher.phone || 'N/A'}</td>
                <td>${teacher.email || 'N/A'}</td>
                <td><strong>${formatMoney(teacher.salary)}</strong></td>
                <td>${getStatusBadge(teacher.status)}</td>
                <td class="table-actions">
                    <button class="action-icon edit" onclick="editTeacher(${teacher.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-icon delete" onclick="deleteTeacher(${teacher.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    // Mise à jour des informations
    document.getElementById('teachersShowing').textContent = paginatedTeachers.length;
    document.getElementById('teachersTotal').textContent = filteredTeachers.length;
    
    // Pagination
    createPagination(filteredTeachers.length, perPage, current, 'teachersPagination', 'goToTeachersPage');
}

function goToTeachersPage(page) {
    appState.pagination.teachers.current = page;
    renderTeachers();
}

function openTeacherModal(teacher = null) {
    const modal = document.getElementById('teacherModal');
    const form = document.getElementById('teacherForm');
    const title = document.getElementById('teacherModalTitle');
    
    if (teacher) {
        title.textContent = 'Modifier l\'enseignant';
        document.getElementById('teacherId').value = teacher.id;
        document.getElementById('teacherLastName').value = teacher.last_name;
        document.getElementById('teacherFirstName').value = teacher.first_name;
        document.getElementById('teacherDob').value = teacher.date_of_birth;
        document.getElementById('teacherGender').value = teacher.gender;
        document.getElementById('teacherSubject').value = teacher.subject;
        document.getElementById('teacherHireDate').value = teacher.hire_date;
        document.getElementById('teacherPhone').value = teacher.phone || '';
        document.getElementById('teacherEmail').value = teacher.email || '';
        document.getElementById('teacherSalary').value = teacher.salary;
        document.getElementById('teacherStatus').value = teacher.status;
        document.getElementById('teacherAddress').value = teacher.address || '';
    } else {
        title.textContent = 'Nouvel Enseignant';
        form.reset();
        document.getElementById('teacherId').value = '';
    }
    
    openModal('teacherModal');
}

function editTeacher(id) {
    const teacher = appState.teachers.find(t => t.id == id);
    if (teacher) {
        openTeacherModal(teacher);
    }
}

function deleteTeacher(id) {
    showConfirmModal('Êtes-vous sûr de vouloir supprimer cet enseignant ?', async () => {
        try {
            await api.deleteTeacher(id);
            appState.teachers = appState.teachers.filter(t => t.id != id);
            renderTeachers();
            showToast('Enseignant supprimé avec succès', 'success');
        } catch (error) {
            showToast('Erreur lors de la suppression', 'error');
        }
    });
}

// ===== Payments =====
async function loadPayments() {
    try {
        showLoading('paymentsTableBody');
        
        if (appState.payments.length === 0) {
            appState.payments = await api.getPayments();
        }
        
        if (appState.students.length === 0) {
            appState.students = await api.getStudents();
        }
        
        // Charger les étudiants dans le select du modal
        loadStudentsInPaymentModal();
        
        // Calculer les statistiques
        calculatePaymentStats();
        
        renderPayments();
    } catch (error) {
        console.error('Error loading payments:', error);
        showToast('Erreur lors du chargement des paiements', 'error');
    }
}

function loadStudentsInPaymentModal() {
    const select = document.getElementById('paymentStudent');
    if (select) {
        select.innerHTML = '<option value="">Sélectionner un élève</option>' +
            appState.students.map(s => `
                <option value="${s.id}">${s.first_name} ${s.last_name} - ${s.class_level}</option>
            `).join('');
    }
}

function calculatePaymentStats() {
    const completed = appState.payments.filter(p => p.status === 'completed');
    const totalReceived = completed.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    const pending = appState.payments.filter(p => p.status === 'pending');
    const totalPending = pending.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    const studentsWithPayments = new Set(completed.map(p => p.student_id)).size;
    
    document.getElementById('totalReceived').textContent = formatMoney(totalReceived);
    document.getElementById('totalPending').textContent = formatMoney(totalPending);
    document.getElementById('studentsWithPayments').textContent = studentsWithPayments;
}

function renderPayments() {
    const tbody = document.getElementById('paymentsTableBody');
    let filteredPayments = [...appState.payments];
    
    // Appliquer les filtres
    const search = document.getElementById('paymentSearch')?.value;
    if (search) {
        filteredPayments = filteredPayments.filter(p => {
            const student = appState.students.find(s => s.id == p.student_id);
            const studentName = student ? `${student.first_name} ${student.last_name}`.toLowerCase() : '';
            return studentName.includes(search.toLowerCase());
        });
    }
    
    const typeFilter = document.getElementById('paymentTypeFilter')?.value;
    if (typeFilter) {
        filteredPayments = filteredPayments.filter(p => p.payment_type === typeFilter);
    }
    
    const methodFilter = document.getElementById('paymentMethodFilter')?.value;
    if (methodFilter) {
        filteredPayments = filteredPayments.filter(p => p.payment_method === methodFilter);
    }
    
    // Pagination
    const { current, perPage } = appState.pagination.payments;
    const start = (current - 1) * perPage;
    const end = start + perPage;
    const paginatedPayments = filteredPayments.slice(start, end);
    
    // Afficher
    if (paginatedPayments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">Aucun paiement trouvé</td></tr>';
    } else {
        tbody.innerHTML = paginatedPayments.map(payment => {
            const student = appState.students.find(s => s.id == payment.student_id);
            const studentName = student ? `${student.first_name} ${student.last_name}` : 'N/A';
            
            return `
                <tr>
                    <td><input type="checkbox" class="payment-checkbox" data-id="${payment.id}"></td>
                    <td>${payment.id}</td>
                    <td><strong>${studentName}</strong></td>
                    <td><strong style="color: var(--success-color);">${formatMoney(payment.amount)}</strong></td>
                    <td>${payment.payment_type || 'scolarité'}</td>
                    <td>${payment.payment_method || 'cash'}</td>
                    <td>${formatDate(payment.payment_date)}</td>
                    <td>${getStatusBadge(payment.status)}</td>
                    <td class="table-actions">
                        <button class="action-icon edit" onclick="editPayment(${payment.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-icon delete" onclick="deletePayment(${payment.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // Mise à jour des informations
    document.getElementById('paymentsShowing').textContent = paginatedPayments.length;
    document.getElementById('paymentsTotal').textContent = filteredPayments.length;
    
    // Pagination
    createPagination(filteredPayments.length, perPage, current, 'paymentsPagination', 'goToPaymentsPage');
}

function goToPaymentsPage(page) {
    appState.pagination.payments.current = page;
    renderPayments();
}

// Afficher les infos de paiement d'un étudiant
document.getElementById('paymentStudent')?.addEventListener('change', function() {
    const studentId = this.value;
    const infoDiv = document.getElementById('studentPaymentInfo');
    
    if (!studentId) {
        infoDiv.style.display = 'none';
        return;
    }
    
    const student = appState.students.find(s => s.id == studentId);
    if (student) {
        const balance = calculateStudentBalance(student, appState.payments);
        
        document.getElementById('studentTotalDue').textContent = formatMoney(balance.totalDue);
        document.getElementById('studentAlreadyPaid').textContent = formatMoney(balance.totalPaid);
        document.getElementById('studentRemaining').textContent = formatMoney(balance.balance);
        
        infoDiv.style.display = 'grid';
    }
});

function openPaymentModal(payment = null) {
    const modal = document.getElementById('paymentModal');
    const form = document.getElementById('paymentForm');
    const title = document.getElementById('paymentModalTitle');
    
    if (payment) {
        title.textContent = 'Modifier le paiement';
        document.getElementById('paymentId').value = payment.id;
        document.getElementById('paymentStudent').value = payment.student_id;
        document.getElementById('paymentStudent').dispatchEvent(new Event('change'));
        document.getElementById('paymentAmount').value = payment.amount;
        document.getElementById('paymentDate').value = payment.payment_date;
        document.getElementById('paymentType').value = payment.payment_type;
        document.getElementById('paymentMethod').value = payment.payment_method;
        document.getElementById('paymentNotes').value = payment.notes || '';
    } else {
        title.textContent = 'Nouveau Paiement';
        form.reset();
        document.getElementById('paymentId').value = '';
        document.getElementById('paymentDate').value = getTodayDate();
        document.getElementById('studentPaymentInfo').style.display = 'none';
    }
    
    openModal('paymentModal');
}

function editPayment(id) {
    const payment = appState.payments.find(p => p.id == id);
    if (payment) {
        openPaymentModal(payment);
    }
}

function deletePayment(id) {
    showConfirmModal('Êtes-vous sûr de vouloir supprimer ce paiement ?', async () => {
        try {
            await api.deletePayment(id);
            appState.payments = appState.payments.filter(p => p.id != id);
            renderPayments();
            calculatePaymentStats();
            showToast('Paiement supprimé avec succès', 'success');
        } catch (error) {
            showToast('Erreur lors de la suppression', 'error');
        }
    });
}

// ===== Expenses =====
async function loadExpenses() {
    try {
        showLoading('expensesTableBody');
        
        if (appState.expenses.length === 0) {
            appState.expenses = await api.getExpenses();
        }
        
        calculateExpenseStats();
        renderExpenses();
    } catch (error) {
        console.error('Error loading expenses:', error);
        showToast('Erreur lors du chargement des dépenses', 'error');
    }
}

function calculateExpenseStats() {
    const total = appState.expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const school = appState.expenses.filter(e => e.category === 'École').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const canteen = appState.expenses.filter(e => e.category === 'Cantine').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    
    document.getElementById('totalExpenses').textContent = formatMoney(total);
    document.getElementById('schoolExpenses').textContent = formatMoney(school);
    document.getElementById('canteenExpenses').textContent = formatMoney(canteen);
}

function renderExpenses() {
    const tbody = document.getElementById('expensesTableBody');
    let filteredExpenses = [...appState.expenses];
    
    // Appliquer les filtres
    const search = document.getElementById('expenseSearch')?.value;
    if (search) {
        filteredExpenses = searchInData(filteredExpenses, search, ['description', 'provider', 'category']);
    }
    
    const categoryFilter = document.getElementById('expenseCategoryFilter')?.value;
    if (categoryFilter) {
        filteredExpenses = filteredExpenses.filter(e => e.category === categoryFilter);
    }
    
    const statusFilter = document.getElementById('expenseStatusFilter')?.value;
    if (statusFilter) {
        filteredExpenses = filteredExpenses.filter(e => e.status === statusFilter);
    }
    
    // Pagination
    const { current, perPage } = appState.pagination.expenses;
    const start = (current - 1) * perPage;
    const end = start + perPage;
    const paginatedExpenses = filteredExpenses.slice(start, end);
    
    // Afficher
    if (paginatedExpenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">Aucune dépense trouvée</td></tr>';
    } else {
        tbody.innerHTML = paginatedExpenses.map(expense => `
            <tr>
                <td><input type="checkbox" class="expense-checkbox" data-id="${expense.id}"></td>
                <td>${expense.id}</td>
                <td><strong>${expense.description}</strong></td>
                <td>${expense.category || 'N/A'}</td>
                <td><strong style="color: var(--danger-color);">${formatMoney(expense.amount)}</strong></td>
                <td>${expense.provider || 'N/A'}</td>
                <td>${formatDate(expense.expense_date)}</td>
                <td>${getStatusBadge(expense.status || 'paid')}</td>
                <td class="table-actions">
                    <button class="action-icon edit" onclick="editExpense(${expense.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-icon delete" onclick="deleteExpense(${expense.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    // Mise à jour des informations
    document.getElementById('expensesShowing').textContent = paginatedExpenses.length;
    document.getElementById('expensesTotal').textContent = filteredExpenses.length;
    
    // Pagination
    createPagination(filteredExpenses.length, perPage, current, 'expensesPagination', 'goToExpensesPage');
}

function goToExpensesPage(page) {
    appState.pagination.expenses.current = page;
    renderExpenses();
}

function openExpenseModal(expense = null) {
    const modal = document.getElementById('expenseModal');
    const form = document.getElementById('expenseForm');
    const title = document.getElementById('expenseModalTitle');
    
    if (expense) {
        title.textContent = 'Modifier la dépense';
        document.getElementById('expenseId').value = expense.id;
        document.getElementById('expenseDescription').value = expense.description;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseDate').value = expense.expense_date;
        document.getElementById('expenseCategory').value = expense.category;
        document.getElementById('expensePaymentMethod').value = expense.payment_method || 'cash';
        document.getElementById('expenseProvider').value = expense.provider || '';
        document.getElementById('expenseInvoice').value = expense.invoice_number || '';
        document.getElementById('expenseNotes').value = expense.notes || '';
    } else {
        title.textContent = 'Nouvelle Dépense';
        form.reset();
        document.getElementById('expenseId').value = '';
        document.getElementById('expenseDate').value = getTodayDate();
    }
    
    openModal('expenseModal');
}

function editExpense(id) {
    const expense = appState.expenses.find(e => e.id == id);
    if (expense) {
        openExpenseModal(expense);
    }
}

function deleteExpense(id) {
    showConfirmModal('Êtes-vous sûr de vouloir supprimer cette dépense ?', async () => {
        try {
            await api.deleteExpense(id);
            appState.expenses = appState.expenses.filter(e => e.id != id);
            renderExpenses();
            calculateExpenseStats();
            showToast('Dépense supprimée avec succès', 'success');
        } catch (error) {
            showToast('Erreur lors de la suppression', 'error');
        }
    });
}

// ===== Reports =====
async function loadReports() {
    try {
        if (appState.students.length === 0 || appState.payments.length === 0 || appState.expenses.length === 0) {
            const stats = await api.getDashboardStats();
            appState.students = stats.students;
            appState.payments = stats.payments;
            appState.expenses = stats.expenses;
        }
        
        // Calculer les totaux
        const totalIncome = appState.payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const totalExpense = appState.expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const balance = totalIncome - totalExpense;
        
        document.getElementById('reportTotalIncome').textContent = formatMoney(totalIncome);
        document.getElementById('reportTotalExpense').textContent = formatMoney(totalExpense);
        document.getElementById('reportBalance').textContent = formatMoney(balance);
        document.getElementById('reportBalance').style.color = balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
        
        // Charger les graphiques
        loadReportCharts();
    } catch (error) {
        console.error('Error loading reports:', error);
        showToast('Erreur lors du chargement des rapports', 'error');
    }
}

function loadReportCharts() {
    // Graphique de répartition des élèves
    const studentsCtx = document.getElementById('studentsReportChart');
    if (studentsCtx) {
        const classCounts = {};
        appState.students.forEach(student => {
            const classLevel = student.class_level || 'Non défini';
            classCounts[classLevel] = (classCounts[classLevel] || 0) + 1;
        });
        
        new Chart(studentsCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(classCounts),
                datasets: [{
                    label: 'Nombre d\'élèves',
                    data: Object.values(classCounts),
                    backgroundColor: '#6366f1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Graphique mensuel
    const monthlyCtx = document.getElementById('monthlyReportChart');
    if (monthlyCtx) {
        const monthlyPayments = calculatePaymentsByMonth(appState.payments);
        const monthlyExpenses = {};
        
        appState.expenses.forEach(expense => {
            if (!expense.expense_date) return;
            const date = new Date(expense.expense_date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + parseFloat(expense.amount || 0);
        });
        
        const months = [...new Set([...Object.keys(monthlyPayments), ...Object.keys(monthlyExpenses)])].sort().slice(-12);
        
        new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: months.map(m => {
                    const [year, month] = m.split('-');
                    return new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
                }),
                datasets: [
                    {
                        label: 'Recettes',
                        data: months.map(m => monthlyPayments[m] || 0),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Dépenses',
                        data: months.map(m => monthlyExpenses[m] || 0),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatMoney(value);
                            }
                        }
                    }
                }
            }
        });
    }
}

// ===== Form Handlers =====
function initFormHandlers() {
    // Student Form
    document.getElementById('studentForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('studentId').value;
        const data = {
            last_name: document.getElementById('studentLastName').value,
            first_name: document.getElementById('studentFirstName').value,
            date_of_birth: document.getElementById('studentDob').value,
            gender: document.getElementById('studentGender').value,
            class_level: document.getElementById('studentClass').value,
            status: document.getElementById('studentStatus').value,
            parent_name: document.getElementById('parentName').value,
            parent_phone: document.getElementById('parentPhone').value,
            address: document.getElementById('studentAddress').value,
            is_school_student: document.getElementById('isSchoolStudent').checked ? 1 : 0,
            is_canteen_student: document.getElementById('isCanteenStudent').checked ? 1 : 0,
            is_dormitory_student: document.getElementById('isDormitoryStudent').checked ? 1 : 0
        };
        
        try {
            if (id) {
                await api.updateStudent(id, data);
                const index = appState.students.findIndex(s => s.id == id);
                if (index !== -1) {
                    appState.students[index] = { ...appState.students[index], ...data };
                }
                showToast('Élève modifié avec succès', 'success');
            } else {
                const newStudent = await api.createStudent(data);
                appState.students.push(newStudent);
                showToast('Élève ajouté avec succès', 'success');
            }
            
            closeModal('studentModal');
            renderStudents();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    // Teacher Form
    document.getElementById('teacherForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('teacherId').value;
        const data = {
            last_name: document.getElementById('teacherLastName').value,
            first_name: document.getElementById('teacherFirstName').value,
            date_of_birth: document.getElementById('teacherDob').value,
            gender: document.getElementById('teacherGender').value,
            subject: document.getElementById('teacherSubject').value,
            hire_date: document.getElementById('teacherHireDate').value,
            phone: document.getElementById('teacherPhone').value,
            email: document.getElementById('teacherEmail').value,
            salary: document.getElementById('teacherSalary').value,
            status: document.getElementById('teacherStatus').value,
            address: document.getElementById('teacherAddress').value
        };
        
        try {
            if (id) {
                await api.updateTeacher(id, data);
                const index = appState.teachers.findIndex(t => t.id == id);
                if (index !== -1) {
                    appState.teachers[index] = { ...appState.teachers[index], ...data };
                }
                showToast('Enseignant modifié avec succès', 'success');
            } else {
                const newTeacher = await api.createTeacher(data);
                appState.teachers.push(newTeacher);
                showToast('Enseignant ajouté avec succès', 'success');
            }
            
            closeModal('teacherModal');
            renderTeachers();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    // Payment Form
    document.getElementById('paymentForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('paymentId').value;
        const data = {
            student_id: document.getElementById('paymentStudent').value,
            amount: document.getElementById('paymentAmount').value,
            payment_date: document.getElementById('paymentDate').value,
            payment_type: document.getElementById('paymentType').value,
            payment_method: document.getElementById('paymentMethod').value,
            notes: document.getElementById('paymentNotes').value,
            status: 'completed'
        };
        
        try {
            if (id) {
                await api.updatePayment(id, data);
                const index = appState.payments.findIndex(p => p.id == id);
                if (index !== -1) {
                    appState.payments[index] = { ...appState.payments[index], ...data };
                }
                showToast('Paiement modifié avec succès', 'success');
            } else {
                const newPayment = await api.createPayment(data);
                appState.payments.push(newPayment);
                showToast('Paiement enregistré avec succès', 'success');
            }
            
            closeModal('paymentModal');
            renderPayments();
            calculatePaymentStats();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    // Expense Form
    document.getElementById('expenseForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('expenseId').value;
        const data = {
            description: document.getElementById('expenseDescription').value,
            amount: document.getElementById('expenseAmount').value,
            expense_date: document.getElementById('expenseDate').value,
            category: document.getElementById('expenseCategory').value,
            payment_method: document.getElementById('expensePaymentMethod').value,
            provider: document.getElementById('expenseProvider').value,
            invoice_number: document.getElementById('expenseInvoice').value,
            notes: document.getElementById('expenseNotes').value,
            status: 'paid'
        };
        
        try {
            if (id) {
                await api.updateExpense(id, data);
                const index = appState.expenses.findIndex(e => e.id == id);
                if (index !== -1) {
                    appState.expenses[index] = { ...appState.expenses[index], ...data };
                }
                showToast('Dépense modifiée avec succès', 'success');
            } else {
                const newExpense = await api.createExpense(data);
                appState.expenses.push(newExpense);
                showToast('Dépense enregistrée avec succès', 'success');
            }
            
            closeModal('expenseModal');
            renderExpenses();
            calculateExpenseStats();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

// ===== Filter Handlers =====
function initFilterHandlers() {
    // Students filters
    document.getElementById('studentSearch')?.addEventListener('input', debounce(() => {
        appState.pagination.students.current = 1;
        renderStudents();
    }, 300));
    
    document.getElementById('classFilter')?.addEventListener('change', () => {
        appState.pagination.students.current = 1;
        renderStudents();
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', () => {
        appState.pagination.students.current = 1;
        renderStudents();
    });
    
    // Teachers filters
    document.getElementById('teacherSearch')?.addEventListener('input', debounce(() => {
        appState.pagination.teachers.current = 1;
        renderTeachers();
    }, 300));
    
    document.getElementById('subjectFilter')?.addEventListener('change', () => {
        appState.pagination.teachers.current = 1;
        renderTeachers();
    });
    
    document.getElementById('teacherStatusFilter')?.addEventListener('change', () => {
        appState.pagination.teachers.current = 1;
        renderTeachers();
    });
    
    // Payments filters
    document.getElementById('paymentSearch')?.addEventListener('input', debounce(() => {
        appState.pagination.payments.current = 1;
        renderPayments();
    }, 300));
    
    document.getElementById('paymentTypeFilter')?.addEventListener('change', () => {
        appState.pagination.payments.current = 1;
        renderPayments();
    });
    
    document.getElementById('paymentMethodFilter')?.addEventListener('change', () => {
        appState.pagination.payments.current = 1;
        renderPayments();
    });
    
    // Expenses filters
    document.getElementById('expenseSearch')?.addEventListener('input', debounce(() => {
        appState.pagination.expenses.current = 1;
        renderExpenses();
    }, 300));
    
    document.getElementById('expenseCategoryFilter')?.addEventListener('change', () => {
        appState.pagination.expenses.current = 1;
        renderExpenses();
    });
    
    document.getElementById('expenseStatusFilter')?.addEventListener('change', () => {
        appState.pagination.expenses.current = 1;
        renderExpenses();
    });
}

// ===== Sidebar =====
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleMobileSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// ===== Logout =====
function logout() {
    showConfirmModal('Êtes-vous sûr de vouloir vous déconnecter ?', () => {
        api.logout();
        location.reload();
    });
}

// ===== Global Search =====
function handleGlobalSearch(term) {
    if (!term) return;
    
    const results = [];
    
    // Rechercher dans les étudiants
    appState.students.forEach(student => {
        const searchStr = `${student.first_name} ${student.last_name} ${student.class_level}`.toLowerCase();
        if (searchStr.includes(term.toLowerCase())) {
            results.push({ type: 'student', data: student });
        }
    });
    
    // Rechercher dans les enseignants
    appState.teachers.forEach(teacher => {
        const searchStr = `${teacher.first_name} ${teacher.last_name} ${teacher.subject}`.toLowerCase();
        if (searchStr.includes(term.toLowerCase())) {
            results.push({ type: 'teacher', data: teacher });
        }
    });
    
    console.log('Search results:', results);
    // TODO: Afficher les résultats dans un dropdown
}

// ===== Export Functions =====
function exportData(type) {
    let data, filename;
    
    switch (type) {
        case 'students':
            data = appState.students;
            filename = 'eleves';
            break;
        case 'teachers':
            data = appState.teachers;
            filename = 'enseignants';
            break;
        case 'payments':
            data = appState.payments;
            filename = 'paiements';
            break;
        case 'expenses':
            data = appState.expenses;
            filename = 'depenses';
            break;
        case 'all':
            data = {
                students: appState.students,
                teachers: appState.teachers,
                payments: appState.payments,
                expenses: appState.expenses
            };
            filename = 'toutes_donnees';
            exportToJSON(data, filename);
            return;
    }
    
    exportToCSV(data, filename);
}

function generateReport(type) {
    // TODO: Implémenter la génération de rapports PDF
    showToast('Génération du rapport en cours...', 'info');
}

function exportReport(type) {
    // TODO: Implémenter l'export de rapports
    showToast('Export du rapport en cours...', 'info');
}

// ===== Backup =====
async function backupDatabase() {
    try {
        showToast('Sauvegarde en cours...', 'info');
        await api.createBackup();
        showToast('Sauvegarde créée avec succès', 'success');
    } catch (error) {
        showToast('Erreur lors de la sauvegarde', 'error');
    }
}

// ===== Settings =====
async function loadSettings() {
    try {
        // Charger les paramètres de l'utilisateur actuel
        const currentUser = getCurrentUser();
        if (currentUser) {
            document.getElementById('profileName').value = currentUser.username || '';
            document.getElementById('profileEmail').value = currentUser.email || '';
        }
        
        // Charger les paramètres système depuis le localStorage
        const schoolName = localStorage.getItem('schoolName') || 'Mon École';
        const schoolPhone = localStorage.getItem('schoolPhone') || '';
        const schoolEmail = localStorage.getItem('schoolEmail') || '';
        const schoolAddress = localStorage.getItem('schoolAddress') || '';
        const currency = localStorage.getItem('currency') || 'XAF';
        const language = localStorage.getItem('language') || 'fr';
        const theme = localStorage.getItem('theme') || 'light';
        
        document.getElementById('schoolName').value = schoolName;
        document.getElementById('schoolPhone').value = schoolPhone;
        document.getElementById('schoolEmail').value = schoolEmail;
        document.getElementById('schoolAddress').value = schoolAddress;
        document.getElementById('currency').value = currency;
        document.getElementById('language').value = language;
        document.getElementById('theme').value = theme;
        
        // Activé le premier onglet par défaut
        document.querySelector('.settings-nav li[data-settings="profile"]')?.click();
        
    } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Erreur lors du chargement des paramètres', 'error');
    }
}

// Sauvegarder le profil utilisateur
async function saveProfile() {
    try {
        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!name.trim()) {
            showToast('Le nom est obligatoire', 'error');
            return;
        }
        
        if (newPassword && newPassword !== confirmPassword) {
            showToast('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        
        // TODO: Appel API pour mettre à jour le profil
        // await api.updateProfile({ name, email, currentPassword, newPassword });
        
        showToast('Profil mis à jour avec succès', 'success');
        
        // Effacer les champs de mot de passe
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
    } catch (error) {
        showToast('Erreur lors de la mise à jour du profil', 'error');
    }
}

// Sauvegarder les paramètres système
async function saveSystemSettings() {
    try {
        const schoolName = document.getElementById('schoolName').value;
        const schoolPhone = document.getElementById('schoolPhone').value;
        const schoolEmail = document.getElementById('schoolEmail').value;
        const schoolAddress = document.getElementById('schoolAddress').value;
        const currency = document.getElementById('currency').value;
        const language = document.getElementById('language').value;
        const theme = document.getElementById('theme').value;
        
        // Sauvegarder dans localStorage
        localStorage.setItem('schoolName', schoolName);
        localStorage.setItem('schoolPhone', schoolPhone);
        localStorage.setItem('schoolEmail', schoolEmail);
        localStorage.setItem('schoolAddress', schoolAddress);
        localStorage.setItem('currency', currency);
        localStorage.setItem('language', language);
        localStorage.setItem('theme', theme);
        
        // Appliquer le thème immédiatement
        applyTheme(theme);
        
        showToast('Paramètres système sauvegardés', 'success');
        
    } catch (error) {
        showToast('Erreur lors de la sauvegarde', 'error');
    }
}

// Gestion de la navigation dans les paramètres
document.querySelectorAll('.settings-nav li').forEach(item => {
    item.addEventListener('click', function() {
        const setting = this.dataset.settings;
        
        document.querySelectorAll('.settings-nav li').forEach(li => li.classList.remove('active'));
        this.classList.add('active');
        
        document.querySelectorAll('.settings-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${setting}Settings`)?.classList.add('active');
    });
});
