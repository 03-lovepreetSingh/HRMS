const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

class ApiClient {
    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        try {
            console.log(`[API] ${options.method || 'GET'} ${API_URL}${endpoint}`);
            
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers,
                },
            });

            const data = await response.json();
            
            console.log(`[API] Response:`, data);
            
            // Handle 401 Unauthorized - redirect to login
            if (response.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            
            return data;
        } catch (error) {
            console.error(`[API] Error:`, error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to connect to server',
                },
            };
        }
    }

    // Auth
    async login(email: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async changePassword(oldPassword: string, newPassword: string) {
        return this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ oldPassword, newPassword }),
        });
    }

    // Departments
    async getDepartments() {
        return this.request('/departments');
    }

    async createDepartment(data: { name: string; description?: string }) {
        return this.request('/departments', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateDepartment(id: string, data: { name: string; description?: string }) {
        return this.request(`/departments/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    // Designations
    async getDesignations() {
        return this.request('/designations');
    }

    async createDesignation(data: { title: string; description?: string; level?: string }) {
        return this.request('/designations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Employees
    async getEmployees() {
        return this.request('/employees');
    }

    async getEmployee(id: string) {
        return this.request(`/employees/${id}`);
    }

    async createEmployee(data: any) {
        return this.request('/employees', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Attendance
    async punchIn(employeeId: string) {
        return this.request('/attendance/punch-in', {
            method: 'POST',
            body: JSON.stringify({ employeeId }),
        });
    }

    async punchOut(employeeId: string) {
        return this.request('/attendance/punch-out', {
            method: 'POST',
            body: JSON.stringify({ employeeId }),
        });
    }

    async getAttendanceSummary(employeeId: string, year: number, month: number) {
        return this.request(`/attendance/summary/${employeeId}/${year}/${month}`);
    }

    // Leave
    async getLeaveTypes() {
        return this.request('/leave/types');
    }

    async createLeaveType(data: { name: string; daysAllowed: number; description?: string }) {
        return this.request('/leave/types', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getLeaveRequests() {
        return this.request('/leave/requests');
    }

    async createLeaveRequest(data: {
        employeeId: string;
        leaveTypeId: string;
        startDate: string;
        endDate: string;
        reason: string;
    }) {
        return this.request('/leave/requests', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getLeaveBalance(employeeId: string) {
        return this.request(`/leave/balance/${employeeId}`);
    }

    async approveLeave(id: string) {
        return this.request(`/leave/requests/${id}/approve`, {
            method: 'POST',
        });
    }

    async rejectLeave(id: string, reason: string) {
        return this.request(`/leave/requests/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    }

    // Payroll
    async getSalaries() {
        return this.request('/payroll/salaries');
    }

    async createSalary(data: any) {
        return this.request('/payroll/salaries', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async generatePayroll(data: { month: number; year: number }) {
        return this.request('/payroll/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Performance
    async getReviewCycles() {
        return this.request('/performance/cycles');
    }

    async createReviewCycle(data: {
        name: string;
        startDate: string;
        endDate: string;
        description?: string;
    }) {
        return this.request('/performance/cycles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getPerformanceReviews() {
        return this.request('/performance/reviews');
    }

    async createPerformanceReview(data: any) {
        return this.request('/performance/reviews', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Tickets
    async getTickets() {
        return this.request('/tickets');
    }

    async createTicket(data: {
        employeeId: string;
        subject: string;
        description: string;
        priority: string;
        category: string;
    }) {
        return this.request('/tickets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Notifications
    async getNotifications() {
        return this.request('/notifications');
    }
}

export const api = new ApiClient();
