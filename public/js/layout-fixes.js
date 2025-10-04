// Small layout helpers: ensure .page-title exists and move top-action buttons into consistent place
document.addEventListener('DOMContentLoaded', () => {
  // move primary .add-button into top-right of .main header if present
  const main = document.querySelector('.main');
  if (!main) return;
  const firstH = main.querySelector('h1');
  if (!firstH) return;
  firstH.classList.add('page-title');
  const btn = main.querySelector('.add-button');
  if (btn) {
    btn.style.marginLeft = 'auto';
    // wrap into a header flex
    const hdr = document.createElement('div'); hdr.style.display = 'flex'; hdr.style.alignItems = 'center'; hdr.style.gap='12px';
    firstH.parentNode.insertBefore(hdr, firstH);
    hdr.appendChild(firstH);
    hdr.appendChild(btn);
  }
});
