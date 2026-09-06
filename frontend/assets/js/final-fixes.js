/* FMS final UI fixes: consistent glass/dark scrolling everywhere */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fallback=[['CS','Computer Science & Engineering'],['IT','Information Technology'],['AIML','Artificial Intelligence & Machine Learning'],['DS','Data Science'],['CYBER','Cyber Security'],['SE','Software Engineering'],['CLOUD','Cloud Computing'],['BCA','Computer Applications'],['ECE','Electronics & Communication'],['EE','Electrical Engineering'],['ME','Mechanical Engineering'],['CE','Civil Engineering'],['AUTO','Automobile Engineering'],['RA','Robotics & Automation'],['BT','Biotechnology'],['BME','Biomedical Engineering'],['MATH','Mathematics'],['PHY','Physics'],['CHEM','Chemistry'],['CM','Commerce & Management'],['ENG','English & Communication'],['BBA','Bachelor of Business Administration']];
  function installCss(){
    if($('#fms-final-css'))return;
    const st=document.createElement('style');st.id='fms-final-css';st.textContent=`
      html{scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:rgba(139,92,246,.55) rgba(17,17,29,.85)}
      body{overflow-x:hidden;scrollbar-width:thin;scrollbar-color:rgba(139,92,246,.55) rgba(17,17,29,.85)}
      *{scrollbar-width:thin;scrollbar-color:rgba(139,92,246,.55) rgba(17,17,29,.85)}
      *::-webkit-scrollbar{width:8px;height:8px}
      *::-webkit-scrollbar-track{background:rgba(17,17,29,.72);border-radius:10px}
      *::-webkit-scrollbar-thumb{background:linear-gradient(180deg,rgba(167,139,250,.72),rgba(109,40,217,.72));border:2px solid rgba(17,17,29,.72);border-radius:999px}
      *::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,rgba(196,181,253,.9),rgba(124,58,237,.9))}
      *::-webkit-scrollbar-corner{background:#11111d}
      #side{height:100vh!important;max-height:100vh!important;overflow:hidden!important}
      #side nav{flex:1!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:30px!important}
      #main{min-width:0;min-height:100vh}.page{min-width:0}.card{min-width:0;overflow:hidden}
      .table-wrap{width:100%;max-width:100%;overflow-x:auto!important;overflow-y:auto!important;max-height:65vh!important;border:1px solid rgba(43,43,60,.75);border-radius:12px;background:rgba(17,17,29,.35)}
      .table-wrap table{min-width:760px}.table-wrap::-webkit-scrollbar{width:8px;height:8px}
      .task-columns{max-height:calc(100vh - 230px);overflow-y:auto;padding-right:4px}
      .calendar-grid{max-height:65vh;overflow-y:auto;padding-right:4px}
      .modal-backdrop{overflow:auto}.modal{max-height:90vh;overflow-y:auto;overflow-x:hidden}
      textarea{resize:vertical;max-height:300px}.fms-select-note{font-size:11px;color:#9b9aad;margin-top:4px}
      @media(max-width:720px){.table-wrap{max-height:60vh}.task-columns,.calendar-grid{max-height:none}}
    `;document.head.appendChild(st)
  }
  async function fillDepartments(sel){if(!sel||!window.Api)return;let live=[];try{live=await Api.departments()}catch{}if(!Array.isArray(live)||!live.length)live=fallback.map((x,i)=>({id:i+1,code:x[0],name:x[1]}));const current=sel.value;sel.innerHTML='<option value="">Select Department</option>'+live.map(d=>`<option value="${esc(d.id)}">${esc(d.code||'')} — ${esc(d.name||'')}</option>`).join('');if(current)sel.value=current;const label=sel.closest('label');if(label&&!label.querySelector('.fms-select-note')){const n=document.createElement('div');n.className='fms-select-note';n.textContent=`${live.length} departments available`;label.appendChild(n)}}
  function fixDepartments(){$$('select[name="departmentId"]').forEach(sel=>{if(sel.options.length<10||![...sel.options].some(o=>o.value&&/^\d+$/.test(o.value)))fillDepartments(sel)})}
  async function fixAttendanceSubjects(){const title=($('#sectionTitle')?.textContent||'').toLowerCase();if(!title.includes('attendance'))return;const selects=$$('select[name="subjectId"]');if(!selects.length||!window.Api)return;let subjects=[];try{subjects=await Api.subjects()}catch{}if(!Array.isArray(subjects)||!subjects.length)return;selects.forEach(sel=>{const current=sel.value,seen=new Set();sel.innerHTML='<option value="">Select Subject</option>'+subjects.filter(s=>{const k=String(s.code||s.id);if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''))).map(s=>`<option value="${esc(s.id)}">${esc(s.code||'')} — ${esc(s.name||'')} (${esc(s.departmentCode||'')})</option>`).join('');if(current)sel.value=current;const label=sel.closest('label');if(label&&!label.querySelector('.fms-select-note')){const n=document.createElement('div');n.className='fms-select-note';n.textContent=`${subjects.length} subjects available`;label.appendChild(n)}})}
  function fixNav(){const nav=$('#side nav');if(!nav)return;$$('.nav',nav).forEach(b=>{if(b.dataset.fmsFinalBound)return;b.dataset.fmsFinalBound='1';b.addEventListener('click',()=>{if(window.FMS&&typeof FMS.show==='function')setTimeout(()=>FMS.show(b.dataset.section),0)})})}
  async function refresh(){installCss();fixNav();fixDepartments();await fixAttendanceSubjects()}
  const observer=new MutationObserver(()=>{clearTimeout(window.__fmsFinalTimer);window.__fmsFinalTimer=setTimeout(refresh,80)});observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>{refresh();setTimeout(refresh,300);setTimeout(refresh,1000);setTimeout(refresh,1800)});window.FMS_FINAL_REFRESH=refresh;
})();
