
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
      <td>${(status && String(status).toLowerCase().includes('đã')) ? '<span class="text-success">Đã thanh toán</span>' : `<button data-id="${id}" class="pay">Thanh toán</button>`}</td>
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
      let id = e.target.getAttribute('data-id');
      if(!id) return;
      // ask for payment method
      const method = prompt('Phương thức thanh toán (Tiền mặt / Thẻ / Khác)', 'Tiền mặt');
      if(!method) return;
      if(confirm('Xác nhận thanh toán hoá đơn #' + id + ' bằng ' + method + '?')){
        id = isNaN(Number(id)) ? id : Number(id);
        fetch('/api/invoices/' + id + '/pay', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ method }) })
          .then(r => { if(!r.ok) throw new Error('Thanh toán lỗi'); return r.json(); })
          .then(()=> loadInvoices())
          .catch(err => alert('Thanh toán lỗi'));
      }
    }
  });
});
