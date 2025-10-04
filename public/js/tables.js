// Dynamic tables UI: fetch /api/tables and render clickable table cards
let MANAGER_MODE = false; // when true, show status-edit controls

function createManagerToggle(){
  // insert a small toggle button near the top of the page
  const main = document.querySelector('.main') || document.body;
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '8px';
  // manager toggle UI: label + pill
  const toggleLabel = document.createElement('div'); toggleLabel.className = 'manager-toggle';
  const label = document.createElement('div'); label.className = 'label'; label.innerText = 'Chế độ quản lý';
  const pill = document.createElement('div'); pill.className = 'pill'; pill.innerText = 'TẮT';
  pill.addEventListener('click', () => {
    MANAGER_MODE = !MANAGER_MODE;
    pill.innerText = MANAGER_MODE ? 'BẬT' : 'TẮT';
    pill.classList.toggle('on', MANAGER_MODE);
    loadTables();
  });
  toggleLabel.appendChild(label); toggleLabel.appendChild(pill);
  wrapper.appendChild(toggleLabel);
  // place before the table grid if possible
  const grid = document.querySelector('.table-grid');
  if (grid && grid.parentNode) grid.parentNode.insertBefore(wrapper, grid);
  else main.insertBefore(wrapper, main.firstChild);
}

async function loadTables(){
  const res = await fetch('/api/tables');
  const grid = document.querySelector('.table-grid');
  if(!res.ok){ grid.innerHTML = '<p>Không thể tải danh sách bàn</p>'; return; }
  const tables = await res.json();
  grid.innerHTML = '';
  tables.forEach(t => {
    const id = t.id || t.ma_ban || t.maBan || t.maBan;
    const name = t.tenBan || t.ten_ban || (`Bàn ${id}`);
    const status = t.trangThai || t.tinh_trang || t.trang_thai || '';
    const div = document.createElement('div');
    div.className = 'table-item';
    div.setAttribute('data-ban', id);
    div.style.cursor = 'pointer';
    // main label
    const label = document.createElement('div');
    label.className = 'table-name';
    label.innerText = name;
    label.style.fontWeight = '600';
    // status display
    const statusEl = document.createElement('div');
    statusEl.className = 'table-status';
    statusEl.innerText = status;
    statusEl.style.fontSize = '0.9em';
    statusEl.style.marginTop = '6px';
    // Luôn ưu tiên trạng thái order mới nhất nếu có
    (async () => {
      try {
        const r = await fetch(`/api/orders/get_order_details?ma_ban=${id}`, { headers: { 'Accept': 'application/json' } });
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data) && data.length > 0) {
            // tìm order có trạng thái ưu tiên: Đang phục vụ > Đã lập hoá đơn > Hoàn thành > ...
            const first = data[0];
            const oStatus = first.trangThai || first.tinh_trang_order || first.trang_thai || '';
            if (oStatus) statusEl.innerText = String(oStatus);
            else statusEl.innerText = status || 'Có order';
          } else {
            statusEl.innerText = status || 'Trống';
          }
        } else {
          statusEl.innerText = status || 'Trống';
        }
      } catch (err) {
        statusEl.innerText = status || 'Trống';
      }
    })();
  // controls container (View / Edit / Delete) or manager select
  const ctrl = document.createElement('div');
  ctrl.className = 'table-ctrl';
  ctrl.style.marginTop = '8px';
  if (MANAGER_MODE) {
    const sel = document.createElement('select');
    ['Trống','Đang sử dụng','Đã đặt','Đang dọn','Khóa'].forEach(s => {
      const opt = document.createElement('option'); opt.value = s; opt.innerText = s; if (s === status) opt.selected = true; sel.appendChild(opt);
    });
    sel.addEventListener('change', async (e) => {
      const newStatus = e.target.value;
      try{
        const r = await fetch('/api/tables/' + id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ trangThai: newStatus }) });
        if (!r.ok) { alert('Cập nhật trạng thái thất bại'); return; }
        await loadTables();
      }catch(err){ alert('Lỗi khi cập nhật trạng thái'); }
    });
    ctrl.appendChild(sel);
  } else {
    // View button
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-small btn-view';
    viewBtn.innerText = 'Xem';
    viewBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try{
        const r = await fetch(`/api/orders/get_order_details?ma_ban=${id}`);
        if (r.ok) {
          const html = await r.text();
          document.getElementById('order-details').innerHTML = html;
        } else {
          document.getElementById('order-details').innerHTML = '<p>Không có dữ liệu order cho bàn này.</p>';
        }
      }catch(e){ document.getElementById('order-details').innerHTML = '<p>Lỗi khi tải dữ liệu.</p>'; }
    });

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-small btn-edit';
    editBtn.innerText = 'Sửa';
    editBtn.addEventListener('click', (e) => { e.stopPropagation(); openEditModal({ id, name, status, so_nguoi: t.so_nguoi, vi_tri: t.vi_tri }); });

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-small btn-delete';
    delBtn.innerText = 'Xóa';
    delBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if(!confirm('Xóa bàn này?')) return;
      try{
        const r = await fetch('/api/tables/' + id, { method: 'DELETE' });
        if(!r.ok) return alert('Xóa thất bại');
        await loadTables();
      }catch(err){ alert('Lỗi khi xóa'); }
    });

    ctrl.appendChild(viewBtn);
    ctrl.appendChild(editBtn);
    ctrl.appendChild(delBtn);
  }

    div.appendChild(label);
    div.appendChild(statusEl);
    div.appendChild(ctrl);
    grid.appendChild(div);
  });

  // attach click handler to request order details (HTML fragment)
  document.querySelectorAll('.table-item').forEach(item => {
    item.addEventListener('click', async () => {
      const maBan = item.getAttribute('data-ban');
      try{
        const r = await fetch(`/api/orders/get_order_details?ma_ban=${maBan}`);
        const html = await r.text();
        document.getElementById('order-details').innerHTML = html;
      }catch(e){
        document.getElementById('order-details').innerHTML = '<p>Lỗi khi tải dữ liệu.</p>';
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  createManagerToggle();
  loadTables();
  document.querySelector('.add-button')?.addEventListener('click', async () => {
    const name = prompt('Tên bàn mới:');
    if(!name) return;
    try{
      const r = await fetch('/api/tables', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ tenBan: name }) });
      if(!r.ok) return alert('Tạo bàn lỗi');
      await loadTables();
    }catch(e){ alert('Tạo bàn lỗi'); }
  });
});

