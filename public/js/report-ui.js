// Small UI enhancements for the static report page: render a Chart.js bar chart and apply badges
document.addEventListener('DOMContentLoaded', () => {
  const dateInputs = document.querySelectorAll('.report-header .date-picker input[type="date"]');
  const applyBtn = document.querySelector('.report-header .date-picker .add-button');
  const revenueAmountEl = document.querySelector('.revenue-amount');
  const invoiceCountEl = document.querySelector('.report-box .muted');
  const topDishesEl = document.querySelector('.top-dishes');

  const ctxWrap = document.getElementById('reportChart');
  if (!ctxWrap) return;
  let chart = null;

  function formatCurrency(n){ return (Number(n)||0).toLocaleString() + ' VNĐ'; }

  async function loadReport(){
    const from = (dateInputs[0] && dateInputs[0].value) || '';
    const to = (dateInputs[1] && dateInputs[1].value) || '';
    // fetch revenue from API
    try{
      const r = await fetch(`/api/reports/revenue?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      if(r.ok){
        const j = await r.json();
        revenueAmountEl.innerText = formatCurrency(j.tongDoanhThu || 0);
      } else {
        revenueAmountEl.innerText = formatCurrency(0);
      }
    }catch(e){ revenueAmountEl.innerText = formatCurrency(0); }

    // fetch invoices to count
    try{
      const ir = await fetch('/api/invoices');
      if(ir.ok){
        const invs = await ir.json();
        const count = (invs||[]).filter(inv => {
          if(!from && !to) return true;
          const d = (inv.createdAt || inv.ngayTao || inv.ngay_lap || '').toString().split('T')[0];
          if(!d) return false;
          if(from && d < from) return false;
          if(to && d > to) return false;
          return true;
        }).length;
        // find the muted element inside first report-box (which holds invoice count)
        const boxes = document.querySelectorAll('.report-box');
        if(boxes && boxes[0]){
          const muted = boxes[0].querySelector('.muted');
          if(muted) muted.innerText = 'Tổng số hóa đơn: ' + count;
        }
      }
    }catch(e){ /* ignore */ }

    // fetch top foods
    try{
      const tf = await fetch('/api/reports/top-foods');
      if(tf.ok){
        const list = await tf.json();
        // update top-dishes list
        if(topDishesEl){
          topDishesEl.innerHTML = '';
          (list||[]).slice(0,10).forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.tenMon || item.name || item.ten || ''}</span><strong>${item.soLuong || item.so_luong || item.count || 0}</strong>`;
            topDishesEl.appendChild(li);
          });
        }
        // update chart
        if(window.Chart){
          const labels = (list||[]).map(i => i.tenMon || i.name || i.ten || '');
          const data = (list||[]).map(i => Number(i.soLuong || i.so_luong || i.count || 0));
          const ctx = ctxWrap.getContext('2d');
          if(chart) chart.destroy();
          chart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Số lượng bán', data, backgroundColor: ['#f97316','#f97316','#60a5fa','#a78bfa','#34d399','#fb923c','#60a5fa'] }] },
            options: { responsive: true, maintainAspectRatio: false }
          });
        }
      }
    }catch(e){ console.error('load top foods error', e); }
  }

  // initial load
  loadReport();

  // apply button
  if(applyBtn) applyBtn.addEventListener('click', (e)=>{ e.preventDefault(); loadReport(); });

  // small badge formatting for revenue amount already done via CSS; ensure wrapper text
  const revSpan = document.querySelector('.revenue-amount');
  if(revSpan){ revSpan.innerText = revSpan.innerText || '0 VNĐ'; }
});
