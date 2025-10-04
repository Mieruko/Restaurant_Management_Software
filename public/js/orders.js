// Orders frontend with modal menu selection
let MENU = [];
let TABLES = [];

async function loadOrders(){
  const res = await fetch('/api/orders');
  if(!res.ok) return;
  const orders = await res.json();
  // fetch existing invoices to mark which orders already invoiced
  let invoicedOrderIds = new Set();
  try{
    const ir = await fetch('/api/invoices');
    if(ir.ok){
      const invs = await ir.json();
      (invs||[]).forEach(i => { if(i.orderId) invoicedOrderIds.add(String(i.orderId)); });
    }
  }catch(e){ /* ignore */ }
  const tbody = document.querySelector('.staff-table tbody');
  tbody.innerHTML = '';
  orders.forEach(o => {
    const tr = document.createElement('tr');
    // normalize fields
    const id = o.id || o.ma_order || o.ma_order || '';
    const created = o.createdAt || o.ngay_tao || o.ngay_lap || '';
    const status = o.trangThai || o.tinh_trang_order || o.status || '';
    const table = o.tableId || o.ma_ban || '';
    const customer = o.khachHang || o.ma_kh || '';
    const disableInvoice = invoicedOrderIds.has(String(id));
    tr.innerHTML = `
      <td>${id}</td>
      <td>${created}</td>
      <td>${status}</td>
      <td>${table}</td>
      <td>${customer}</td>
      <td><button data-id="${id}" class="view btn btn-sm btn-outline-primary">Xem</button></td>
      <td>${disableInvoice?'<span class="text-success">Đã tạo hóa đơn</span>':`<button data-id="${id}" class="invoice btn btn-sm btn-success" style="margin-bottom:4px;">Tạo hóa đơn</button>`}<br><button data-id="${id}" class="del btn btn-sm btn-danger">Xóa</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadMenuAndTables(){
  const [mRes, tRes] = await Promise.all([fetch('/api/menu'), fetch('/api/tables')]);
  if(mRes.ok) MENU = await mRes.json();
  if(tRes.ok) TABLES = await tRes.json();
  // normalize MENU items so they always have .id, .tenMon, .gia
  MENU = (MENU || []).map(item => ({
    ...item,
    id: item.id || item.monId || item.ma_mon || item.maMon || null,
    tenMon: item.tenMon || item.ten_mon || item.name || null,
    gia: item.gia || item.price || item.gia_tai_thoi_diem || 0,
  }));

  // normalize TABLES so they always have .id and .tenBan
  TABLES = (TABLES || []).map(t => ({
    ...t,
    id: t.id || t.ma_ban || t.maBan || null,
    tenBan: t.tenBan || t.ten_ban || t.name || (t.id || t.ma_ban ? ('Bàn ' + (t.id || t.ma_ban)) : 'Bàn')
  }));

  const menuList = document.getElementById('menuList');
  menuList.innerHTML = '';
  MENU.forEach(item => {
    // item may use id/monId/ma_mon or tenMon/gia
    const id = item.id || item.monId || item.ma_mon;
    if (id === undefined || id === null) return; // skip invalid menu rows
    const name = item.tenMon || item.name || ('Món ' + (id || ''));
    const price = item.gia || item.price || 0;
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.padding = '6px 4px';
    row.innerHTML = `
      <div>${name} - ${price.toLocaleString()} VNĐ</div>
      <div style="display:flex;gap:6px;align-items:center;">
        <button class="dec" data-id="${id}" aria-label="Giảm">-</button>
        <input data-id="${id}" class="qty" type="number" min="0" value="0" style="width:60px;text-align:center;" />
        <button class="inc" data-id="${id}" aria-label="Tăng">+</button>
      </div>
    `;
    menuList.appendChild(row);
  });

  const tableSelect = document.getElementById('tableSelect');
  tableSelect.innerHTML = '<option value="">-- Chọn --</option>';
  TABLES.forEach(t => {
    const opt = document.createElement('option');
    // ensure value is a string (or empty) and text always set
    opt.value = (t.id !== undefined && t.id !== null) ? String(t.id) : '';
    opt.text = t.tenBan || t.name || ('Bàn ' + (t.id !== undefined && t.id !== null ? t.id : ''));
    tableSelect.appendChild(opt);
  });

  // Ensure we recalc total / enabled state when table selection changes
  tableSelect.addEventListener('change', () => calculateTotal());

  // attach qty change listeners and +/- buttons
  document.querySelectorAll('#menuList .qty').forEach(inp => inp.addEventListener('input', (e)=>{
    let v = Number(e.target.value) || 0; if(v < 0) e.target.value = 0; if(v>99) e.target.value=99; calculateTotal();
  }));
  document.querySelectorAll('#menuList .inc').forEach(b => b.addEventListener('click', (e)=>{
    const id = e.target.getAttribute('data-id');
    const inp = document.querySelector(`#menuList .qty[data-id='${id}']`);
    inp.value = Math.min(99, Number(inp.value||0) + 1);
    calculateTotal();
  }));
  document.querySelectorAll('#menuList .dec').forEach(b => b.addEventListener('click', (e)=>{
    const id = e.target.getAttribute('data-id');
    const inp = document.querySelector(`#menuList .qty[data-id='${id}']`);
    inp.value = Math.max(0, Number(inp.value||0) - 1);
    calculateTotal();
  }));
}

