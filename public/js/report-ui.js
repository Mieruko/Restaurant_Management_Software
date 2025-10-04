// Small UI enhancements for the static report page: render a Chart.js bar chart and apply badges
document.addEventListener('DOMContentLoaded', () => {
  const dateInputs = document.querySelectorAll('.report-header .date-picker input[type="date"]');
  const applyBtn = document.querySelector('.report-header .date-picker .add-button');
  const revenueAmountEl = document.querySelector('.revenue-amount');
  const invoiceCountEl = document.querySelector('.report-box .muted');
  const topDishesEl = document.querySelector('.top-dishes');

  const ctxWrap = document.getElementById('reportChart');
  const chartPlaceholder = document.getElementById('reportChartPlaceholder');
  if (!ctxWrap) return;
  let chart = null;

  // helper to dynamically load a script
  function loadScript(src){
    return new Promise((resolve, reject)=>{
      const s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = () => resolve(); s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  // ensure Chart.js is available; try v3 CDN as fallback if window.Chart missing
  async function ensureChartLib(){
    if(window.Chart) return true;
    try{
      // try a known stable bundle
      await loadScript('https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js');
      return !!window.Chart;
    }catch(e){
      console.error('Could not load Chart.js:', e);
      return false;
    }
  }

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
      // include date range and a cache-buster to avoid 304/cached responses in some browsers
      const tfUrl = `/api/reports/top-foods?from=${encodeURIComponent(from||'')}&to=${encodeURIComponent(to||'')}&_cb=${Date.now()}`;
      const tf = await fetch(tfUrl, { cache: 'no-cache' });
      let list = [];
      if(tf.ok){
        try { list = await tf.json(); } catch(e){ list = []; }
      }
      console.log('report-ui: fetched top-foods, count=', (list && list.length) || 0, tfUrl);

      // If report endpoint returned empty, try client-side fallback: fetch invoices and aggregate items
      if((!list || list.length === 0)){
        try{
          const ir = await fetch('/api/invoices');
          if(ir.ok){
            const invs = await ir.json();
            const stats = {};
            (invs||[]).forEach(inv => {
              const items = inv.items || inv.OrderItems || inv.order_items || inv.CHI_TIET_ORDERs || [];
              (items||[]).forEach(it => {
                const name = it.tenMon || it.name || it.ten || it.productName || it.itemName || '';
                const qty = Number(it.soLuong || it.so_luong || it.qty || it.quantity || it.count) || 0;
                if(!name) return;
                if(!stats[name]) stats[name] = { tenMon: name, soLuong: 0 };
                stats[name].soLuong += qty;
              });
            });
            list = Object.values(stats).sort((a,b)=> b.soLuong - a.soLuong);
          }
        }catch(e){ /* ignore fallback error */ }
      }

      // update top-dishes list
      if(topDishesEl){
        // If we have results from the API or fallback aggregation, render them.
        if(list && list.length > 0){
          topDishesEl.innerHTML = '';
          (list||[]).slice(0,10).forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.tenMon || item.name || item.ten || ''}</span><strong>${item.soLuong || item.so_luong || item.count || 0}</strong>`;
            topDishesEl.appendChild(li);
          });
        } else {
          // No data available from APIs. If the template already contains sample items,
          // keep them so the UI doesn't look blank. If the list is empty, show a
          // small placeholder message.
          if(topDishesEl.children.length === 0){
            topDishesEl.innerHTML = '<li class="muted" style="padding:8px">Không có dữ liệu cho khoảng thời gian này</li>';
          }
        }
      }

      // update chart
      const chartLibReady = await ensureChartLib();
      if(chartLibReady && window.Chart){
        const labels = (list||[]).map(i => i.tenMon || i.name || i.ten || '');
        const data = (list||[]).map(i => Number(i.soLuong || i.so_luong || i.count || 0));
        const ctx = ctxWrap.getContext('2d');
        if(chart) chart.destroy();
        if((data||[]).length === 0 || (data.every && data.every(d=>d===0))){
          // no data
          chartPlaceholder && (chartPlaceholder.textContent = 'Không có dữ liệu cho khoảng thời gian này');
          chartPlaceholder && (chartPlaceholder.style.display = 'flex');
          // clear canvas
          ctx.clearRect(0,0,ctxWrap.width, ctxWrap.height);
        } else {
          chartPlaceholder && (chartPlaceholder.style.display = 'none');
          chart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Số lượng bán', data, backgroundColor: ['#f97316','#f97316','#60a5fa','#a78bfa','#34d399','#fb923c','#60a5fa'] }] },
            options: { responsive: true, maintainAspectRatio: false }
          });
        }
      } else {
        // Chart.js not loaded even after attempt
        chartPlaceholder && (chartPlaceholder.textContent = 'Không thể tải thư viện biểu đồ. Kiểm tra kết nối hoặc console để biết lỗi.');
        chartPlaceholder && (chartPlaceholder.style.display = 'flex');
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
