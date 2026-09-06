/* FMS final UI/functionality fixes: departments, attendance subjects, scrolling and reliable navigation */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const user=()=>{try{return JSON.parse(localStorage.getItem('user')||'{}')}catch{return {}}};
  const FALLBACK_DEPTS=[
    ['CS','Computer Science & Engineering'],['IT','Information Technology'],['AIML','Artificial Intelligence & Machine Learning'],['DS','Data Science'],['CYBER','Cyber Security'],['SE','Software Engineering'],['CLOUD','Cloud Computing'],['BCA','Computer Applications'],['ECE','Electronics & Communication'],['EE','Electrical Engineering'],['ME','Mechanical Engineering'],['CE','Civil Engineering'],['AUTO','Automobile Engineering'],['RA','Robotics & Automation'],['BT','Biotechnology'],['BME','Biomedical Engineering'],['MATH','Mathematics'],['PHY','Physics'],['CHEM','Chemistry'],['CM','Commerce & Management'],['ENG','English & Communication'],['BBA','Bachelor of Business Administration']
  ];
  function departments(){
    const live=(window.FMS_2024_CURRICULUM&&Object.entries(window.FMS_2024_CURRICULUM).map(([code,v])=>[code,v.name]))||[];
    const base=live.length?live:FALLBACK_DEPTS;
    const seen=new Set(); return base.filter(x=>{if(seen.has(x[0]))return false;seen.add(x[0]);return true});
  }
  function allCurriculumSubjects(){
    const out=[],seen=new Set(),C=window.FMS_2024_CURRICULUM||{};
    if(window.FMS_2024_subjectsFor){
      Object.keys(C).forEach(code=>{const years=Number(C[code].years||4);for(let y=1;y<=years;y++)for(const sem of [y*2-1,y*2])for(const s of (window.FMS_2024_subjectsFor(code,sem)||[])){const k=String(s.code||s.id||s.name);if(!seen.has(k)){seen.add(k);out.push({...s,departmentCode:code,departmentName:C[code].name})}}});
    }
    return out;
  }
  function installCss(){
    if($('#fms-final-css'))return;
    const st=document.createElement('style');st.id='fms-final-css';st.textContent=`
      #side{height:100vh!important;max-height:100vh!important;overflow:hidden!important}
      #side nav{flex:1!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:30px!important}
      #side nav::-webkit-scrollbar{width:8px}#side nav::-webkit-scrollbar-thumb{background:rgba(139,92,246,.55);border-radius:8px}
      #app{min-width:0}.table-wrap{overflow-x:auto;overflow-y:auto;max-height:65vh}.table-wrap table{min-width:760px}
      .fms-select-note{font-size:11px;color:#9b9aad;margin-top:4px}
    `;document.head.appendChild(st);
  }
  function ensureDepartments(){
    $$('select[name="departmentId"]').forEach(sel=>{
      const current=sel.value; const list=departments();
      const placeholder=sel.querySelector('option[value=""]');
      sel.innerHTML=(placeholder?placeholder.outerHTML:'<option value="">Select Department</option>')+list.map(([c,n])=>`<option value="${esc(c)}">${esc(c)} — ${esc(n)}</option>`).join('');
      if(current)sel.value=current;
      const label=sel.closest('label');if(label&&!label.querySelector('.fms-select-note')){const n=document.createElement('div');n.className='fms-select-note';n.textContent=`${list.length} departments available`;label.appendChild(n)}
    });
  }
  function ensureAttendanceSubjects(){
    const app=$('#app'); if(!app)return;
    const title=($('#sectionTitle')?.textContent||'').toLowerCase();
    if(!title.includes('attendance'))return;
    const selects=$$('select[name="subjectId"]',app);if(!selects.length)return;
    const curriculum=allCurriculumSubjects();
    const existing=window.Api&&typeof Api.subjects==='function'?null:null;
    selects.forEach(sel=>{
      const current=sel.value;
      const merged=[...curriculum];
      // Keep any backend/local subjects that are not present in the 2024 curriculum.
      try{
        const raw=JSON.parse(localStorage.getItem('fms_subjects_v2')||'[]');
        (Array.isArray(raw)?raw:[]).forEach(s=>{if(!merged.some(x=>String(x.code)===String(s.code))){merged.push(s)}});
      }catch{}
      const seen=new Set();
      sel.innerHTML='<option value="">Select Subject</option>'+merged.filter(s=>{const k=String(s.code||s.id||s.name);if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''))).map(s=>`<option value="${esc(s.id??s.code)}">${esc(s.code||'')} — ${esc(s.name||'')}</option>`).join('');
      if(current)sel.value=current;
      const label=sel.closest('label');if(label&&!label.querySelector('.fms-select-note')){const n=document.createElement('div');n.className='fms-select-note';n.textContent=`${merged.length} subjects available from all departments`;label.appendChild(n)}
    });
  }
  function fixNav(){
    const nav=$('#side nav');if(!nav)return;
    $$('button.nav',nav).forEach(b=>{if(b.dataset.fmsFinalBound)return;b.dataset.fmsFinalBound='1';b.addEventListener('click',()=>{if(window.FMS&&typeof FMS.show==='function'){setTimeout(()=>FMS.show(b.dataset.section),0)}})});
  }
  function refresh(){installCss();fixNav();ensureDepartments();ensureAttendanceSubjects();}
  const observer=new MutationObserver(()=>refresh());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>{refresh();setTimeout(refresh,200);setTimeout(refresh,800);setTimeout(refresh,1600)});
})();
