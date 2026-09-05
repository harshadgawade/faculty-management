// Small UX compatibility layer for the SPA.
(() => {
  const wait = setInterval(() => {
    if (!window.FMS) return;
    clearInterval(wait);
    const oldShow = FMS.show;
    FMS.show = section => section === 'announcement' ? FMS.announcement() : oldShow(section);
  }, 20);
})();
