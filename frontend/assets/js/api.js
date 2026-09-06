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

/* Demo mode: every dashboard action remains usable without a backend. */
(() => {
  const isDemo=()=>localStorage.getItem(TOKEN_KEY)==="demo-token" || localStorage.getItem("fms_demo_login")==="true";
  if(!isDemo()) return;
  const read=(k,f=[])=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x==null?f:x}catch{return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const uid=()=>Date.now()+Math.floor(Math.random()*1000);
  const departments=[
    ["CS","Computer Science & Engineering"],["IT","Information Technology"],["AIML","Artificial Intelligence & Machine Learning"],["DS","Data Science"],["CYBER","Cyber Security"],["SE","Software Engineering"],["CLOUD","Cloud Computing"],["BCA","Computer Applications"],["ECE","Electronics & Communication"],["EE","Electrical Engineering"],["ME","Mechanical Engineering"],["CE","Civil Engineering"],["AUTO","Automobile Engineering"],["RA","Robotics & Automation"],["BT","Biotechnology"],["BME","Biomedical Engineering"],["MATH","Mathematics"],["PHY","Physics"],["CHEM","Chemistry"],["CM","Commerce & Management"],["ENG","English & Communication"],["BBA","Bachelor of Business Administration"]
  ].map((x,i)=>({id:i+1,code:x[0],name:x[1]}));
  const roles=["SUPER_ADMIN","DEAN","HOD","FACULTY","TEACHER","STUDENT"].map((name,i)=>({id:i+1,name}));
  const leaveTypes=["CASUAL","SICK","EARNED","ON_DUTY","OTHER"].map((name,i)=>({id:i+1,name}));
  const seedFaculty=[
    ["IT","Amit Sharma","amit.sharma@university.edu"],["IT","Priya Patil","priya.patil@university.edu"],["AIML","Neha Joshi","neha.joshi@university.edu"],["DS","Sneha More","sneha.more@university.edu"],["CYBER","Kunal Shinde","kunal.shinde@university.edu"],["SE","Akshay Patil","akshay.patil@university.edu"],["CLOUD","Sagar Mane","sagar.mane@university.edu"],["BCA","Harshad Kulkarni","harshad.kulkarni@university.edu"],["ECE","Vivek Patil","vivek.patil@university.edu"],["EE","Prasad Shinde","prasad.shinde@university.edu"],["ME","Nilesh Pawar","nilesh.pawar@university.edu"],["CE","Swapnil Jadhav","swapnil.jadhav@university.edu"],["AUTO","Omkar Shinde","omkar.shinde@university.edu"],["RA","Rohan Patil","rohan.patil@university.edu"],["BT","Meera Joshi","meera.joshi@university.edu"],["BME","Kavita Shah","kavita.shah@university.edu"],["MATH","Suresh Kulkarni","suresh.kulkarni@university.edu"],["PHY","Ajay Joshi","ajay.joshi@university.edu"],["CHEM","Rajesh Patil","rajesh.patil@university.edu"],["CM","Mahesh Shah","mahesh.shah@university.edu"],["ENG","Kavita More","kavita.more@university.edu"],["BBA","Rahul Shah","rahul.shah@university.edu"]
  ];
  const splitName=n=>{const p=n.split(" ");return {firstName:p.shift()||n,lastName:p.join(" ")||"Faculty"}};
  function faculty(){let f=read("fms_demo_faculty",null);if(!Array.isArray(f)){f=seedFaculty.map((x,i)=>{const n=splitName(x[1]),d=departments.find(d=>d.code===x[0]);return {id:i+1,employeeCode:`FMS${String(i+1).padStart(3,"0")}`,firstName:n.firstName,lastName:n.lastName,email:x[2],departmentId:d?.id,departmentName:d?.name,designation:"Assistant Professor",qualification:"MCA",experienceYears:3,publicationsCount:0,patentsCount:0,dateOfJoining:"2024-06-01"}});write("fms_demo_faculty",f)}return f}
  function subjects(){const C=window.FMS_2024_CURRICULUM||{}, fn=window.FMS_2024_subjectsFor;let out=[],n=1; if(fn)Object.keys(C).forEach(code=>{for(let sem=1;sem<=Number(C[code].years||4)*2;sem++)(fn(code,sem)||[]).forEach(s=>out.push({...s,id:n++,departmentCode:code,departmentId:departments.find(d=>d.code===code)?.id,departmentName:C[code].name}))}); if(!out.length)return read("fms_demo_subjects",[{id:1,code:"CS101",name:"Data Structures",semester:3,credits:4}]); write("fms_demo_subjects",out);return out}
  const list=(k)=>read(k,[]); const save=(k,x)=>write(k,x);
  Api.departments=async()=>departments;
  Api.roles=async()=>roles;
  Api.leaveTypes=async()=>leaveTypes;
  Api.subjects=async()=>subjects();
  Api.getFaculty=async()=>({content:faculty(),totalElements:faculty().length});
  Api.getFacultyById=async id=>faculty().find(x=>x.id==id)||null;
  Api.createFaculty=async d=>{const f=faculty(),dep=departments.find(x=>x.id==Number(d.departmentId));const n=splitName(`${d.firstName||"New"} ${d.lastName||"Faculty"}`);const x={...d,id:uid(),employeeCode:d.employeeCode||`FMS${uid()}`,firstName:n.firstName,lastName:n.lastName,departmentId:dep?.id,departmentName:dep?.name};f.push(x);save("fms_demo_faculty",f);return x};
  Api.updateFaculty=async(id,d)=>{const f=faculty(),i=f.findIndex(x=>x.id==id);if(i<0)throw Error("Faculty not found");const dep=departments.find(x=>x.id==Number(d.departmentId));f[i]={...f[i],...d,departmentId:dep?.id,departmentName:dep?.name};save("fms_demo_faculty",f);return f[i]};
  Api.deleteFaculty=async id=>{const f=faculty().filter(x=>x.id!=id);save("fms_demo_faculty",f);return null};
  Api.markAttendance=async d=>{const a=list("fms_demo_attendance"),x={...d,id:uid(),createdAt:new Date().toISOString()};a.push(x);save("fms_demo_attendance",a);return x};
  Api.updateAttendance=async(id,d)=>{const a=list("fms_demo_attendance"),i=a.findIndex(x=>x.id==id);if(i<0)throw Error("Attendance not found");a[i]={...a[i],...d};save("fms_demo_attendance",a);return a[i]};
  Api.monthlyAttendance=async(id,y,m)=>list("fms_demo_attendance").filter(x=>Number(x.facultyId)===Number(id));
  Api.applyLeave=async d=>{const a=list("fms_demo_leaves"),x={...d,id:uid(),status:"PENDING",createdAt:new Date().toISOString()};a.push(x);save("fms_demo_leaves",a);return x};
  Api.getLeaves=async id=>({content:list("fms_demo_leaves").filter(x=>!id||Number(x.facultyId)===Number(id))});
  Api.pendingLeaves=async()=>list("fms_demo_leaves").filter(x=>x.status==="PENDING");
  Api.approveLeave=async id=>{const a=list("fms_demo_leaves"),x=a.find(x=>x.id==id);if(x)x.status="APPROVED";save("fms_demo_leaves",a);return x};
  Api.rejectLeave=async id=>{const a=list("fms_demo_leaves"),x=a.find(x=>x.id==id);if(x)x.status="REJECTED";save("fms_demo_leaves",a);return x};
  Api.calendar=async()=>list("fms_demo_calendar");
  Api.createCalendar=async d=>{const a=list("fms_demo_calendar"),x={...d,id:uid()};a.push(x);save("fms_demo_calendar",a);return x};
  Api.updateCalendar=async(id,d)=>{const a=list("fms_demo_calendar"),i=a.findIndex(x=>x.id==id);if(i>=0)a[i]={...a[i],...d};save("fms_demo_calendar",a);return a[i]};
  Api.deleteCalendar=async id=>{save("fms_demo_calendar",list("fms_demo_calendar").filter(x=>x.id!=id))};
  Api.tasks=async()=>list("fms_demo_tasks");
  Api.createTask=async d=>{const a=list("fms_demo_tasks"),x={...d,id:uid(),status:d.status||"TODO"};a.push(x);save("fms_demo_tasks",a);return x};
  Api.updateTask=async(id,d)=>{const a=list("fms_demo_tasks"),i=a.findIndex(x=>x.id==id);if(i>=0)a[i]={...a[i],...d};save("fms_demo_tasks",a);return a[i]};
  Api.deleteTask=async id=>save("fms_demo_tasks",list("fms_demo_tasks").filter(x=>x.id!=id));
  Api.announcements=async()=>list("fms_demo_announcements");
  Api.createAnnouncement=async d=>{const a=list("fms_demo_announcements"),x={...d,id:uid(),createdAt:new Date().toISOString()};a.unshift(x);save("fms_demo_announcements",a);return x};
  Api.deleteAnnouncement=async id=>save("fms_demo_announcements",list("fms_demo_announcements").filter(x=>x.id!=id));
  Api.lectures=async()=>list("fms_demo_lectures");
  Api.lecturePunchIn=async d=>{const a=list("fms_demo_lectures"),x={...d,id:uid(),punchIn:new Date().toISOString(),status:"RUNNING"};a.push(x);save("fms_demo_lectures",a);return x};
  Api.lecturePunchOut=async id=>{const a=list("fms_demo_lectures"),x=a.find(x=>x.id==id);if(x){x.punchOut=new Date().toISOString();x.status="COMPLETED"}save("fms_demo_lectures",a);return x};
  Api.payroll=async()=>list("fms_demo_payroll");
  Api.runPayroll=async m=>{const f=faculty(),a=list("fms_demo_payroll"),month=m||new Date().toISOString().slice(0,7);f.forEach(x=>{if(!a.some(p=>p.facultyId==x.id&&p.month==month))a.push({id:uid(),facultyId:x.id,employeeCode:x.employeeCode,month,basicSalary:30000,netSalary:30000,status:"GENERATED"})});save("fms_demo_payroll",a);return a};
  Api.markPaid=async id=>{const a=list("fms_demo_payroll"),x=a.find(x=>x.id==id);if(x)x.status="PAID";save("fms_demo_payroll",a);return x};
  Api.profile=async()=>read("user",{});
  Api.updateProfile=async d=>{const u={...read("user",{}),...d};write("user",u);return u};
})();
