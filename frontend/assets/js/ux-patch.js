// Small compatibility/UX layer for the dashboard.
(() => {
  const wait=setInterval(()=>{
    if(!window.FMS)return;
    clearInterval(wait);
    const nav=document.querySelector('nav');
    if(nav&&!document.querySelector('[data-section="profile"]')){
      const group=document.createElement('div');group.className='nav-group';group.textContent='ACCOUNT';nav.appendChild(group);
      const b=document.createElement('button');b.className='nav';b.dataset.section='profile';b.innerHTML='<i>◉</i>Profile';b.onclick=()=>FMS.show('profile');nav.appendChild(b);
    }
    if(typeof FMS.announcement==='function'){
      const oldShow=FMS.show;FMS.show=section=>section==='announcement'?FMS.announcement():oldShow(section);
    }
  },20);
})();
