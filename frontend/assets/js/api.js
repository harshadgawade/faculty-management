// frontend/assets/js/api.js

const API_BASE = "/api";
const TOKEN_KEY = "fms_access_token";

async function request(url, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

    // 401 = login/session is invalid. 403 = user is authenticated but does
    // not have permission; keep the user on the current tab and show the API error.
    if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
        window.location.href = "/login.html";
        return;
    }

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        throw new Error(
            typeof data === "object"
                ? data.detail || data.message || data.error || `Request failed (${response.status})`
                : data || `Request failed (${response.status})`
        );
    }
    return data;
}

const Auth = {
    async sendOTP(email) {
        return request("/auth/send-otp", { method: "POST", body: JSON.stringify({ email }) });
    },

    async verifyOTP(email, otp) {
        const data = await request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, otp }) });
        if (data?.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
        if (data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        } else if (data?.email || data?.role || data?.fullName) {
            localStorage.setItem("user", JSON.stringify({ email: data.email, role: data.role, fullName: data.fullName }));
        }
        return data;
    },

    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
        localStorage.removeItem("fms_user_name");
        localStorage.removeItem("fms_user_role");
        localStorage.removeItem("fms_user_email");
        window.location.href = "/login.html";
    },
    isLoggedIn() { return !!localStorage.getItem(TOKEN_KEY); },
    getToken() { return localStorage.getItem(TOKEN_KEY); },
    getUser() {
        try { const u=localStorage.getItem("user"); return u ? JSON.parse(u) : null; }
        catch (_) { return null; }
    }
};

const Api = {
    dashboardStats() { return request("/dashboard/stats"); },
    getFaculty(params = "") { return request(`/faculty${params}`); },

    createFaculty(faculty) {
        const dto = { ...faculty };
        if (!dto.roleId) {
            const d = String(dto.designation || '').toLowerCase();
            dto.roleId = d.includes('associate') ? '5' : d.includes('assistant') ? '6' : d.includes('guest') ? '7' : '4';
        }
        return request("/faculty", { method: "POST", body: JSON.stringify(dto) });
    },
    updateFaculty(id, faculty) { return request(`/faculty/${id}`, { method: "PUT", body: JSON.stringify(faculty) }); },
    deleteFaculty(id) { return request(`/faculty/${id}`, { method: "DELETE" }); },

    markAttendance(data) { return request("/attendance", { method: "POST", body: JSON.stringify(data) }); },
    updateAttendance(id, data) { return request(`/attendance/${id}`, { method: "PUT", body: JSON.stringify(data) }); },
    monthlyAttendance(facultyId, year, month) {
        const picker = document.getElementById("attMonthPicker");
        if (picker?.value) {
            const [py, pm] = picker.value.split('-').map(Number);
            if (py && pm) { year = py; month = pm; }
        }
        const params = new URLSearchParams({ facultyId: String(facultyId), year: String(year), month: String(month) });
        return request(`/attendance/monthly?${params.toString()}`);
    },

    applyLeave(data) { return request("/leaves", { method: "POST", body: JSON.stringify(data) }); },
    getLeaves(facultyId, page=0, size=20) {
        const p=new URLSearchParams({facultyId:String(facultyId),page:String(page),size:String(size)});
        return request(`/leaves?${p.toString()}`);
    },
    pendingLeaves() { return request("/leaves/pending?page=0&size=50"); },
    approveLeave(id, remarks=null) { return request(`/leaves/${id}/approve`, { method:"POST", body:remarks?JSON.stringify({remarks}):undefined }); },
    rejectLeave(id, remarks=null) { return request(`/leaves/${id}/reject`, { method:"POST", body:remarks?JSON.stringify({remarks}):undefined }); }
};

window.Api = Api;
window.Auth = Auth;
