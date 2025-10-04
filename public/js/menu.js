(async function(){
  async function fetchMenu(){
    try{
      const res = await fetch('/api/menu');
      if(!res.ok) return [];
      return await res.json();
    }catch(e){ return []; }
  }

  function fmtCurrency(v){ if(v==null) return ''; return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(Number(v)); }

  function createCard(it){
    const id = it.id || it.ma_mon || it.id;
    const name = it.tenMon || it.ten_mon || it.name || 'Món';
    const price = it.gia || it.price || 0;
    const img = it.image || it.anh || 'https://via.placeholder.com/120x80?text=No+Image';

    const card = document.createElement('div'); card.className = 'menu-item';
    const imgEl = document.createElement('img'); imgEl.src = img;
    const info = document.createElement('div'); info.style.padding = '8px'; info.style.width='100%'; info.style.boxSizing='border-box';
    const title = document.createElement('div'); title.textContent = name; title.style.fontSize='13px'; title.style.marginBottom='8px'; title.style.color='#b33426';
    const priceEl = document.createElement('div'); priceEl.className='price'; priceEl.textContent = fmtCurrency(price);
    info.appendChild(title);
    card.appendChild(imgEl);
    card.appendChild(info);
    card.appendChild(priceEl);

    card.addEventListener('click', () => {
      // open edit modal for this item
      openMenuModal({ id, name, price, image: img });
    });
    return card;
  }

  async function renderGrid(){
    const items = await fetchMenu();
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = '';
    (items||[]).forEach(it => grid.appendChild(createCard(it)));
  }

  // Modal helpers
  function ensureMenuModal(){
    const b = document.getElementById('menuModalBackdrop');
    if(!b) return;
    document.getElementById('m_cancel').addEventListener('click', ()=>{ b.classList.remove('show'); });
    document.getElementById('m_save').addEventListener('click', async ()=>{
      const name = document.getElementById('m_name').value;
      const type = document.getElementById('m_type').value;
      const price = Number(document.getElementById('m_price').value) || 0;
      const image = document.getElementById('m_image').value || null;
      const payload = { tenMon: name, loai: type, gia: price, image };
      const r = await fetch('/api/menu', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if(!r.ok) return alert('Tạo món lỗi');
      document.getElementById('menuModalBackdrop').classList.remove('show');
      await renderGrid();
    });
  }

  function openMenuModal(data){
    const b = document.getElementById('menuModalBackdrop');
    if(!b) return;
    document.getElementById('m_name').value = data?.name || data?.tenMon || '';
    document.getElementById('m_type').value = data?.type || data?.loai || '';
    document.getElementById('m_price').value = data?.price || data?.gia || '';
    document.getElementById('m_image').value = data?.image || '';
    b.classList.add('show');
  }

  // wire add button
  document.addEventListener('DOMContentLoaded', ()=>{
    const btn = document.getElementById('addMenuBtn');
    btn && btn.addEventListener('click', ()=> openMenuModal({}));
    ensureMenuModal();
    renderGrid();
  });

})();
