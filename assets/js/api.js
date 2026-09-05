// frontend/assets/js/api.js

const API_BASE = "/api";

async function request(url, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login.html";
        return;
    }

    const contentType = response.headers.get("content-type");

    let data;
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        throw new Error(
            typeof data === "object"
                ? data.detail || data.message || "API request failed"
                : data || "API request failed"
        );
    }

    return data;
}


// =========================
// AUTH
// =========================

const Auth = {

    async sendOTP(email) {
        return request("/auth/send-otp", {
            method: "POST",
            body: JSON.stringify({
                email: email
            })
        });
    },

    async verifyOTP(email, otp) {
        const data = await request("/auth/verify-otp", {
            method: "POST",
            body: JSON.stringify({
                email: email,
                otp: otp
            })
        });

        // JWT save
        if (data.token) {
            localStorage.setItem("token", data.token);
        }

        // User information save
        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }

        return data;
    },

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login.html";
    },

    isLoggedIn() {
        return !!localStorage.getItem("token");
    },

    getToken() {
        return localStorage.getItem("token");
    },

    getUser() {
        const user = localStorage.getItem("user");

        try {
            return user ? JSON.parse(user) : null;
        } catch (error) {
            return null;
        }
    }
};


// =========================
// API
// =========================

const Api = {

    // Dashboard
    dashboardStats() {
        return request("/dashboard/stats");
    },


    // Faculty
    getFaculty(params = "") {
        return request(`/faculty${params}`);
    },

    createFaculty(faculty) {
        return request("/faculty", {
            method: "POST",
            body: JSON.stringify(faculty)
        });
    },

    updateFaculty(id, faculty) {
        return request(`/faculty/${id}`, {
            method: "PUT",
            body: JSON.stringify(faculty)
        });
    },

    deleteFaculty(id) {
        return request(`/faculty/${id}`, {
            method: "DELETE"
        });
    },


    // Attendance
    markAttendance(data) {
        return request("/attendance", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    monthlyAttendance() {
        return request("/attendance/monthly");
    },


    // Leave
    applyLeave(data) {
        return request("/leaves", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    pendingLeaves() {
        return request("/leaves/pending");
    },

    approveLeave(id) {
        return request(`/leaves/${id}/approve`, {
            method: "POST"
        });
    },

    rejectLeave(id) {
        return request(`/leaves/${id}/reject`, {
            method: "POST"
        });
    }
};


// Make available globally
window.Api = Api;
window.Auth = Auth;
