
// Minimal invoices frontend helper
async function loadInvoices(){
  const res = await fetch('/api/invoices');
  if(!res.ok) return;
  const invoices = await res.json();
  const tbody = document.querySelector('.staff-table tbody');
  tbody.innerHTML = '';
  invoices.forEach(inv => {
    // Normalize fields for all possible schema variants
    const id = inv.id || inv.ma_hoa_don || inv.maHoaDon || '';
    const created = inv.ngayTao || inv.createdAt || inv.ngay_lap || inv.ngayLap || '';
    const total = inv.total || inv.tong_tien || inv.tongTien || '';
    const status = inv.tinhtrangThanhtoan || inv.tinh_trang_thanh_toan || inv.status || '';
    const method = inv.phuongThuc || inv.phuong_thuc || inv.hinhThuc || '';
  const orderId = inv.orderId || inv.ma_order || inv.maOrder || '';
  const tableId = inv.tableId || inv.ma_ban || inv.maBan || '';
  const customer = inv.customer || inv.ma_kh || inv.maKh || inv.maKh || (inv.raw && (inv.raw.ma_kh || inv.raw.maKh)) || '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${id}</td>
      <td>${created ? (typeof created === 'string' ? created.split('T')[0] : new Date(created).toLocaleDateString('vi-VN')) : ''}</td>
    <td>${total ? Number(total).toLocaleString() : ''}</td>
      <td>${status}</td>
      <td>${method}</td>
      <td>${orderId}</td>
      <td>${tableId}</td>
      <td>${customer}</td>
  <td>${(status && String(status).toLowerCase().includes('đã')) ? '<span class="text-success">Đã thanh toán</span>' : `<button data-id="${id}" data-total="${total}" class="pay btn btn-sm btn-outline-primary">Thanh toán</button>`}</td>
      <td><button data-id="${id}" class="del">Xóa</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteInvoice(id){
  const res = await fetch('/api/invoices/'+id, { method: 'DELETE' });
  if(!res.ok) return alert('Xóa lỗi');
  await loadInvoices();
}

window.addEventListener('DOMContentLoaded', () => {
  // Modal UI tạo hóa đơn
  const openBtn = document.getElementById('openInvoiceModal');
  const modal = document.getElementById('invoiceModal');
  const submitBtn = document.getElementById('submitInvoice');
  const cancelBtn = document.getElementById('cancelInvoice');
  openBtn && openBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
  cancelBtn && cancelBtn.addEventListener('click', () => { modal.style.display = 'none'; });
  submitBtn && submitBtn.addEventListener('click', async () => {
    const orderId = document.getElementById('invoiceOrderId').value.trim();
    if(!orderId) return alert('Vui lòng nhập mã đơn hàng!');
    const payload = { orderId: isNaN(Number(orderId)) ? orderId : Number(orderId) };
    const res = await fetch('/api/invoices', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(!res.ok) return alert('Tạo hóa đơn lỗi');
    modal.style.display = 'none';
    await loadInvoices();
    alert('Tạo hóa đơn thành công!');
  });
  loadInvoices();

  document.addEventListener('click', (e) => {
    if(e.target.matches('.del')){
      const id = e.target.getAttribute('data-id');
      if(confirm('Xác nhận xóa?')) deleteInvoice(id);
    }
    if(e.target.matches('.pay')){
      // open payment modal
      const btn = e.target.closest('.pay');
      const id = btn && btn.getAttribute('data-id');
      const total = btn && btn.getAttribute('data-total');
      if(!id) return;
      // populate modal
      const pm = document.getElementById('paymentModal');
      const pmInvoice = document.getElementById('pm-invoice-id');
      const pmTotal = document.getElementById('pm-total');
      if(pmInvoice) pmInvoice.textContent = '#' + id;
      if(pmTotal) pmTotal.textContent = (Number(total) ? Number(total).toLocaleString('vi-VN') + '₫' : '0₫');
      pm.classList.add('show'); pm.setAttribute('aria-hidden','false');
    }
  });

  // Payment modal handlers
  const paymentModal = document.getElementById('paymentModal');
  const pmClose = document.getElementById('paymentModalClose');
  const pmCancel = document.getElementById('pm-cancel');
  const pmConfirm = document.getElementById('pm-confirm');
  const pmSpinner = document.getElementById('pm-spinner');

  function closePM(){ if(paymentModal){ paymentModal.classList.remove('show'); paymentModal.setAttribute('aria-hidden','true'); } }
  pmClose && pmClose.addEventListener('click', closePM);
  pmCancel && pmCancel.addEventListener('click', closePM);
  // backdrop click closes
  document.querySelector('[data-pm-backdrop]')?.addEventListener('click', closePM);

  pmConfirm && pmConfirm.addEventListener('click', async () => {
    const pmInvoice = document.getElementById('pm-invoice-id')?.textContent?.replace('#','') || '';
    const method = document.querySelector('input[name="pm-method"]:checked')?.value || 'Tiền mặt';
    const note = document.getElementById('pm-note')?.value || '';
    if(!pmInvoice) return alert('Không xác định hoá đơn');
    try{
      pmSpinner && (pmSpinner.style.display = 'flex'); pmConfirm.disabled = true;
      const res = await fetch('/api/invoices/' + encodeURIComponent(pmInvoice) + '/pay', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ method, note }) });
      if(!res.ok) throw new Error('Thanh toán lỗi');
      await loadInvoices();
      closePM();
    }catch(err){
      console.error(err); alert('Thanh toán thất bại');
    }finally{
      pmSpinner && (pmSpinner.style.display = 'none'); pmConfirm.disabled = false;
    }
  });
});