// Modal handling: create once and reuse
function ensureModalExists(){
  if (document.getElementById('tableEditBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.id = 'tableEditBackdrop';
  backdrop.className = 'modal-backdrop';
  const card = document.createElement('div');
  card.className = 'modal-card';
  card.innerHTML = `
    <h3>Chỉnh sửa bàn</h3>
    <div class="modal-row"><label>Tên bàn</label><input id="modalTenBan" /></div>
    <div class="modal-row"><label>Trạng thái</label>
      <select id="modalTrangThai"><option>Trống</option><option>Đang sử dụng</option><option>Đã đặt</option><option>Đang dọn</option><option>Khóa</option></select>
    </div>
    <div class="modal-row"><label>Số người</label><input id="modalSoNguoi" type="number" min="1" /></div>
    <div class="modal-row"><label>Vị trí</label><input id="modalViTri" /></div>
    <div class="modal-actions"><button id="modalCancel" class="btn-ghost">Hủy</button><button id="modalSave" class="btn-primary">Lưu</button></div>
  `;
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);
  // wire close
  document.getElementById('modalCancel').addEventListener('click', () => { backdrop.style.display = 'none'; });
}

function openEditModal({ id, name, status, so_nguoi, vi_tri }){
  ensureModalExists();
  const backdrop = document.getElementById('tableEditBackdrop');
  document.getElementById('modalTenBan').value = name || '';
  document.getElementById('modalTrangThai').value = status || 'Trống';
  document.getElementById('modalSoNguoi').value = so_nguoi || '';
  document.getElementById('modalViTri').value = vi_tri || '';
  backdrop.style.display = 'flex';
  // save handler
  const save = async () => {
    const payload = {
      tenBan: document.getElementById('modalTenBan').value,
      trangThai: document.getElementById('modalTrangThai').value,
      soNguoi: Number(document.getElementById('modalSoNguoi').value) || null,
      viTri: document.getElementById('modalViTri').value || null
    };
    try{
      const r = await fetch('/api/tables/' + id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if (!r.ok) { alert('Lưu thất bại'); return; }
      backdrop.style.display = 'none';
      await loadTables();
    }catch(e){ alert('Lỗi khi lưu'); }
  };
  const btn = document.getElementById('modalSave');
  btn.onclick = save;
}
