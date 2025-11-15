// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1001/api';

// API Service
class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Set authorization token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Remove token
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get authorization headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Check if response is ok first
      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If JSON parse fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Try to parse JSON response
      try {
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to parse JSON response:', error);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // PUT request
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ==================== AUTH API ====================
  
  async login(email, password, recaptchaToken = null) {
    const payload = { email, password };
    if (recaptchaToken) {
      payload.recaptchaToken = recaptchaToken;
    }
    const response = await this.post('/auth/login', payload);
    if (response.success && response.data.accessToken) {
      this.setToken(response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  }

  async register(email, password, role, userId, recaptchaToken = null) {
    const payload = { email, password, role, userId };
    if (recaptchaToken) {
      payload.recaptchaToken = recaptchaToken;
    }
    return this.post('/auth/register', payload);
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await this.post('/auth/logout', { refreshToken });
    } finally {
      this.clearToken();
    }
  }

  async changePassword(currentPassword, newPassword) {
    return this.post('/auth/change-password', { currentPassword, newPassword });
  }

  // ==================== USER API ====================

  // Admins
  async getAdmins() {
    return this.get('/users/admins');
  }

  async getAdminById(id) {
    return this.get(`/users/admins/${id}`);
  }

  async createAdmin(data) {
    return this.post('/users/admins', data);
  }

  async updateAdmin(id, data) {
    return this.put(`/users/admins/${id}`, data);
  }

  async deleteAdmin(id) {
    return this.delete(`/users/admins/${id}`);
  }

  // Instructors
  async getInstructors() {
    return this.get('/users/instructors');
  }

  async getInstructorById(id) {
    return this.get(`/users/instructors/${id}`);
  }

  async createInstructor(data) {
    return this.post('/users/instructors', data);
  }

  async updateInstructor(id, data) {
    return this.put(`/users/instructors/${id}`, data);
  }

  async deleteInstructor(id) {
    return this.delete(`/users/instructors/${id}`);
  }

  // Students
  async getStudents() {
    return this.get('/users/students');
  }

  async getStudentById(id) {
    return this.get(`/users/students/${id}`);
  }

  async createStudent(data) {
    return this.post('/users/students', data);
  }

  async updateStudent(id, data) {
    return this.put(`/users/students/${id}`, data);
  }

  async deleteStudent(id) {
    return this.delete(`/users/students/${id}`);
  }

  // ==================== COURSE API ====================

  async getCourses() {
    return this.get('/courses');
  }

  async getCourseById(id) {
    return this.get(`/courses/${id}`);
  }

  async createCourse(data) {
    return this.post('/courses', data);
  }

  async updateCourse(id, data) {
    return this.put(`/courses/${id}`, data);
  }

  async deleteCourse(id) {
    return this.delete(`/courses/${id}`);
  }

  // Sections
  async getCourseSections(courseId) {
    return this.get(`/courses/${courseId}/sections`);
  }

  async createSection(courseId, data) {
    return this.post(`/courses/${courseId}/sections`, data);
  }

  async updateSection(courseId, sectionId, data) {
    return this.put(`/courses/${courseId}/sections/${sectionId}`, data);
  }

  async deleteSection(courseId, sectionId) {
    return this.delete(`/courses/${courseId}/sections/${sectionId}`);
  }

  // Enrollments
  async getEnrollments() {
    return this.get('/courses/enrollments');
  }

  async getStudentEnrollments(studentId) {
    return this.get(`/courses/enrollments/student/${studentId}`);
  }

  async enrollStudent(data) {
    return this.post('/courses/enrollments', data);
  }

  async updateEnrollment(id, data) {
    return this.put(`/courses/enrollments/${id}`, data);
  }

  async deleteEnrollment(id) {
    return this.delete(`/courses/enrollments/${id}`);
  }

  // ==================== CONTENT API ====================

  // Announcements
  async getAnnouncements(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.get(`/content/announcements${query ? '?' + query : ''}`);
  }

  async createAnnouncement(data) {
    return this.post('/content/announcements', data);
  }

  async updateAnnouncement(id, data) {
    return this.put(`/content/announcements/${id}`, data);
  }

  async deleteAnnouncement(id) {
    return this.delete(`/content/announcements/${id}`);
  }

  // Modules
  async getCourseModules(courseId) {
    return this.get(`/content/courses/${courseId}/modules`);
  }

  async createModule(data) {
    return this.post('/content/modules', data);
  }

  async updateModule(id, data) {
    return this.put(`/content/modules/${id}`, data);
  }

  async deleteModule(id) {
    return this.delete(`/content/modules/${id}`);
  }

  // Lessons
  async getModuleLessons(moduleId) {
    return this.get(`/content/modules/${moduleId}/lessons`);
  }

  async createLesson(data) {
    return this.post('/content/lessons', data);
  }

  async updateLesson(id, data) {
    return this.put(`/content/lessons/${id}`, data);
  }

  async deleteLesson(id) {
    return this.delete(`/content/lessons/${id}`);
  }

  // ==================== ASSESSMENT API ====================

  // Activities
  async getCourseActivities(courseId) {
    return this.get(`/assessments/courses/${courseId}/activities`);
  }

  async getActivityById(id) {
    return this.get(`/assessments/activities/${id}`);
  }

  async createActivity(data) {
    // Route expects: /assessments/courses/:courseId/activities
    const { courseId, ...activityData } = data;
    return this.post(`/assessments/courses/${courseId}/activities`, activityData);
  }

  async updateActivity(id, data) {
    return this.put(`/assessments/activities/${id}`, data);
  }

  async deleteActivity(id) {
    return this.delete(`/assessments/activities/${id}`);
  }

  // Submissions
  async getActivitySubmissions(activityId) {
    return this.get(`/assessments/activities/${activityId}/submissions`);
  }

  async getStudentSubmissions(studentId) {
    return this.get(`/assessments/submissions/student/${studentId}`);
  }

  async createSubmission(data) {
    return this.post('/assessments/submissions', data);
  }

  async gradeSubmission(id, data) {
    return this.put(`/assessments/submissions/${id}/grade`, data);
  }

  // ==================== REPORT API ====================

  async getStudentProgress(studentId) {
    return this.get(`/reports/students/${studentId}/progress`);
  }

  async getStudentGrades(studentId, courseId = null) {
    const query = courseId ? `?courseId=${courseId}` : '';
    return this.get(`/reports/students/${studentId}/grades${query}`);
  }

  async getInstructorPerformance(instructorId) {
    return this.get(`/reports/instructors/${instructorId}/performance`);
  }

  async getCourseStatistics(courseId) {
    return this.get(`/reports/courses/${courseId}/statistics`);
  }

  async getDashboardOverview() {
    return this.get('/reports/dashboard/overview');
  }

  // Attendance
  async recordAttendance(data) {
    return this.post('/reports/attendance', data);
  }

  async getCourseAttendance(courseId, sectionId = null) {
    const query = sectionId ? `?sectionId=${sectionId}` : '';
    return this.get(`/reports/attendance/course/${courseId}${query}`);
  }

  async getStudentAttendance(studentId, courseId = null) {
    const query = courseId ? `?courseId=${courseId}` : '';
    return this.get(`/reports/attendance/student/${studentId}${query}`);
  }
}

// Export singleton instance
const api = new APIService();
export default api;
