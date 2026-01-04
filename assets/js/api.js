// ===================================
// API Service - Gestion des appels API
// ===================================

// URL de base de l'API - Configuration pour WAMP
const API_BASE_URL = 'http://localhost/PROJETS/gestion_ecole/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.baseURL = API_BASE_URL;
    }

    // Configuration des headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Gestion des erreurs
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (!response.ok) {
            let error = { error: 'Une erreur est survenue' };
            
            try {
                if (contentType && contentType.includes('application/json')) {
                    error = await response.json();
                } else {
                    // Si ce n'est pas du JSON, c'est probablement une erreur HTML
                    const text = await response.text();
                    error = { error: `Erreur serveur (${response.status}): Réponse non-JSON reçue` };
                }
            } catch (parseError) {
                error = { error: `Erreur serveur (${response.status})` };
            }
            
            throw new Error(error.error || error.message || 'Une erreur est survenue');
        }
        
        try {
            return await response.json();
        } catch (parseError) {
            throw new Error('Réponse invalide du serveur');
        }
    }

    // Méthode générique pour les requêtes
    async request(endpoint, options = {}) {
        try {
            // Construire l'URL avec des paramètres GET
            const url = `${this.baseURL}/index.php?route=${endpoint}`;
            const config = {
                ...options,
                headers: this.getHeaders(),
            };

            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // GET
    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET',
        });
    }

    // POST
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }

    // ===== Authentication =====
    async login(username, password) {
        try {
            const response = await this.post('login', { username, password });
            if (response.token) {
                this.token = response.token;
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('currentUser', JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }

    isAuthenticated() {
        return !!this.token;
    }

    // ===== Students =====
    async getStudents() {
        const response = await this.get('students');
        return response.data || response;
    }

    async getStudent(id) {
        return this.get(`students/${id}`);
    }

    async createStudent(data) {
        return this.post('students', data);
    }

    async updateStudent(id, data) {
        return this.put(`students/${id}`, data);
    }

    async deleteStudent(id) {
        return this.delete(`students/${id}`);
    }

    // ===== Teachers =====
    async getTeachers() {
        const response = await this.get('teachers');
        return response.data || response;
    }

    async getTeacher(id) {
        return this.get(`teachers/${id}`);
    }

    async createTeacher(data) {
        return this.post('teachers', data);
    }

    async updateTeacher(id, data) {
        return this.put(`teachers/${id}`, data);
    }

    async deleteTeacher(id) {
        return this.delete(`teachers/${id}`);
    }

    // ===== Payments =====
    async getPayments() {
        const response = await this.get('payments');
        return response.data || response;
    }

    async getPayment(id) {
        return this.get(`payments/${id}`);
    }

    async createPayment(data) {
        return this.post('payments', data);
    }

    async updatePayment(id, data) {
        return this.put(`payments/${id}`, data);
    }

    async deletePayment(id) {
        return this.delete(`payments/${id}`);
    }

    async getStudentPayments(studentId) {
        const payments = await this.getPayments();
        return payments.filter(p => p.student_id === studentId);
    }

    // ===== Expenses =====
    async getExpenses() {
        const response = await this.get('depenses');
        return response.data || response; // Extraire data si présent
    }

    async getExpense(id) {
        return this.get(`depenses/${id}`);
    }

    async createExpense(data) {
        return this.post('depenses', data);
    }

    async updateExpense(id, data) {
        return this.put(`depenses/${id}`, data);
    }

    async deleteExpense(id) {
        return this.delete(`depenses/${id}`);
    }

    // ===== Backup =====
    async createBackup() {
        return this.post('sauvegarde', {});
    }

    // ===== Dashboard Statistics =====
    async getDashboardStats() {
        try {
            const [students, teachers, payments, expenses] = await Promise.all([
                this.getStudents(),
                this.getTeachers(),
                this.getPayments(),
                this.getExpenses()
            ]);

            // Calcul des statistiques
            const totalStudents = students.length;
            const totalTeachers = teachers.length;
            
            // Calcul des paiements
            const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
            const completedPayments = payments.filter(p => p.status === 'completed');
            const totalReceived = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
            
            // Calcul des arriérés
            const totalDue = students.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
            const pendingPayments = totalDue - totalReceived;
            
            // Calcul des dépenses
            const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
            
            return {
                totalStudents,
                totalTeachers,
                totalPayments: totalReceived,
                pendingPayments,
                totalExpenses,
                students,
                teachers,
                payments,
                expenses
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                totalStudents: 0,
                totalTeachers: 0,
                totalPayments: 0,
                pendingPayments: 0,
                totalExpenses: 0,
                students: [],
                teachers: [],
                payments: [],
                expenses: []
            };
        }
    }
}

// Instance globale de l'API
const api = new ApiService();
