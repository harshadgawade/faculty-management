// frontend/assets/js/api.js
const API_BASE = "/api";
const TOKEN_KEY = "fms_access_token";

async function request(url, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
    if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY); localStorage.removeItem("user");
        window.location.href = "/login.html"; return;
    }
    const type = response.headers.get("content-type") || "";
    const data = type.includes("application/json") ? await response.json() : await response.text();
    if (!response.ok) throw new Error(typeof data === "object" ? (data.message || data.error || data.detail || `Request failed (${response.status})`) : (data || `Request failed (${response.status})`));
    return data;
}

const Auth = {
    async sendOTP(email) { return request("/auth/send-otp", { method: "POST", body: JSON.stringify({ email }) }); },
    async verifyOTP(email, otp) {
        const data = await request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, otp }) });
        if (data?.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
        if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
        else if (data?.email || data?.role || data?.fullName) localStorage.setItem("user", JSON.stringify({email:data.email,role:data.role,fullName:data.fullName}));
        return data;
    },
    logout() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem("user"); window.location.href="/login.html"; },
    isLoggedIn() { return !!localStorage.getItem(TOKEN_KEY); },
    getToken() { return localStorage.getItem(TOKEN_KEY); },
    getUser() { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } }
};

const Api = {
    dashboardStats: () => request("/dashboard/stats"),
    getFaculty: (params="") => request(`/faculty${params}`),
    getFacultyById: id => request(`/faculty/${id}`),
    createFaculty: data => request("/faculty", {method:"POST",body:JSON.stringify(data)}),
    updateFaculty: (id,data) => request(`/faculty/${id}`, {method:"PUT",body:JSON.stringify(data)}),
    deleteFaculty: id => request(`/faculty/${id}`, {method:"DELETE"}),
    markAttendance: data => request("/attendance", {method:"POST",body:JSON.stringify(data)}),
    updateAttendance: (id,data) => request(`/attendance/${id}`, {method:"PUT",body:JSON.stringify(data)}),
    monthlyAttendance: (facultyId,year,month) => request(`/attendance/monthly?facultyId=${encodeURIComponent(facultyId)}&year=${year}&month=${month}`),
    applyLeave: data => request("/leaves", {method:"POST",body:JSON.stringify(data)}),
    getLeaves: (facultyId,page=0,size=50) => request(`/leaves?facultyId=${facultyId}&page=${page}&size=${size}`),
    pendingLeaves: () => request("/leaves/pending?page=0&size=50"),
    approveLeave: id => request(`/leaves/${id}/approve`, {method:"POST"}),
    rejectLeave: id => request(`/leaves/${id}/reject`, {method:"POST"}),
    departments: () => request("/departments"), roles: () => request("/roles"),
    calendar: () => request("/calendar"),
    createCalendar: data => request("/calendar",{method:"POST",body:JSON.stringify(data)}),
    updateCalendar: (id,data) => request(`/calendar/${id}`,{method:"PUT",body:JSON.stringify(data)}),
    deleteCalendar: id => request(`/calendar/${id}`,{method:"DELETE"}),
    tasks: () => request("/tasks"),
    createTask: data => request("/tasks",{method:"POST",body:JSON.stringify(data)}),
    updateTask: (id,data) => request(`/tasks/${id}`,{method:"PUT",body:JSON.stringify(data)}),
    deleteTask: id => request(`/tasks/${id}`,{method:"DELETE"}),
    announcements: () => request("/announcements"),
    createAnnouncement: data => request("/announcements",{method:"POST",body:JSON.stringify(data)}),
    deleteAnnouncement: id => request(`/announcements/${id}`,{method:"DELETE"}),
    lectures: () => request("/lectures"),
    lecturePunchIn: data => request("/lectures/punch-in",{method:"POST",body:JSON.stringify(data)}),
    lecturePunchOut: id => request(`/lectures/${id}/punch-out`,{method:"POST"}),
    payroll: month => request(month ? `/payroll?month=${month}` : "/payroll"),
    runPayroll: month => request(`/payroll/run?month=${month}`,{method:"POST"}),
    markPaid: id => request(`/payroll/${id}/mark-paid`,{method:"POST"})
};
window.Api=Api; window.Auth=Auth;
