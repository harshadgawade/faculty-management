/* FMS 2024 Curriculum UI: department -> year -> semester -> subject -> faculty */
(()=>{
  const curriculum=()=>window.FMS_2024_CURRICULUM||{};
  const facultyMap=()=>window.FMS_2024_FACULTY||{};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getUser=()=>{try{return JSON.parse(localStorage.getItem('user')||'{}')}catch{return {}}};
  const email=()=>String(getUser().email||'').toLowerCase();
  const isFaculty=()=>['FACULTY','TEACHER','PROFESSOR','ASSOC_PROFESSOR','ASST_PROFESSOR','GUEST_LECTURER'].includes(String(getUser().role||'').toUpperCase());
  const storeKey='fms_curriculum_assignments_v1';
  const load=()=>{try{return JSON.parse(localStorage.getItem(storeKey)||'{}')}catch{return {}}};
  const save=x=>localStorage.setItem(storeKey,JSON.stringify(x));
  const facultyDept=()=>{const e=email();for(const [d,fs] of Object.entries(facultyMap()))if(fs.some(x=>String(x[1]).toLowerCase()===e))return d;return getUser().departmentCode||''};
  const subjects=(d,sem)=>window.FMS_2024_subjectsFor?window.FMS_2024_subjectsFor(d,sem):[];
  const allDepts=()=>Object.entries(curriculum());

  function render(){
    const app=document.querySelector('#app'); if(!app||!Object.keys(curriculum()).length)return;
    const u=getUser(), mineDept=facultyDept(), depts=allDepts();
    let dept=isFaculty()?mineDept:(localStorage.getItem('fms_subject_dept')||depts[0]?.[0]);
    if(!curriculum()[dept])dept=depts[0]?.[0];
    let year=Number(localStorage.getItem('fms_subject_year')||1);
    let sem=Number(localStorage.getItem('fms_subject_sem')||1);
    const d=curriculum()[dept];
    if(year>d.years)year=1;
    const validSems=[year*2-1,year*2];
    if(!validSems.includes(sem))sem=validSems[0];
    localStorage.setItem('fms_subject_dept',dept);localStorage.setItem('fms_subject_year',year);localStorage.setItem('fms_subject_sem',sem);
    const list=subjects(dept,sem), assignments=load(), fs=facultyMap()[dept]||[];
    const mine=isFaculty()?list.filter(s=>Array.isArray(assignments[s.id])&&assignments[s.id].map(String).map(x=>x.toLowerCase()).includes(email())):list;
    app.innerHTML=`<div class="page-head"><div><h2>📚 Subject Management</h2><p>2024 curriculum • Manage subjects and department-wise faculty assignments.</p></div><div class="actions"><span class="status">${isFaculty()?'Faculty View':'Academic/Admin View'}</span></div></div>
      <section class="card" style="margin-bottom:18px"><div class="card-title"><b>Curriculum Selection</b><span>Department → Year → Semester</span></div><div class="form-grid">
      <label>Department<select id="curDept" class="input" ${isFaculty()?'disabled':''}>${depts.map(([k,v])=>`<option value="${esc(k)}" ${k===dept?'selected':''}>${esc(v.name)}</option>`).join('')}</select></label>
      <label>Year<select id="curYear" class="input">${Array.from({length:d.years},(_,i)=>i+1).map(y=>`<option value="${y}" ${y===year?'selected':''}>Year ${y}</option>`).join('')}</select></label>
      <label>Semester<select id="curSem" class="input">${validSems.map(s=>`<option value="${s}" ${s===sem?'selected':''}>Semester ${s}</option>`).join('')}</select></label>
      <label>Program<select class="input" disabled><option>${esc(d.name)}</option></select></label></div></section>
      <div class="grid three"><div class="card kpi"><small>Semester Subjects</small><strong>${list.length}</strong><span>2024 curriculum</span></div><div class="card kpi"><small>Assigned Subjects</small><strong>${list.filter(s=>Array.isArray(assignments[s.id])&&assignments[s.id].length).length}</strong><span>Faculty mapped</span></div><div class="card kpi"><small>Department Faculty</small><strong>${fs.length}</strong><span>${esc(d.name)}</span></div></div>
      ${isFaculty()?`<section class="card" style="margin-bottom:18px"><div class="card-title"><b>My Assigned Subjects</b><span>${esc(email())}</span></div>${mine.length?mine.map(s=>`<div class="list-row"><div><b>${esc(s.name)}</b><small>${esc(s.code)} • Semester ${s.semester}</small></div><span class="status">Assigned</span></div>`).join(''):`<div class="empty">No subject assigned to you for this semester.</div>`}</section>`:''}
      <section class="card"><div class="card-title"><b>Subjects — Semester ${sem}</b><span>${esc(d.name)}</span></div><div class="table-wrap"><table><thead><tr><th>#</th><th>Code</th><th>Subject</th><th>Year</th><th>Faculty</th><th>Action</th></tr></thead><tbody>${list.length?list.map((s,i)=>{const assigned=assignments[s.id]||[];return `<tr><td>${i+1}</td><td class="code">${esc(s.code)}</td><td><b>${esc(s.name)}</b></td><td>Year ${Math.ceil(sem/2)}</td><td>${assigned.length?assigned.map(x=>esc(x)).join('<br>'):'<span style="color:#777">Not assigned</span>'}</td><td><button class="btn small primary" data-assign="${esc(s.id)}">${isFaculty()?'Assign to Me':'Assign Faculty'}</button></td></tr>`}).join(''):`<tr><td colspan="6" class="empty">No subjects found for this semester.</td></tr>`}</tbody></table></div></section>`;
    app.querySelector('#curDept')?.addEventListener('change',e=>{localStorage.setItem('fms_subject_dept',e.target.value);localStorage.setItem('fms_subject_year','1');localStorage.setItem('fms_subject_sem','1');render()});
    app.querySelector('#curYear')?.addEventListener('change',e=>{const y=Number(e.target.value);localStorage.setItem('fms_subject_year',y);localStorage.setItem('fms_subject_sem',y*2-1);render()});
    app.querySelector('#curSem')?.addEventListener('change',e=>{localStorage.setItem('fms_subject_sem',e.target.value);render()});
    app.querySelectorAll('[data-assign]').forEach(b=>b.onclick=()=>openAssign(b.dataset.assign,dept,sem));
    document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.section==='subjects'));
    const st=document.querySelector('#sectionTitle');if(st)st.textContent='Subject Management';
  }

  function openAssign(id,dept,sem){
    const s=subjects(dept,sem).find(x=>String(x.id)===String(id));if(!s)return;
    const fs=facultyMap()[dept]||[], assignments=load(), current=assignments[id]||[], u=getUser();
    const box=document.createElement('div');box.className='modal-backdrop';
    const facultyHtml=isFaculty()?`<label style="display:flex;gap:10px;align-items:center;color:#ddd"><input type="checkbox" id="assignMe" ${current.map(String).map(x=>x.toLowerCase()).includes(email())?'checked':''}> Assign <b>${esc(u.fullName||u.name||email())}</b> (${esc(email())})</label>`:`<div style="display:grid;gap:10px">${fs.map(f=>`<label style="display:flex;gap:10px;align-items:center;color:#ddd"><input type="checkbox" name="faculty" value="${esc(f[1])}" ${current.includes(f[1])?'checked':''}> <b>${esc(f[0])}</b> <span style="color:#777">${esc(f[1])}</span></label>`).join('')}</div>`;
    box.innerHTML=`<div class="modal"><div class="modal-head"><div><h3>Assign Faculty</h3><small>${esc(s.code)} — ${esc(s.name)}</small></div><button class="icon" data-close>×</button></div>${facultyHtml}<div class="modal-actions"><button class="btn" data-close>Cancel</button><button class="btn primary" id="saveAssign">Save Assignment</button></div></div>`;
    document.body.appendChild(box);box.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>box.remove());
    box.querySelector('#saveAssign').onclick=()=>{const selected=isFaculty()?(box.querySelector('#assignMe')?.checked?[email()]:[]):[...box.querySelectorAll('input[name="faculty"]:checked')].map(x=>x.value);assignments[id]=selected;save(assignments);box.remove();render()};
  }

  function install(){
    if(!Object.keys(curriculum()).length)return;
    const nav=document.querySelector('#side nav');
    if(!nav)return;
    if(!nav.querySelector('[data-section="subjects"]')){
      const group=document.createElement('div');group.className='nav-group';group.textContent='ACADEMICS';
      const b=document.createElement('button');b.className='nav';b.dataset.section='subjects';b.innerHTML='<i>📚</i>Subject Management';
      b.onclick=()=>render();nav.appendChild(group);nav.appendChild(b);
    }
  }

  // app.js rebuilds the dashboard DOM after this file may have loaded.
  // Observe the sidebar so Subject Management is added after the shell exists.
  const observer=new MutationObserver(()=>install());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>{install();setTimeout(install,300);setTimeout(install,1000)});
  setInterval(install,1500);
})();
