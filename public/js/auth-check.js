// Small script to inject Report link when server set cookie isAdmin=1
(function(){
  function getCookie(name){
    const v = document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='));
    if(!v) return null; return decodeURIComponent(v.split('=')[1]||'');
  }
  const isAdmin = getCookie('isAdmin') === '1';
  if(!isAdmin) return;
  // find sidebar and inject report link if missing
  const side = document.querySelector('.sidebar');
  if(!side) return;
  // Check if report link exists
  const has = Array.from(side.querySelectorAll('a')).some(a => a.getAttribute('href') && a.getAttribute('href').includes('report'));
  if(has) return;
  const a = document.createElement('a'); a.href = 'report.html'; a.innerText = 'Báo cáo';
  // insert before staff or at end
  const staffLink = Array.from(side.querySelectorAll('a')).find(x => /staff/i.test(x.href) || /staff/i.test(x.innerText));
  if(staffLink && staffLink.parentNode) staffLink.parentNode.insertBefore(a, staffLink);
  else side.appendChild(a);
})();