// FMS API client
const API_BASE = "/api";
const TOKEN_KEY = "fms_access_token";

async function request(url, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { ...(options.body ? {"Content-Type":"application/json"} : {}), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY); localStorage.removeItem("user");
    window.location.href = "/login.html"; return;
  }
  const type = response.headers.get("content-type") || "";
  const data = response.status === 204 ? null : (type.includes("application/json") ? await response.json() : await response.text());
  if (!response.ok) throw new Error(typeof data === "object" ? (data.detail || data.message || data.error || `Request failed (${response.status})`) : (data || `Request failed (${response.status})`));
  return data;
}

const Auth = {
  async sendOTP(email){ return request("/auth/send-otp",{method:"POST",body:JSON.stringify({email})}); },
  async verifyOTP(email,otp){ const d=await request("/auth/verify-otp",{method:"POST",body:JSON.stringify({email,otp})}); if(d?.accessToken)localStorage.setItem(TOKEN_KEY,d.accessToken); if(d)localStorage.setItem("user",JSON.stringify(d)); return d; },
  async signup(data){ return request("/auth/signup",{method:"POST",body:JSON.stringify(data)}); },
  logout(){localStorage.removeItem(TOKEN_KEY);localStorage.removeItem("user");window.location.href="/login.html";},
  isLoggedIn(){return !!localStorage.getItem(TOKEN_KEY);},
  getToken(){return localStorage.getItem(TOKEN_KEY);},
  getUser(){try{return JSON.parse(localStorage.getItem("user")||"null");}catch{return null;}}
};

const Api = {
  dashboardStats:()=>request("/dashboard/stats"),
  getFaculty:(p="")=>request(`/faculty${p}`), getFacultyById:id=>request(`/faculty/${id}`),
  createFaculty:d=>request("/faculty",{method:"POST",body:JSON.stringify(d)}), updateFaculty:(id,d)=>request(`/faculty/${id}`,{method:"PUT",body:JSON.stringify(d)}), deleteFaculty:id=>request(`/faculty/${id}`,{method:"DELETE"}),
  markAttendance:d=>request("/attendance",{method:"POST",body:JSON.stringify(d)}), updateAttendance:(id,d)=>request(`/attendance/${id}`,{method:"PUT",body:JSON.stringify(d)}), monthlyAttendance:(id,y,m)=>request(`/attendance/monthly?facultyId=${id}&year=${y}&month=${m}`),
  applyLeave:d=>request("/leaves",{method:"POST",body:JSON.stringify(d)}), getLeaves:(id,p=0,s=50)=>request(`/leaves?facultyId=${id}&page=${p}&size=${s}`), pendingLeaves:()=>request("/leaves/pending?page=0&size=100"), approveLeave:id=>request(`/leaves/${id}/approve`,{method:"POST"}), rejectLeave:id=>request(`/leaves/${id}/reject`,{method:"POST"}),
  departments:()=>request("/departments"), roles:()=>request("/roles"), leaveTypes:()=>request("/leave-types"), subjects:()=>request("/subjects"),
  calendar:()=>request("/calendar"), createCalendar:d=>request("/calendar",{method:"POST",body:JSON.stringify(d)}), updateCalendar:(id,d)=>request(`/calendar/${id}`,{method:"PUT",body:JSON.stringify(d)}), deleteCalendar:id=>request(`/calendar/${id}`,{method:"DELETE"}),
  tasks:()=>request("/tasks"), createTask:d=>request("/tasks",{method:"POST",body:JSON.stringify(d)}), updateTask:(id,d)=>request(`/tasks/${id}`,{method:"PUT",body:JSON.stringify(d)}), deleteTask:id=>request(`/tasks/${id}`,{method:"DELETE"}),
  announcements:()=>request("/announcements"), createAnnouncement:d=>request("/announcements",{method:"POST",body:JSON.stringify(d)}), deleteAnnouncement:id=>request(`/announcements/${id}`,{method:"DELETE"}),
  lectures:()=>request("/lectures"), lecturePunchIn:d=>request("/lectures/punch-in",{method:"POST",body:JSON.stringify(d)}), lecturePunchOut:id=>request(`/lectures/${id}/punch-out`,{method:"POST"}),
  payroll:m=>request(m?`/payroll?month=${m}`:"/payroll"), runPayroll:m=>request(`/payroll/run?month=${m}`,{method:"POST"}), markPaid:id=>request(`/payroll/${id}/mark-paid`,{method:"POST"}),
  profile:()=>request("/profile"), updateProfile:d=>request("/profile",{method:"PUT",body:JSON.stringify(d)})
};
window.Api=Api; window.Auth=Auth;
