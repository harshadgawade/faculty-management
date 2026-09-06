/* FMS final UI fixes: light neumorphic UI + consistent scrolling */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const fallback=[['CS','Computer Science & Engineering'],['IT','Information Technology'],['AIML','Artificial Intelligence & Machine Learning'],['DS','Data Science'],['CYBER','Cyber Security'],['SE','Software Engineering'],['CLOUD','Cloud Computing'],['BCA','Computer Applications'],['ECE','Electronics & Communication'],['EE','Electrical Engineering'],['ME','Mechanical Engineering'],['CE','Civil Engineering'],['AUTO','Automobile Engineering'],['RA','Robotics & Automation'],['BT','Biotechnology'],['BME','Biomedical Engineering'],['MATH','Mathematics'],['PHY','Physics'],['CHEM','Chemistry'],['CM','Commerce & Management'],['ENG','English & Communication'],['BBA','Bachelor of Business Administration']];
  function installCss(){
    if($('#fms-final-css'))return;
    const st=document.createElement('style');st.id='fms-final-css';st.textContent=`
      :root{--bg:#e0e5ec;--panel:#e0e5ec;--line:rgba(255,255,255,.7);--text:#263247;--muted:#68758a;--p:#6d5dfc;--neu-light:#ffffff;--neu-dark:#aeb7c4}
      html{scroll-behavior:smooth;background:#e0e5ec;scrollbar-width:thin;scrollbar-color:#aeb7c4 #e0e5ec}
      body{overflow-x:hidden;background:#e0e5ec!important;color:#263247!important;font-family:Inter,system-ui,sans-serif;scrollbar-width:thin;scrollbar-color:#aeb7c4 #e0e5ec}
      *{scrollbar-width:thin;scrollbar-color:#aeb7c4 #e0e5ec}
      *::-webkit-scrollbar{width:8px;height:8px}
      *::-webkit-scrollbar-track{background:#e0e5ec;border-radius:10px}
      *::-webkit-scrollbar-thumb{background:#aeb7c4;border:2px solid #e0e5ec;border-radius:999px}
      *::-webkit-scrollbar-thumb:hover{background:#929dac}
      *::-webkit-scrollbar-corner{background:#e0e5ec}
      #side{height:100vh!important;max-height:100vh!important;overflow:hidden!important;background:#e0e5ec!important;border-right:0!important;box-shadow:10px 0 24px #aeb7c4,-8px 0 18px #fff!important}
      #side nav{flex:1!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:30px!important}
      .brand{border-bottom:0!important}.logo{box-shadow:6px 6px 12px #aeb7c4,-6px -6px 12px #fff!important}
      .nav{color:#59677c!important;box-shadow:none!important;transition:.2s ease}
      .nav:hover{color:#263247!important;background:#e0e5ec!important;box-shadow:inset 3px 3px 7px #aeb7c4,inset -3px -3px 7px #fff!important}
      .nav.active{color:#263247!important;background:#e0e5ec!important;box-shadow:inset 4px 4px 9px #aeb7c4,inset -4px -4px 9px #fff!important}
      .nav-badge{box-shadow:3px 3px 7px #aeb7c4,-3px -3px 7px #fff!important}
      .profile{border-top:0!important}.avatar{box-shadow:5px 5px 10px #aeb7c4,-5px -5px 10px #fff!important}
      #main{min-width:0;min-height:100vh;background:#e0e5ec!important}
      header{background:rgba(224,229,236,.9)!important;color:#263247!important;border-bottom:0!important;box-shadow:0 8px 18px rgba(174,183,196,.45)!important}
      .icon{color:#59677c!important}.search,.input{background:#e0e5ec!important;color:#263247!important;border:0!important;box-shadow:inset 4px 4px 9px #aeb7c4,inset -4px -4px 9px #fff!important}
      .page{min-width:0}.card{min-width:0;overflow:hidden;background:#e0e5ec!important;color:#263247!important;border:0!important;border-radius:18px!important;box-shadow:8px 8px 18px #aeb7c4,-8px -8px 18px #fff!important}
      .card-title span,.kpi small,.page-head p,.toolbar .input::placeholder,.form-grid label,.task small,.list-row small,.brand small,.profile small{color:#68758a!important}
      .btn{border:0!important;background:#e0e5ec!important;color:#344156!important;border-radius:12px!important;box-shadow:6px 6px 12px #aeb7c4,-6px -6px 12px #fff!important;transition:.15s ease;}
      .btn:hover{filter:none!important;transform:translateY(-1px);box-shadow:7px 7px 14px #aeb7c4,-7px -7px 14px #fff!important}
      .btn:active{transform:translateY(1px);box-shadow:inset 4px 4px 8px #aeb7c4,inset -4px -4px 8px #fff!important}
      .btn.primary{background:#e0e5ec!important;color:#5b4ee6!important;box-shadow:6px 6px 12px #aeb7c4,-6px -6px 12px #fff!important}
      .btn.success,.btn.warn,.btn.danger,.danger{background:#e0e5ec!important;border:0!important;color:#516078!important}
      .banner{background:#e0e5ec!important;border:0!important;box-shadow:8px 8px 18px #aeb7c4,-8px -8px 18px #fff!important}
      .table-wrap{width:100%;max-width:100%;overflow-x:auto!important;overflow-y:auto!important;max-height:65vh!important;border:0!important;border-radius:14px;background:#e0e5ec!important;box-shadow:inset 4px 4px 9px #aeb7c4,inset -4px -4px 9px #fff!important}
      .table-wrap table{min-width:760px}.table-wrap th{color:#68758a!important;border-bottom:1px solid rgba(174,183,196,.35)!important}.table-wrap td{border-bottom:1px solid rgba(174,183,196,.25)!important}.table-wrap tr:hover td{background:rgba(255,255,255,.18)!important}
      .status{background:#e0e5ec!important;color:#3f8f72!important;border:0!important;box-shadow:inset 2px 2px 5px #aeb7c4,inset -2px -2px 5px #fff}
      .task{background:#e0e5ec!important;border:0!important;box-shadow:5px 5px 11px #aeb7c4,-5px -5px 11px #fff!important}
      .calendar-grid{max-height:65vh;overflow-y:auto;padding:4px}.cal-day{background:#e0e5ec!important;color:#263247!important;border:0!important;box-shadow:4px 4px 9px #aeb7c4,-4px -4px 9px #fff!important}.cal-day:hover,.cal-day.has{border:0!important;box-shadow:inset 3px 3px 7px #aeb7c4,inset -3px -3px 7px #fff!important}.cal-day small{color:#6257dc!important}
      .modal-backdrop{overflow:auto;background:rgba(224,229,236,.72)!important;backdrop-filter:blur(8px)}.modal{max-height:90vh;overflow-y:auto;overflow-x:hidden;background:#e0e5ec!important;color:#263247!important;border:0!important;box-shadow:14px 14px 30px #aeb7c4,-14px -14px 30px #fff!important}
      .modal-head h3,.page-head h2,.kpi strong,.report h3,.info-grid h3{color:#263247!important}.toast{background:#e0e5ec!important;color:#263247!important;border:0!important;box-shadow:8px 8px 18px #aeb7c4,-8px -8px 18px #fff!important}
      .task-columns{max-height:calc(100vh - 230px);overflow-y:auto;padding:4px}.fms-select-note{font-size:11px;color:#68758a!important;margin-top:4px}
      textarea{resize:vertical;max-height:300px}
      @media(max-width:720px){.table-wrap{max-height:60vh}.task-columns,.calendar-grid{max-height:none}#side{box-shadow:8px 0 20px #aeb7c4!important}}
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
