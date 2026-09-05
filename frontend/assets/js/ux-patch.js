// Compatibility layer. The dashboard now owns all section/modal routing.
(() => {
  const wait=setInterval(()=>{
    if(!window.FMS)return;
    clearInterval(wait);
    if(typeof FMS.announcement==='function'){
      const oldShow=FMS.show;
      FMS.show=section=>section==='announcement'?FMS.announcement():oldShow(section);
    }
  },20);
})();
