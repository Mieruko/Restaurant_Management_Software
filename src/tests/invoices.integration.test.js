const request = require('supertest');
const app = require('../app');

describe('Invoices integration', () => {
  let orderId;
  let invoiceId;

  it('creates an order then creates an invoice (in-memory) and can pay it', async () => {
    // create order
    const orderRes = await request(app).post('/api/orders').send({ tableId: 5, items: [{ monId: 101, quantity: 2 }] });
    expect(orderRes.statusCode).toBe(201);
    orderId = orderRes.body.id;

    // create invoice for that order
    const invRes = await request(app).post('/api/invoices').send({ orderId });
    expect(invRes.statusCode).toBe(201);
    // should return an invoice object
    expect(invRes.body).toHaveProperty('id');
    invoiceId = invRes.body.id;

    // pay the invoice
    const payRes = await request(app).post(`/api/invoices/${invoiceId}/pay`).send({ method: 'Tiền mặt' });
    expect(payRes.statusCode).toBe(200);
    expect(payRes.body.tinhtrangThanhtoan || payRes.body.tinh_trang_thanh_toan || payRes.body.status).toBeDefined();
  });

  it('print endpoint returns savedPath/publicUrl', async () => {
    const html = '<h1>Test Print</h1>';
    const res = await request(app).post('/api/invoices/print').send({ html });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('savedPath');
    expect(res.body).toHaveProperty('publicUrl');
  });
});
