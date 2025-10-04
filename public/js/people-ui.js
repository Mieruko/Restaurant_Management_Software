// Customers & Staff UI: table-based customers with modal add/edit and API integration
(function(){
  async function api(path, opts){
    const res = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
    if(!res.ok) throw new Error('API error');
    return await res.json();
  }

  // Customers
  async function loadCustomers(){
    try{
      const data = await api('/api/customers', { method: 'GET' });
      renderCustomersTable(data || []);
    }catch(e){ renderCustomersTable([]); }
  }

  function renderCustomersTable(rows){
    const tbody = document.getElementById('customersTbody'); if(!tbody) return; tbody.innerHTML = '';
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(r.tenKhach||'')}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(r.soDienThoai||'')}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(r.gioiTinh||'')}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(r.loai||'')}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(r.diaChi||'')}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">
          <button class="btn ghost edit-customer" data-id="${r.id}">Sửa</button>
          <button class="btn del-customer" data-id="${r.id}" style="background:#ef4444;color:#fff">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // wire actions
    tbody.querySelectorAll('button.edit-customer').forEach(b => b.addEventListener('click', e => openEditCustomer(parseInt(b.dataset.id,10))));
    tbody.querySelectorAll('button.del-customer').forEach(b => b.addEventListener('click', e => doDeleteCustomer(parseInt(b.dataset.id,10))));
  }

  // Staff
  async function loadStaff(){
    try{
      const data = await api('/api/staff', { method: 'GET' });
      renderStaffTable(data || []);
    }catch(e){ renderStaffTable([]); }
  }

  function renderStaffTable(rows){
    const tbody = document.getElementById('staffTbody'); if(!tbody) return; tbody.innerHTML = '';
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(r.tenNhanVien||r.ten_nv||'')}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(r.soDienThoai||r.sdt||'')}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(r.gioiTinh||'')}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(r.chucVu||r.chuc_vu||'')}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(r.diaChi||r.dia_chi||'')}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">
          <button class="btn ghost edit-staff" data-id="${r.id||r.ma_nv}">Sửa</button>
          <button class="btn del-staff" data-id="${r.id||r.ma_nv}" style="background:#ef4444;color:#fff">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('button.edit-staff').forEach(b => b.addEventListener('click', e => openEditStaff(parseInt(b.dataset.id,10))));
    tbody.querySelectorAll('button.del-staff').forEach(b => b.addEventListener('click', e => doDeleteStaff(parseInt(b.dataset.id,10))));
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // modal helpers
  // customers modal
  function openCustomerModal(){ const m = document.getElementById('customerModal'); if(!m) return; m.style.display='flex'; }
  function closeCustomerModal(){ const m = document.getElementById('customerModal'); if(!m) return; m.style.display='none'; clearCustomerForm(); }
  function fillCustomerForm(obj){ if(!obj) return; document.getElementById('custId').value = obj.id || ''; document.getElementById('tenKhach').value = obj.tenKhach || ''; document.getElementById('soDienThoai').value = obj.soDienThoai || ''; document.getElementById('gioiTinh').value = obj.gioiTinh || ''; document.getElementById('loai').value = obj.loai || ''; document.getElementById('diaChi').value = obj.diaChi || ''; document.getElementById('email').value = obj.email || ''; }
  function clearCustomerForm(){ document.getElementById('custId').value=''; document.getElementById('tenKhach').value=''; document.getElementById('soDienThoai').value=''; document.getElementById('gioiTinh').value=''; document.getElementById('loai').value=''; document.getElementById('diaChi').value=''; document.getElementById('email').value=''; document.getElementById('modalTitle').innerText='Thêm khách hàng'; }

  async function openEditCustomer(id){
    try{
      const list = await api('/api/customers', { method: 'GET' });
      const row = (list||[]).find(x=>x.id===id);
      if(!row) return alert('Không tìm thấy khách');
      fillCustomerForm(row);
      document.getElementById('modalTitle').innerText='Sửa khách hàng';
      openCustomerModal();
    }catch(e){ alert('Lỗi tải dữ liệu'); }
  }

  async function doDeleteCustomer(id){
    if(!confirm('Xác nhận xóa khách hàng này?')) return;
    try{ await api('/api/customers/'+id, { method: 'DELETE' }); await loadCustomers(); }catch(e){ alert('Xóa thất bại'); }
  }

  async function doSave(ev){
    ev.preventDefault();
    const id = document.getElementById('custId').value;
    const payload = {
      tenKhach: document.getElementById('tenKhach').value,
      soDienThoai: document.getElementById('soDienThoai').value,
      gioiTinh: document.getElementById('gioiTinh').value,
      loai: document.getElementById('loai').value,
      diaChi: document.getElementById('diaChi').value,
      email: document.getElementById('email').value
    };
    try{
      if(id) {
        await api('/api/customers/'+id, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/api/customers', { method: 'POST', body: JSON.stringify(payload) });
      }
      closeModal();
      await loadCustomers();
    }catch(e){ alert('Lưu thất bại'); }
  }

  // staff modal/actions
  function openStaffModal(){ const m = document.getElementById('staffModal'); if(!m) return; m.style.display='flex'; }
  function closeStaffModal(){ const m = document.getElementById('staffModal'); if(!m) return; m.style.display='none'; clearStaffForm(); }
  function fillStaffForm(obj){ if(!obj) return; document.getElementById('staffId').value = obj.id || obj.ma_nv || ''; document.getElementById('tenNhanVien').value = obj.tenNhanVien || obj.ten_nv || ''; document.getElementById('sdt').value = obj.soDienThoai || obj.sdt || ''; document.getElementById('gioiTinhStaff').value = obj.gioiTinh || ''; document.getElementById('chucVu').value = obj.chucVu || obj.chuc_vu || ''; document.getElementById('diaChiStaff').value = obj.diaChi || obj.dia_chi || ''; }
  function clearStaffForm(){ document.getElementById('staffId').value=''; document.getElementById('tenNhanVien').value=''; document.getElementById('sdt').value=''; document.getElementById('gioiTinhStaff').value=''; document.getElementById('chucVu').value=''; document.getElementById('diaChiStaff').value=''; document.getElementById('staffModalTitle').innerText='Thêm nhân viên'; }

  async function openEditStaff(id){
    try{
      const list = await api('/api/staff', { method: 'GET' });
      const row = (list||[]).find(x=> (x.id===id) || (x.ma_nv===id));
      if(!row) return alert('Không tìm thấy nhân viên');
      fillStaffForm(row);
      document.getElementById('staffModalTitle').innerText='Sửa nhân viên';
      openStaffModal();
    }catch(e){ alert('Lỗi tải dữ liệu'); }
  }

  async function doDeleteStaff(id){
    if(!confirm('Xác nhận xóa nhân viên này?')) return;
    try{ await api('/api/staff/'+id, { method: 'DELETE' }); await loadStaff(); }catch(e){ alert('Xóa thất bại'); }
  }

  async function doSearch(q){
    try{
      const list = await api('/api/customers', { method: 'GET' });
      const filtered = (list||[]).filter(s => (s.tenKhach||'').toLowerCase().includes(q) || (s.soDienThoai||'').includes(q));
      renderTable(filtered);
    }catch(e){ renderTable([]); }
  }

  // wire DOM
  document.addEventListener('DOMContentLoaded', ()=>{
    // customers wiring
    const addBtn = document.querySelector('.add-button'); if(addBtn) addBtn.addEventListener('click', ()=>{ clearCustomerForm(); openCustomerModal(); });
    const cancel = document.getElementById('cancelBtn'); if(cancel) cancel.addEventListener('click', e=>{ e.preventDefault(); closeCustomerModal(); });
    const form = document.getElementById('customerForm'); if(form) form.addEventListener('submit', doSave);
    const search = document.getElementById('customerSearch'); if(search) search.addEventListener('input', e => doSearch(String(e.target.value||'').toLowerCase()));
    const modal = document.getElementById('customerModal'); if(modal) modal.addEventListener('click', e => { if(e.target===modal) closeCustomerModal(); });

    // staff wiring
    const staffAdd = document.querySelector('.add-button'); // same selector on staff page
    if(staffAdd && document.getElementById('staffTable')) staffAdd.addEventListener('click', ()=>{ clearStaffForm(); openStaffModal(); });
    const staffCancel = document.getElementById('staffCancelBtn'); if(staffCancel) staffCancel.addEventListener('click', e=>{ e.preventDefault(); closeStaffModal(); });
    const staffForm = document.getElementById('staffForm'); if(staffForm) staffForm.addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      const id = document.getElementById('staffId').value;
      const payload = { tenNhanVien: document.getElementById('tenNhanVien').value, soDienThoai: document.getElementById('sdt').value, gioiTinh: document.getElementById('gioiTinhStaff').value, chucVu: document.getElementById('chucVu').value, diaChi: document.getElementById('diaChiStaff').value };
      try{
        if(id) await api('/api/staff/'+id, { method: 'PUT', body: JSON.stringify(payload) }); else await api('/api/staff', { method: 'POST', body: JSON.stringify(payload) });
        closeStaffModal(); await loadStaff();
      }catch(e){ alert('Lưu thất bại'); }
    });
    const staffSearch = document.getElementById('staffSearch'); if(staffSearch) staffSearch.addEventListener('input', async e => { const q=String(e.target.value||'').toLowerCase(); try{ const list = await api('/api/staff', { method: 'GET' }); renderStaffTable((list||[]).filter(s => (s.tenNhanVien||s.ten_nv||'').toLowerCase().includes(q) || (s.soDienThoai||s.sdt||'').includes(q))); }catch(e){ renderStaffTable([]); } });
    const staffModal = document.getElementById('staffModal'); if(staffModal) staffModal.addEventListener('click', e => { if(e.target===staffModal) closeStaffModal(); });

    // load whichever page
    if(document.getElementById('customersTable')) loadCustomers();
    if(document.getElementById('staffTable')) loadStaff();
  });

  // keep minimal staff helper for staff page if referenced
  window._peopleUI = { refreshCustomers: loadCustomers };
})();
