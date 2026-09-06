// FMS UX + Subject Management
(() => {
  const demo = () => localStorage.getItem('fms_access_token') === 'demo-token' || localStorage.getItem('fms_demo_login') === 'true';
  const user = () => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } };
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key = () => 'fms_subjects_v2';
  const defaultSubjects = [
    {id:1,code:'CS101',name:'Data Structures',semester:'3',credits:4},
    {id:2,code:'CS102',name:'Java Programming',semester:'3',credits:4},
    {id:3,code:'CS103',name:'DBMS',semester:'3',credits:4}
  ];
  function subjects(){
    try { const x=JSON.parse(localStorage.getItem(key())||'null'); if(Array.isArray(x)) return x; } catch {}
    localStorage.setItem(key(),JSON.stringify(defaultSubjects)); return [...defaultSubjects];
  }
  function saveSubjects(x){ localStorage.setItem(key(),JSON.stringify(x)); }
  function assignments(){ try{return JSON.parse(localStorage.getItem('fms_subject_assignments_v2')||'{}')}catch{return {}} }
  function saveAssignments(x){localStorage.setItem('fms_subject_assignments_v2',JSON.stringify(x));}
  function myEmail(){return (user().email||'').toLowerCase();}
  function mySubjects(){
    const a=assignments(), e=myEmail();
    return subjects().filter(s => Array.isArray(a[s.id]) && a[s.id].includes(e));
  }
  if(demo() && window.Api){
    Api.subjects = async () => subjects();
  }
  function toast(t,ok=true){
    const x=document.createElement('div'); x.className='toast '+(ok?'ok':'bad'); x.textContent=t;
    document.body.appendChild(x); setTimeout(()=>x.remove(),2500);
  }
  function openSubjectModal(editId=null){
    const s=subjects().find(x=>x.id===editId)||{};
    const u=user(), facultyEmail=(u.email||'').toLowerCase();
    const facultyList=[
      {email:'faculty1@university.edu',name:'Amit Faculty'},
      {email:'faculty2@university.edu',name:'Priya Faculty'},
      {email:'faculty3@university.edu',name:'Rahul Faculty'},
      {email:'faculty4@university.edu',name:'Sneha Faculty'},
      {email:'faculty5@university.edu',name:'Vijay Faculty'},
      {email:'faculty6@university.edu',name:'Neha Faculty'},
      {email:'faculty7@university.edu',name:'Sanjay Faculty'},
      {email:'faculty8@university.edu',name:'Pooja Faculty'}
    ];
    const a=assignments();
    const checked=e=>a[s.id]?.includes(e)?'checked':'';
    const facultyBox=(u.role||'').toUpperCase()==='FACULTY' || (u.role||'').toUpperCase()==='TEACHER'
      ? `<input type="hidden" name="facultyEmails" value="${esc(facultyEmail)}"><div class="card" style="margin-top:10px"><b>Assign to me</b><p style="color:#aaa;margin:6px 0 0">${esc(facultyEmail)}</p></div>`
      : `<div style="grid-column:1/-1"><label style="color:#aaa;font-size:12px">Assign Faculty</label><div style="display:grid;gap:8px;margin-top:8px">${facultyList.map(f=>`<label style="display:flex;gap:8px;align-items:center;color:#ddd"><input type="checkbox" name="facultyEmails" value="${esc(f.email)}" ${checked(f.email)}> ${esc(f.name)} <span style="color:#777">(${esc(f.email)})</span></label>`).join('')}</div></div>`;
    const w=document.createElement('div'); w.className='modal-backdrop';
    w.innerHTML=`<div class="modal"><div class="modal-head"><h3>${editId?'Edit Subject':'Add Subject'}</h3><button class="icon" data-x>×</button></div><form id="subjectForm"><div class="form-grid"><label>Subject Code<input class="input" name="code" value="${esc(s.code||'')}" required placeholder="CS104"></label><label>Subject Name<input class="input" name="name" value="${esc(s.name||'')}" required placeholder="Operating System"></label><label>Semester<input class="input" name="semester" type="number" min="1" max="12" value="${esc(s.semester||'')}" required></label><label>Credits<input class="input" name="credits" type="number" min="1" max="10" value="${esc(s.credits||4)}" required></label>${facultyBox}</div><div class="modal-actions"><button type="button" class="btn" data-x>Cancel</button><button class="btn primary">${editId?'Update':'Add Subject'}</button></div></form></div>`;
    document.body.appendChild(w);
    w.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>w.remove());
    w.querySelector('form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget), code=f.get('code').trim().toUpperCase(), name=f.get('name').trim();let list=subjects();if(list.some(x=>x.code===code&&x.id!==editId)){toast('Subject code already exists.',false);return}const obj={id:editId||Date.now(),code,name,semester:String(f.get('semester')),credits:Number(f.get('credits'))};if(editId)list=list.map(x=>x.id===editId?obj:x);else list.push(obj);saveSubjects(list);const as=assignments();const emails=f.getAll('facultyEmails').map(x=>String(x).toLowerCase());as[obj.id]=emails;saveAssignments(as);w.remove();toast(editId?'Subject updated':'Subject added successfully');renderSubjects();};
  }
  function deleteSubject(id){
    if(!confirm('Delete this subject?')) return;
    saveSubjects(subjects().filter(x=>x.id!==id)); const a=assignments(); delete a[id]; saveAssignments(a); renderSubjects(); toast('Subject deleted');
  }
  function renderSubjects(){
    const app=document.querySelector('#app'); if(!app)return;
    const u=user(), email=myEmail(), mine=mySubjects();
    const all=subjects(), a=assignments();
    const isFaculty=['FACULTY','TEACHER','PROFESSOR','ASSOC_PROFESSOR','ASST_PROFESSOR','GUEST_LECTURER'].includes(String(u.role||'').toUpperCase());
    app.innerHTML=`<div class="page-head"><div><h2>Subject Management</h2><p>Add subjects and assign the subjects taught by each faculty member.</p></div><div class="actions"><button class="btn primary" id="addSubjectBtn">+ Add Subject</button></div></div>
      <div class="grid three"><div class="card kpi"><small>Total Subjects</small><strong>${all.length}</strong><span>Available in academic system</span></div><div class="card kpi"><small>My Subjects</small><strong>${mine.length}</strong><span>Assigned to ${esc(email||'current user')}</span></div><div class="card kpi"><small>Faculty Assignments</small><strong>${Object.values(a).reduce((n,x)=>n+(Array.isArray(x)?x.length:0),0)}</strong><span>Current teaching assignments</span></div></div>
      ${isFaculty?`<section class="card" style="margin-bottom:18px"><div class="card-title"><b>My Subjects</b><span>Subjects you can use for lectures & attendance</span></div>${mine.length?mine.map(s=>`<div class="list-row"><div><b>${esc(s.code)} — ${esc(s.name)}</b><small>Semester ${esc(s.semester)} · ${esc(s.credits)} credits</small></div><span class="status">Assigned</span></div>`).join(''):`<div class="empty">No subjects assigned yet. Click <b>+ Add Subject</b> to add one.</div>`}</section>`:''}
      <section class="card"><div class="card-title"><b>All Subjects</b><span>Manage subject-to-faculty mapping</span></div><div class="table-wrap"><table><thead><tr><th>Code</th><th>Subject</th><th>Semester</th><th>Credits</th><th>Faculty</th><th>Actions</th></tr></thead><tbody>${all.map(s=>{const fs=Array.isArray(a[s.id])?a[s.id]:[];return `<tr><td class="code">${esc(s.code)}</td><td><b>${esc(s.name)}</b></td><td>${esc(s.semester)}</td><td>${esc(s.credits)}</td><td>${fs.length?fs.map(esc).join('<br>'):'<span style="color:#777">Not assigned</span>'}</td><td><button class="btn small warn" data-edit="${s.id}">Edit</button> <button class="btn small danger" data-del="${s.id}">Delete</button></td></tr>`}).join('')}</tbody></table></div></section>`;
    app.querySelector('#addSubjectBtn').onclick=()=>openSubjectModal();
    app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openSubjectModal(Number(b.dataset.edit)));
    app.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>deleteSubject(Number(b.dataset.del)));
    document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.section==='subjects'));
    const st=document.querySelector('#sectionTitle'); if(st)st.textContent='Subject Management';
  }
  const wait=setInterval(()=>{
    if(!window.FMS)return;
    clearInterval(wait);
    const nav=document.querySelector('nav');
    if(nav&&!document.querySelector('[data-section="profile"]')){
      const group=document.createElement('div');group.className='nav-group';group.textContent='ACCOUNT';nav.appendChild(group);
      const b=document.createElement('button');b.className='nav';b.dataset.section='profile';b.innerHTML='<i>◉</i>Profile';b.onclick=()=>FMS.show('profile');nav.appendChild(b);
    }
    if(nav&&!document.querySelector('[data-section="subjects"]')){
      const b=document.createElement('button');b.className='nav';b.dataset.section='subjects';b.innerHTML='<i>📚</i>Subject Management';b.onclick=renderSubjects;nav.appendChild(b);
    }
    if(typeof FMS.announcement==='function' && !FMS.__subjectPatched){
      const oldShow=FMS.show; FMS.show=section=>section==='announcement'?FMS.announcement():section==='subjects'?renderSubjects():oldShow(section); FMS.__subjectPatched=true;
    }
  },20);
})();