function calculateTotal(){
  let total = 0;
  document.querySelectorAll('#menuList .qty').forEach(inp => {
    const q = Number(inp.value) || 0;
    const id = inp.getAttribute('data-id');
    const item = MENU.find(m => String(m.id) === String(id));
    const price = (item && (item.gia || item.price)) || 0;
    total += q * price;
  });
  document.getElementById('orderTotal').innerText = total;

  // enable submit if table selected and at least one item
  const tableSelected = document.getElementById('tableSelect').value !== '';
  const hasItem = Array.from(document.querySelectorAll('#menuList .qty')).some(i => Number(i.value) > 0);
  const submitBtn = document.getElementById('submitOrder');
  if(submitBtn) submitBtn.disabled = !(tableSelected && hasItem);
}

async function openCreateModal(){
  await loadMenuAndTables();
  // refresh orders to disable tables that already have active orders
  const res = await fetch('/api/orders');
  const orders = res.ok ? await res.json() : [];
  const occupied = new Set(orders.filter(o => o.trangThai && o.trangThai !== 'Đã lập hoá đơn' && o.trangThai !== 'Hoàn thành').map(o => String(o.tableId)));
  const tableSelect = document.getElementById('tableSelect');
  tableSelect.querySelectorAll('option').forEach(opt => {
    if(opt.value === '') return;
    opt.disabled = occupied.has(opt.value);
  });

  // disable submit until valid
  document.getElementById('submitOrder').disabled = true;
  document.getElementById('orderModal').style.display = 'flex';
}

function closeCreateModal(){
  document.getElementById('orderModal').style.display = 'none';
}

async function submitOrderFromModal(){
  const tableIdRaw = document.getElementById('tableSelect').value;
  const tableId = tableIdRaw === '' ? null : Number(tableIdRaw);
  if(!tableId) return alert('Chọn bàn');
   const items = [];
   document.querySelectorAll('#menuList .qty').forEach(inp => {
     const q = Number(inp.value) || 0;
    if(q > 0){
      const id = inp.getAttribute('data-id');
      const monId = Number(id);
      if (!Number.isNaN(monId)) items.push({ monId, soLuong: q, quantity: q });
     }
   });
   if(items.length === 0) return alert('Chọn ít nhất 1 món');

  let res;
  try{
    res = await fetch('/api/orders', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ tableId, items })});
  }catch(e){ return alert('Tạo order lỗi: ' + (e.message || 'network error')); }
  if(!res.ok){
    let msg = 'Tạo order lỗi';
    try{ const j = await res.json(); if(j && (j.error || j.message || j.detail)) msg += ': ' + (j.error || j.message || j.detail); }catch(e){}
    return alert(msg);
  }
  closeCreateModal();
  await loadOrders();
}

async function deleteOrder(id){
  const res = await fetch('/api/orders/'+id, { method: 'DELETE' });
  if(!res.ok) return alert('Xóa lỗi');
  await loadOrders();
}

// attach events
window.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addOrderBtn') || document.querySelector('.add-button');
  addBtn && addBtn.addEventListener('click', openCreateModal);
  loadOrders();

  document.getElementById('cancelOrder')?.addEventListener('click', closeCreateModal);
  document.getElementById('submitOrder')?.addEventListener('click', submitOrderFromModal);

  document.addEventListener('click', (e) => {
    if(e.target.matches('.del')){
      const id = e.target.getAttribute('data-id');
      if(confirm('Xác nhận xóa?')) deleteOrder(id);
    }
    if(e.target.matches('.view')){
      const id = e.target.getAttribute('data-id');
      window.location.href = `order-details.html?id=${id}`;
    }
    if(e.target.matches('.invoice')){
      const id = e.target.getAttribute('data-id');
      if(confirm('Tạo hoá đơn cho order #' + id + '?')) createInvoiceForOrder(id);
    }
  });
});

async function createInvoiceForOrder(orderId){
  // fetch order to get tableId
  const res = await fetch('/api/orders/' + orderId);
  if(!res.ok) return alert('Không tìm thấy order');
  const order = await res.json();
  const r = await fetch('/api/invoices', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ orderId: order.id, tableId: order.tableId })});
  if(!r.ok){
    if(r.status === 409) return alert('Đã có hoá đơn cho đơn này');
    return alert('Tạo hoá đơn lỗi');
  }
  await loadOrders();
  // Nếu đang ở trang hóa đơn thì reload luôn hóa đơn
  if (window.location.pathname.includes('invoices.html')) {
    if (window.loadInvoices) window.loadInvoices();
    else window.location.reload();
  }
  alert('Tạo hoá đơn thành công');
}
