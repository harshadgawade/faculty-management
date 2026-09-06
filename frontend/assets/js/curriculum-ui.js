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
  const deptEntries=()=>Object.entries(curriculum());
  const subjects=(d,sem)=>window.FMS_2024_subjectsFor?window.FMS_2024_subjectsFor(d,sem):[];
  function assignedSubjects(d,sem){const a=load();return subjects(d,sem).filter(s=>Array.isArray(a[s.id])&&a[s.id].length)}
  function render(){
    const app=document.querySelector('#app'); if(!app||!Object.keys(curriculum()).length)return;
    const u=getUser(), mineDept=facultyDept(), allDepts=deptEntries();
    let selectedDept=isFaculty()?mineDept:(localStorage.getItem('fms_subject_dept')||allDepts[0]?.[0]);
    if(!curriculum()[selectedDept])selectedDept=allDepts[0]?.[0];
    let selectedYear=Number(localStorage.getItem('fms_subject_year')||1);
    let selectedSem=Number(localStorage.getItem('fms_subject_sem')||1);
    const d=curriculum()[selectedDept];
    if(selectedYear>d.years)selectedYear=1;
    const maxSem=selectedYear*2;
    if(selectedSem>maxSem||selectedSem<selectedYear*2-1)selectedSem=selectedYear*2-1;
    localStorage.setItem('fms_subject_dept',selectedDept);localStorage.setItem('fms_subject_year',selectedYear);localStorage.setItem('fms_subject_sem',selectedSem);
    const list=subjects(selectedDept,selectedSem), a=load(), fs=facultyMap()[selectedDept]||[];
    const mine=isFaculty()?list.filter(s=>Array.isArray(a[s.id])&&a[s.id].map(String).map(x=>x.toLowerCase()).includes(email())):list;
    app.innerHTML=`<div class="page-head"><div><h2>📚 Subject & Faculty Management</h2><p>2024 curriculum • Select department, year and semester to manage core subjects.</p></div><div class="actions"><span class="status">${isFaculty()?'Faculty View':'Academic/Admin View'}</span></div></div>
      <section class="card" style="margin-bottom:18px"><div class="card-title"><b>Curriculum Selection</b><span>Department → Year → Semester</span></div><div class="form-grid">
      <label>Department<select id="curDept" class="input" ${isFaculty()?'disabled':''}>${allDepts.map(([k,v])=>`<option value="${esc(k)}" ${k===selectedDept?'selected':''}>${esc(v.name)}</option>`).join('')}</select></label>
      <label>Year<select id="curYear" class="input">${Array.from({length:d.years},(_,i)=>i+1).map(y=>`<option value="${y}" ${y===selectedYear?'selected':''}>Year ${y}</option>`).join('')}</select></label>
      <label>Semester<select id="curSem" class="input">${[selectedYear*2-1,selectedYear*2].map(s=>`<option value="${s}" ${s===selectedSem?'selected':''}>Semester ${s}</option>`).join('')}</select></label>
      <label>Program<select class="input" disabled><option>${esc(d.name)}</option></select></label>
      </div></section>
      <div class="grid three"><div class="card kpi"><small>Semester Subjects</small><strong>${list.length}</strong><span>2024 core/elective curriculum entries</span></div><div class="card kpi"><small>Assigned Subjects</small><strong>${assignedSubjects(selectedDept,selectedSem).length}</strong><span>Faculty mapped</span></div><div class="card kpi"><small>Faculty</small><strong>${fs.length}</strong><span>${esc(d.name)} department</span></div></div>
      ${isFaculty()?`<section class="card" style="margin-bottom:18px"><div class="card-title"><b>My Assigned Subjects</b><span>${esc(email())}</span></div>${mine.length?mine.map(s=>`<div class="list-row"><div><b>${esc(s.name)}</b><small>${esc(s.code)} • Year ${Math.ceil(s.semester/2)} • Semester ${s.semester}</small></div><span class="status">Assigned</span></div>`).join(''):`<div class="empty">No subject assigned to you for this semester.</div>`}</section>`:''}
      <section class="card"><div class="card-title"><b>Core Subjects — Semester ${selectedSem}</b><span>${esc(d.name)}</span></div><div class="table-wrap"><table><thead><tr><th>#</th><th>Subject Code</th><th>Subject</th><th>Year</th><th>Faculty Assignment</th><th>Action</th></tr></thead><tbody>${list.map((s,i)=>{const assigned=a[s.id]||[];return `<tr><td>${i+1}</td><td class="code">${esc(s.code)}</td><td><b>${esc(s.name)}</b></td><td>Year ${Math.ceil(selectedSem/2)}</td><td>${assigned.length?assigned.map(x=>esc(x)).join('<br>'):'<span style="color:#777">Not assigned</span>'}</td><td><button class="btn small primary" data-assign="${esc(s.id)}">${isFaculty()?'Assign to Me':'Assign Faculty'}</button></td></tr>`}).join('')}</tbody></table></div></section>`;
    app.querySelector('#curDept')?.addEventListener('change',e=>{localStorage.setItem('fms_subject_dept',e.target.value);localStorage.setItem('fms_subject_year','1');localStorage.setItem('fms_subject_sem','1');render()});
    app.querySelector('#curYear')?.addEventListener('change',e=>{localStorage.setItem('fms_subject_year',e.target.value);localStorage.setItem('fms_subject_sem',String(Number(e.target.value)*2-1));render()});
    app.querySelector('#curSem')?.addEventListener('change',e=>{localStorage.setItem('fms_subject_sem',e.target.value);render()});
    app.querySelectorAll('[data-assign]').forEach(b=>b.onclick=()=>openAssign(b.dataset.assign,selectedDept,selectedSem));
    document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.section==='subjects'));
    const st=document.querySelector('#sectionTitle');if(st)st.textContent='Subject Management';
  }
  function openAssign(id,dept,sem){
    const s=subjects(dept,sem).find(x=>String(x.id)===String(id));if(!s)return;
    const fs=facultyMap()[dept]||[], a=load(), current=a[id]||[], u=getUser();
    const box=document.createElement('div');box.className='modal-backdrop';
    const facultyHtml=isFaculty()?`<label style="display:flex;gap:10px;align-items:center;color:#ddd"><input type="checkbox" id="assignMe" ${current.map(String).map(x=>x.toLowerCase()).includes(email())?'checked':''}> Assign <b>${esc(u.fullName||u.name||email())}</b> (${esc(email())})</label>`:`<div style="display:grid;gap:10px">${fs.map(f=>`<label style="display:flex;gap:10px;align-items:center;color:#ddd"><input type="checkbox" name="faculty" value="${esc(f[1])}" ${current.includes(f[1])?'checked':''}> <b>${esc(f[0])}</b> <span style="color:#777">${esc(f[1])}</span></label>`).join('')}</div>`;
    box.innerHTML=`<div class="modal"><div class="modal-head"><div><h3>Assign Faculty</h3><small>${esc(s.code)} — ${esc(s.name)}</small></div><button class="icon" data-close>×</button></div>${facultyHtml}<div class="modal-actions"><button class="btn" data-close>Cancel</button><button class="btn primary" id="saveAssign">Save Assignment</button></div></div>`;
    document.body.appendChild(box);box.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>box.remove());
    box.querySelector('#saveAssign').onclick=()=>{let selected=isFaculty()?(box.querySelector('#assignMe')?.checked?[email()]:[]):[...box.querySelectorAll('input[name="faculty"]:checked')].map(x=>x.value);a[id]=selected;save(a);box.remove();render()};
  }
  function install(){
    if(!window.FMS||!Object.keys(curriculum()).length)return;
    if(!document.querySelector('[data-section="subjects"]')){const nav=document.querySelector('nav');if(nav){const b=document.createElement('button');b.className='nav';b.dataset.section='subjects';b.innerHTML='<i>📚</i>Subject Management';b.onclick=render;nav.appendChild(b)}}
    if(!window.FMS.__curriculumSubjectPatched){const old=window.FMS.show;window.FMS.show=s=>s==='subjects'?render():old(s);window.FMS.__curriculumSubjectPatched=true}
  }
  const timer=setInterval(()=>{if(window.FMS&&Object.keys(curriculum()).length){clearInterval(timer);install()}},50);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(install,100));
})();
