/* FMS live dashboard layer
 * Connects the existing UI to the Spring Boot APIs and makes the remaining
 * client-only modules usable with local persistence/export.
 */
(function () {
  'use strict';

  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const money = v => '₹' + Number(v || 0).toLocaleString('en-IN', {maximumFractionDigits:0});
  const fmtDate = v => v ? new Date(v + (String(v).length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-IN') : '—';
  const today = () => new Date().toISOString().slice(0,10);
  const store = (k, v) => localStorage.setItem('fms_' + k, JSON.stringify(v));
  const load = (k, d) => { try { const x=localStorage.getItem('fms_'+k); return x ? JSON.parse(x) : d; } catch(e){ return d; } };
  const notify = (msg, ok=true) => {
    let n=document.getElementById('liveToast');
    if(!n){ n=document.createElement('div'); n.id='liveToast'; n.style.cssText='position:fixed;right:22px;bottom:22px;z-index:9999;max-width:420px;padding:13px 17px;border-radius:12px;background:#1b1b2d;color:#fff;border:1px solid rgba(139,92,246,.45);box-shadow:0 12px 35px rgba(0,0,0,.4);font-size:14px'; document.body.appendChild(n); }
    n.textContent=msg; n.style.borderColor=ok?'rgba(52,211,153,.45)':'rgba(248,113,113,.55)'; clearTimeout(n._t); n._t=setTimeout(()=>n.remove(),3500);
  };

  let faculty=[];
  let me=null;
  let attendanceCache=[];

  async function getFaculty(){
    const page=await Api.getFaculty('?page=0&size=200&sort=lastName,asc');
    faculty=Array.isArray(page) ? page : (page.content || []);
    const email=localStorage.getItem('fms_user_email') || Auth.getUser()?.email || '';
    const name=(localStorage.getItem('fms_user_name') || Auth.getUser()?.fullName || '').toLowerCase();
    me=faculty.find(f => email && String(f.email||'').toLowerCase()===email.toLowerCase()) ||
       faculty.find(f => name && (`${f.firstName||''} ${f.lastName||''}`).toLowerCase()===name) || faculty[0] || null;
    return faculty;
  }

  function facultyName(f){ return `${f.firstName||''} ${f.lastName||''}`.trim() || f.employeeCode || ('Faculty #'+f.id); }
  function dept(f){ return f.departmentName || f.departmentCode || f.departmentId || '—'; }

  // ---------------- HOME ----------------
  async function loadHome(){
    try{
      const s=await Api.dashboardStats();
      const set=(id,v)=>{const e=document.getElementById(id); if(e)e.textContent=v;};
      set('kpiTotalFaculty',s.totalFaculty ?? 0);
      set('kpiPresent',s.presentToday ?? 0);
      set('kpiLeaves',s.pendingLeaves ?? 0);
      set('kpiPayroll',money(s.monthlyNetPayroll||0));
      if(window.attendanceChart && s.attendanceDates){
        window.attendanceChart.data.labels=s.attendanceDates;
        window.attendanceChart.data.datasets[0].data=s.presentCounts||[];
        window.attendanceChart.data.datasets[1].data=s.absentCounts||[];
        window.attendanceChart.update();
      }
      if(s.facultyByDepartment && window.Chart){
        const c=document.getElementById('deptChart');
        if(c && c._chart){ c._chart.data.labels=Object.keys(s.facultyByDepartment); c._chart.data.datasets[0].data=Object.values(s.facultyByDepartment); c._chart.update(); }
      }
    }catch(e){ notify('Dashboard API unavailable: '+e.message,false); }
  }

  // ---------------- FACULTY ----------------
  function addFacultyButton(){
    const section=document.getElementById('section-faculty'); if(!section || document.getElementById('liveAddFaculty')) return;
    const h=section.querySelector('h2'); if(!h) return;
    const wrap=h.parentElement; wrap.classList.add('flex','items-center','justify-between');
    const b=document.createElement('button'); b.id='liveAddFaculty'; b.className='px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold'; b.textContent='+ Add Faculty'; b.onclick=()=>facultyModal(); wrap.appendChild(b);
  }

  function renderLiveFaculty(){
    const body=document.getElementById('facultyTableBody'); if(!body)return;
    const q=(document.getElementById('facultySearch')?.value||'').toLowerCase();
    const d=document.getElementById('deptFilter')?.value||'';
    const r=document.getElementById('roleFilter')?.value||'';
    const data=faculty.filter(f=>{
      const n=facultyName(f).toLowerCase();
      return (!q||n.includes(q)||String(f.employeeCode||'').toLowerCase().includes(q)) && (!d||dept(f)===d||String(f.departmentId)===d) && (!r||String(f.designation||'')===r);
    });
    body.innerHTML=data.map(f=>`<tr>
      <td><span class="text-purple-400 font-mono text-xs">${esc(f.employeeCode)}</span></td>
      <td><div class="flex items-center gap-2.5"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">${esc((f.firstName||'?')[0])}${esc((f.lastName||'?')[0])}</div><span class="font-medium text-white">${esc(facultyName(f))}</span></div></td>
      <td class="text-white/60">${esc(dept(f))}</td><td class="text-white/80 text-xs">${esc(f.designation||'—')}</td>
      <td class="text-white/50">${esc(f.experienceYears??0)} yrs</td><td class="text-white/60">${esc(f.publicationsCount??0)}</td>
      <td><span class="badge badge-present">Active</span></td>
      <td><div class="flex gap-1.5"><button class="px-2.5 py-1 rounded-lg text-xs bg-blue-500/15 text-blue-400" onclick="viewFaculty(${f.id})">View</button><button class="px-2.5 py-1 rounded-lg text-xs bg-amber-500/15 text-amber-400" onclick="editFaculty(${f.id})">Edit</button><button class="px-2.5 py-1 rounded-lg text-xs bg-red-500/15 text-red-400" onclick="deleteFaculty(${f.id})">Delete</button></div></td>
    </tr>`).join('') || `<tr><td colspan="8" class="text-center text-white/40 py-8">No faculty found</td></tr>`;
    const c=document.getElementById('facultyCount'); if(c)c.textContent=`Showing ${data.length} of ${faculty.length} faculty members`;
  }

  function facultyModal(f=null){
    const m=document.getElementById('liveModal')||document.body.appendChild(Object.assign(document.createElement('div'),{id:'liveModal'}));
    m.className='fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
    const depts=[['1','CS'],['2','IT'],['3','ME'],['4','CE'],['5','EE'],['6','ECE'],['7','MBA'],['8','MCA']];
    m.innerHTML=`<div class="card w-full max-w-2xl p-6 max-h-[90vh] overflow-auto"><div class="flex justify-between mb-5"><h3 class="font-bold text-white text-lg">${f?'Edit':'Add'} Faculty</h3><button onclick="closeLiveModal()" class="text-white/50">✕</button></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${[
      ['employeeCode','Employee Code','text',f?.employeeCode||''],['firstName','First Name','text',f?.firstName||''],['lastName','Last Name','text',f?.lastName||''],['email','Email','email',f?.email||''],
      ['designation','Designation','text',f?.designation||'Professor'],['dateOfJoining','Date of Joining','date',f?.dateOfJoining||today()],['dateOfBirth','Date of Birth','date',f?.dateOfBirth||''],['contactNumber','Contact Number','text',f?.contactNumber||''],
      ['qualification','Qualification','text',f?.qualification||''],['specialisation','Specialisation','text',f?.specialisation||''],['experienceYears','Experience Years','number',f?.experienceYears??0],['publicationsCount','Publications','number',f?.publicationsCount??0]
    ].map(x=>`<label class="text-xs text-white/50">${x[1]}<input id="fm_${x[0]}" type="${x[2]}" value="${esc(x[3])}" class="fms-input w-full mt-1"></label>`).join('')}
      <label class="text-xs text-white/50">Department<select id="fm_departmentId" class="fms-input w-full mt-1">${depts.map(x=>`<option value="${x[0]}" ${String(f?.departmentId||'')===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></label>
      <label class="text-xs text-white/50">Gender<select id="fm_gender" class="fms-input w-full mt-1"><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></label></div>
      <div class="flex justify-end gap-2 mt-5"><button onclick="closeLiveModal()" class="px-4 py-2 rounded-lg bg-white/5 text-white/60">Cancel</button><button onclick="saveFaculty(${f?.id||'null'})" class="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold">Save Faculty</button></div></div>`;
  }

  window.closeLiveModal=()=>document.getElementById('liveModal')?.remove();
  window.saveFaculty=async id=>{
    try{
      const v=k=>document.getElementById('fm_'+k)?.value||'';
      const dto={employeeCode:v('employeeCode'),firstName:v('firstName'),lastName:v('lastName'),email:v('email'),departmentId:Number(v('departmentId')),designation:v('designation'),qualification:v('qualification'),specialisation:v('specialisation'),dateOfJoining:v('dateOfJoining'),dateOfBirth:v('dateOfBirth')||null,gender:v('gender'),contactNumber:v('contactNumber'),experienceYears:Number(v('experienceYears')||0),publicationsCount:Number(v('publicationsCount')||0),patentsCount:0,phdGuide:false};
      if(id) await Api.updateFaculty(id,dto); else await Api.createFaculty(dto);
      closeLiveModal(); await getFaculty(); renderLiveFaculty(); await loadHome(); notify(id?'Faculty updated':'Faculty added');
    }catch(e){notify(e.message,false);}
  };
  window.editFaculty=id=>{const f=faculty.find(x=>x.id===id); if(f)facultyModal(f);};
  window.viewFaculty=id=>{const f=faculty.find(x=>x.id===id); if(f)alert(`Employee: ${f.employeeCode}\nName: ${facultyName(f)}\nDepartment: ${dept(f)}\nDesignation: ${f.designation||'—'}\nEmail: ${f.email||'—'}\nPublications: ${f.publicationsCount||0}`);};
  window.deleteFaculty=async id=>{if(!confirm('Delete this faculty record?'))return;try{await Api.deleteFaculty(id);await getFaculty();renderLiveFaculty();await loadHome();notify('Faculty deleted');}catch(e){notify(e.message,false);}};

  // ---------------- ATTENDANCE ----------------
  function addAttendanceControls(){
    const sec=document.getElementById('section-attendance'); if(!sec||document.getElementById('liveAttendanceControls'))return;
    const h=sec.querySelector('h2');
    const box=document.createElement('div'); box.id='liveAttendanceControls'; box.className='card p-4 mb-5';
    box.innerHTML=`<div class="flex flex-wrap gap-3 items-end"><label class="text-xs text-white/50">Faculty<select id="attFaculty" class="fms-input block mt-1 min-w-56"></select></label><label class="text-xs text-white/50">Date<input id="attDate" type="date" value="${today()}" class="fms-input block mt-1"></label><label class="text-xs text-white/50">Status<select id="attStatus" class="fms-input block mt-1"><option>PRESENT</option><option>ABSENT</option><option>ON_DUTY</option><option>HALF_DAY</option><option>LATE</option><option>HOLIDAY</option></select></label><label class="text-xs text-white/50">Check In<input id="attIn" type="time" class="fms-input block mt-1"></label><label class="text-xs text-white/50">Check Out<input id="attOut" type="time" class="fms-input block mt-1"></label><button onclick="markLiveAttendance()" class="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold">Save Attendance</button></div>`;
    h?.after(box);
  }
  function fillAttFaculty(){const s=document.getElementById('attFaculty');if(!s)return;s.innerHTML=faculty.map(f=>`<option value="${f.id}" ${me&&f.id===me.id?'selected':''}>${esc(facultyName(f))} (${esc(f.employeeCode)})</option>`).join('');}
  window.markLiveAttendance=async()=>{try{const facultyId=Number(document.getElementById('attFaculty').value);await Api.markAttendance({facultyId,attendanceDate:document.getElementById('attDate').value,status:document.getElementById('attStatus').value,checkIn:document.getElementById('attIn').value||null,checkOut:document.getElementById('attOut').value||null,remarks:'Marked from FMS dashboard'});notify('Attendance saved');await loadAttendance();await loadHome();}catch(e){notify(e.message,false);}};
  async function loadAttendance(){
    const fid=Number(document.getElementById('attFaculty')?.value||me?.id||faculty[0]?.id); if(!fid)return;
    const d=new Date(); const rows=await Api.monthlyAttendance(fid,d.getFullYear(),d.getMonth()+1); attendanceCache=rows||[];
    const b=document.getElementById('attendanceTableBody'); if(!b)return;
    b.innerHTML=attendanceCache.map(a=>{const status=a.status||'';const cls=status==='PRESENT'?'badge-present':status==='ABSENT'?'badge-absent':'badge-leave';return `<tr><td>${fmtDate(a.attendanceDate)}</td><td>${esc((faculty.find(f=>f.id===a.facultyId)&&facultyName(faculty.find(f=>f.id===a.facultyId)))||'Faculty')}</td><td>${esc(a.checkIn||'—')}</td><td>${esc(a.checkOut||'—')}</td><td>—</td><td><span class="badge ${cls}">${esc(status)}</span></td></tr>`;}).join('')||'<tr><td colspan="6" class="text-center text-white/40 py-8">No attendance records for this month</td></tr>';
  }
  let punchStart=null,punchTimer=null;
  window.punchIn=async()=>{const b=document.getElementById('punchInBtn');if(b){b.disabled=true;}punchStart=Date.now();document.getElementById('punchStatus').textContent='In Session';document.getElementById('punchOutBtn').disabled=false;document.getElementById('punchOutBtn').style.opacity='1';punchTimer=setInterval(()=>{const s=Math.floor((Date.now()-punchStart)/1000);document.getElementById('punchTime').textContent=`${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`},1000);};
  window.punchOut=async()=>{if(!punchStart)return;clearInterval(punchTimer);const end=new Date();const start=new Date(punchStart);const f=document.getElementById('attFaculty');if(f&&f.value){try{const pad=n=>String(n).padStart(2,'0');await Api.markAttendance({facultyId:Number(f.value),attendanceDate:today(),status:'PRESENT',checkIn:`${pad(start.getHours())}:${pad(start.getMinutes())}`,checkOut:`${pad(end.getHours())}:${pad(end.getMinutes())}`,remarks:'Punch clock'});notify('Punch-out saved as attendance');}catch(e){notify(e.message,false);}}document.getElementById('punchStatus').textContent='Session Ended';document.getElementById('punchOutBtn').disabled=true;document.getElementById('punchOutBtn').style.opacity='.4';punchStart=null;await loadAttendance();};

  // ---------------- LEAVES ----------------
  function leaveModalLive(){
    const m=document.getElementById('leaveModal');if(!m)return;m.classList.remove('hidden');m.classList.add('flex');
    m.querySelector('.card').innerHTML=`<div class="flex items-center justify-between mb-5"><h3 class="font-bold text-white">Apply for Leave</h3><button onclick="closeLeaveModal()" class="text-white/40">✕</button></div><div class="space-y-4"><label class="block text-xs text-white/50">Faculty<select id="leaveFaculty" class="fms-input w-full mt-1">${faculty.map(f=>`<option value="${f.id}" ${me&&f.id===me.id?'selected':''}>${esc(facultyName(f))}</option>`).join('')}</select></label><label class="block text-xs text-white/50">Leave Type<select id="leaveType" class="fms-input w-full mt-1"><option value="1">Casual Leave (CL)</option><option value="2">Earned Leave (EL)</option><option value="3">Duty Leave (DL)</option><option value="4">Medical Leave (ML)</option><option value="5">Loss of Pay (LOP)</option><option value="6">Maternity Leave</option><option value="7">Paternity Leave</option><option value="8">Study / Research Leave</option></select></label><div class="grid grid-cols-2 gap-3"><label class="text-xs text-white/50">From<input id="leaveFrom" type="date" class="fms-input w-full mt-1"></label><label class="text-xs text-white/50">To<input id="leaveTo" type="date" class="fms-input w-full mt-1"></label></div><label class="block text-xs text-white/50">Reason<textarea id="leaveReason" rows="3" class="fms-input w-full mt-1"></textarea></label><button onclick="submitLiveLeave()" class="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold">Submit Leave Request</button></div>`;
  }
  window.openLeaveModal=leaveModalLive;
  window.submitLiveLeave=async()=>{try{await Api.applyLeave({facultyId:Number(document.getElementById('leaveFaculty').value),leaveTypeId:Number(document.getElementById('leaveType').value),fromDate:document.getElementById('leaveFrom').value,toDate:document.getElementById('leaveTo').value,reason:document.getElementById('leaveReason').value});closeLeaveModal();notify('Leave request submitted');await loadPendingLeaves();await loadHome();}catch(e){notify(e.message,false);}};
  async function loadPendingLeaves(){
    const b=document.getElementById('pendingLeavesTable');if(!b)return;try{const p=await Api.pendingLeaves();const rows=p.content||[];b.innerHTML=rows.map(l=>`<tr><td class="font-medium text-white">${esc(l.facultyName||'Faculty #'+l.facultyId)}</td><td><span class="badge badge-pending">${esc(l.leaveTypeName||'Leave')}</span></td><td>${fmtDate(l.fromDate)}</td><td>${fmtDate(l.toDate)}</td><td>${l.totalDays}</td><td class="text-white/50">${esc(l.reason)}</td><td><div class="flex gap-1.5"><button onclick="reviewLeave(${l.id},true)" class="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/15 text-emerald-400">✓ Approve</button><button onclick="reviewLeave(${l.id},false)" class="px-2.5 py-1 rounded-lg text-xs bg-red-500/15 text-red-400">✕ Reject</button></div></td></tr>`).join('')||'<tr><td colspan="7" class="text-center text-white/40 py-8">No pending approvals</td></tr>';const pb=document.getElementById('pendingBadge');if(pb)pb.textContent=rows.length;}catch(e){b.innerHTML='<tr><td colspan="7" class="text-center text-red-400 py-8">Unable to load pending leaves</td></tr>';}}
  window.reviewLeave=async(id,approve)=>{try{if(approve)await Api.approveLeave(id);else await Api.rejectLeave(id);notify(approve?'Leave approved':'Leave rejected');await loadPendingLeaves();await loadHome();}catch(e){notify(e.message,false);}};

  // ---------------- TASKS ----------------
  function tasks(){return load('tasks',[]);}
  function saveTasks(x){store('tasks',x);renderLiveTasks();}
  function renderLiveTasks(){
    const t=tasks();const card=(x,i)=>`<div class="p-3.5 rounded-xl" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)"><div class="flex justify-between gap-2"><p class="text-sm text-white/85 font-medium">${esc(x.title)}</p><button onclick="deleteTask(${i})" class="text-red-400 text-xs">✕</button></div><p class="text-xs text-white/35 mt-2">Due: ${esc(x.due||'—')}</p><select onchange="moveTask(${i},this.value)" class="fms-input text-xs mt-2 py-1"><option value="pending" ${x.status==='pending'?'selected':''}>Pending</option><option value="progress" ${x.status==='progress'?'selected':''}>In Progress</option><option value="done" ${x.status==='done'?'selected':''}>Completed</option></select></div>`;
    ['tasksPending','tasksInProgress','tasksDone'].forEach(id=>{const e=document.getElementById(id);if(e)e.innerHTML='';});
    t.forEach((x,i)=>{const id=x.status==='done'?'tasksDone':x.status==='progress'?'tasksInProgress':'tasksPending';document.getElementById(id)?.insertAdjacentHTML('beforeend',card(x,i));});
  }
  window.addTask=()=>{const title=prompt('Task title:');if(!title)return;const due=prompt('Due date (YYYY-MM-DD):')||'';const t=tasks();t.unshift({title,due,status:'pending'});saveTasks(t);notify('Task added');};
  window.deleteTask=i=>{const t=tasks();t.splice(i,1);saveTasks(t);};
  window.moveTask=(i,status)=>{const t=tasks();t[i].status=status;saveTasks(t);};

  // ---------------- CALENDAR / EVENTS ----------------
  function events(){return load('events',[{date:'2026-09-05',type:'EXAM',title:'Mid-Term Exam – CS Dept'},{date:'2026-09-08',type:'FDP',title:'Faculty Dev. Program – AI/ML'},{date:'2026-09-10',type:'HOLIDAY',title:'Ganesh Chaturthi'},{date:'2026-09-15',type:'SEMINAR',title:'Research Symposium 2026'},{date:'2026-09-20',type:'DEADLINE',title:'NBA Data Submission Deadline'},{date:'2026-09-25',type:'WORKSHOP',title:'Python Workshop – IT Dept'}]);}
  function renderLiveEvents(){const e=document.getElementById('upcomingEvents');if(!e)return;const rows=events().sort((a,b)=>a.date.localeCompare(b.date)).slice(0,12);e.innerHTML=rows.map(x=>`<div class="flex items-start gap-3 p-3 rounded-xl" style="background:rgba(255,255,255,.04)"><div class="text-center"><p class="text-lg font-bold">${new Date(x.date+'T00:00:00').getDate()}</p><p class="text-xs text-white/40">${new Date(x.date+'T00:00:00').toLocaleString('en',{month:'short'})}</p></div><div><p class="text-sm text-white/85">${esc(x.title)}</p><span class="badge badge-pending mt-1">${esc(x.type)}</span></div></div>`).join('');}
  function addEventButton(){const sec=document.getElementById('section-schedule');if(!sec||document.getElementById('liveAddEvent'))return;const h=sec.querySelector('h2');const b=document.createElement('button');b.id='liveAddEvent';b.className='float-right -mt-10 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300';b.textContent='+ Add Event';b.onclick=()=>{const title=prompt('Event title:');if(!title)return;const date=prompt('Date (YYYY-MM-DD):',today());if(!date)return;const type=prompt('Type: EXAM / HOLIDAY / SEMINAR / FDP / WORKSHOP / DEADLINE','SEMINAR')||'SEMINAR';const x=events();x.push({title,date,type:type.toUpperCase()});store('events',x);renderLiveEvents();notify('Event added');};h?.after(b);}

  // ---------------- PAYROLL ----------------
  function payrollRows(){return load('payroll',faculty.map(f=>{const basic=f.designation==='Professor'?120000:f.designation==='Associate Professor'?90000:f.designation==='Assistant Professor'?65000:25000;const hra=basic*.24,da=basic*.17,pf=basic*.12,gross=basic+hra+da,tds=gross*.1;return {facultyId:f.id,basic,hra,da,pf,tds,gross,net:gross-pf-tds,status:'PENDING'};}));}
  function renderLivePayroll(){const b=document.getElementById('payrollTableBody');if(!b)return;const rows=payrollRows();b.innerHTML=rows.map(p=>{const f=faculty.find(x=>x.id===p.facultyId);return `<tr><td><p class="font-medium text-white text-xs">${esc(f?facultyName(f):'Faculty')}</p><p class="text-white/40 text-xs">${esc(f?.employeeCode||'')}</p></td><td>${esc(f?.designation||'')}</td><td>${money(p.basic)}</td><td>${money(p.hra)}</td><td>${money(p.da)}</td><td>${money(p.gross)}</td><td>${money(p.pf)}</td><td>${money(p.tds)}</td><td class="text-emerald-400 font-bold">${money(p.net)}</td><td><span class="badge ${p.status==='PAID'?'badge-present':'badge-medium'}">${p.status}</span></td></tr>`;}).join('')||'<tr><td colspan="10" class="text-center text-white/40 py-8">No payroll records</td></tr>';const s=document.getElementById('payrollSummary');if(s){const gross=rows.reduce((a,x)=>a+x.gross,0),net=rows.reduce((a,x)=>a+x.net,0),ded=gross-net;s.innerHTML=[['Total Gross Payroll',gross],['Total Deductions',ded],['Net Payroll',net],['Faculty Records',rows.length]].map(x=>`<div class="flex justify-between py-2 border-b border-white/5"><span class="text-xs text-white/50">${x[0]}</span><span class="font-semibold text-white">${typeof x[1]==='number'?money(x[1]):x[1]}</span></div>`).join('');}}
  function csvDownload(name,rows){if(!rows.length)return;const keys=Object.keys(rows[0]);const csv=[keys.join(','),...rows.map(r=>keys.map(k=>`"${String(r[k]??'').replace(/"/g,'""')}"`).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  function bindPayrollButtons(){const sec=document.getElementById('section-payroll');if(!sec||sec.dataset.live)return;sec.dataset.live='1';sec.querySelectorAll('button').forEach(b=>{const t=b.textContent.trim();if(t.includes('Generate Slips'))b.onclick=()=>{store('payroll',payrollRows().map(x=>({...x,status:'PROCESSED'})));renderLivePayroll();notify('Salary slips generated');};if(t.includes('Export Excel'))b.onclick=()=>csvDownload('fms-payroll.csv',payrollRows());});}

  // ---------------- REPORTS ----------------
  window.generateReport=async type=>{try{if(type==='attendance'){await loadAttendance();csvDownload('attendance-report.csv',attendanceCache);}else if(type==='payroll'){csvDownload('payroll-report.csv',payrollRows());}else if(type==='leave'){const p=await Api.pendingLeaves();csvDownload('leave-report.csv',p.content||[]);}else if(type==='workload'||type==='research'||type==='naac'){const rows=faculty.map(f=>({employeeCode:f.employeeCode,name:facultyName(f),department:dept(f),designation:f.designation||'',experienceYears:f.experienceYears||0,publications:f.publicationsCount||0,patents:f.patentsCount||0}));csvDownload(type+'-report.csv',rows);}notify('Report exported');}catch(e){notify(e.message,false);}};

  // ---------------- NOTICES ----------------
  function renderLiveNotices(){const e=document.getElementById('noticeList');if(!e)return;const n=load('notices',[]);e.innerHTML=n.map(x=>`<div class="p-3 rounded-xl hover:bg-white/5"><span class="badge badge-pending">${esc(x.category||'GENERAL')}</span><p class="text-sm font-medium text-white mt-1">${esc(x.title)}</p><p class="text-xs text-white/45 mt-1">${esc(x.body)}</p></div>`).join('')||'<p class="text-sm text-white/35">No announcements yet.</p>';}
  window.showNoticeModal=()=>{const m=document.getElementById('noticeModal');if(!m)return;m.classList.remove('hidden');m.classList.add('flex');const card=m.querySelector('.card');card.innerHTML=`<div class="flex justify-between mb-5"><h3 class="font-bold text-white">Post Announcement</h3><button onclick="closeNoticeModal()" class="text-white/40">✕</button></div><div class="space-y-4"><input id="noticeTitle" class="fms-input w-full" placeholder="Title"><select id="noticeCat" class="fms-input w-full"><option>GENERAL</option><option>EXAM</option><option>RESEARCH</option><option>ACHIEVEMENT</option><option>CIRCULAR</option><option>URGENT</option></select><textarea id="noticeBody" rows="4" class="fms-input w-full" placeholder="Message"></textarea><button onclick="publishLiveNotice()" class="w-full py-3 rounded-xl bg-amber-600 text-white font-semibold">Publish Announcement</button></div>`;};
  window.publishLiveNotice=()=>{const n=load('notices',[]);n.unshift({title:document.getElementById('noticeTitle').value,category:document.getElementById('noticeCat').value,body:document.getElementById('noticeBody').value});store('notices',n);closeNoticeModal();renderLiveNotices();notify('Announcement published');};

  // ---------------- NAV / BOOT ----------------
  const oldShow=window.showSection;
  window.showSection=function(name){oldShow(name);if(name==='home')loadHome();if(name==='faculty'){getFaculty().then(renderLiveFaculty);}if(name==='attendance'){getFaculty().then(()=>{fillAttFaculty();loadAttendance();});}if(name==='leaves')loadPendingLeaves();if(name==='schedule')renderLiveEvents();if(name==='payroll')getFaculty().then(renderLivePayroll);if(name==='tasks')renderLiveTasks();if(name==='reports')getFaculty();};

  window.filterFaculty=()=>renderLiveFaculty();

  async function bootLive(){
    try{await getFaculty();}catch(e){notify('Backend/database connection is not ready: '+e.message,false);}
    addFacultyButton();addAttendanceControls();fillAttFaculty();addEventButton();bindPayrollButtons();
    renderLiveFaculty();renderLiveTasks();renderLiveEvents();renderLiveNotices();renderLivePayroll();loadHome();loadPendingLeaves();loadAttendance();
    const ap=document.getElementById('attMonthPicker');if(ap)ap.onchange=loadAttendance;
    document.getElementById('attFaculty')?.addEventListener('change',loadAttendance);
  }
  setTimeout(bootLive,100);
})();
