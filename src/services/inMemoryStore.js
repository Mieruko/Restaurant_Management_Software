// Shared in-memory store for demo mode
const store = {
  orders: [],
  nextOrderId: 1,
  invoices: [],
  nextInvoiceId: 1,
  menu: [
    { id: 1, tenMon: 'Phở bò', gia: 45000, loai: 'Món chính' },
    { id: 2, tenMon: 'Cơm gà', gia: 60000, loai: 'Món chính' },
    { id: 3, tenMon: 'Coca-Cola', gia: 15000, loai: 'Đồ uống' }
  ],
  tables: [
    { id: 1, tenBan: 'Bàn 1', trangThai: 'Trống' },
    { id: 2, tenBan: 'Bàn 2', trangThai: 'Đang phục vụ' },
    { id: 3, tenBan: 'Bàn 3', trangThai: 'Trống' }
  ]
};

module.exports = store;
