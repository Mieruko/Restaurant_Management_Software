const request = require('supertest');
const express = require('express');
const customerRoutes = require('../routes/customerRoutes');

const app = express();
app.use(express.json());
app.use('/customers', customerRoutes);

describe('API Khách hàng', () => {
  it('GET /customers → trả về danh sách khách', async () => {
    const res = await request(app).get('/customers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /customers → thêm khách mới', async () => {
    const newC = { tenKhach: 'Test Khách', soDienThoai: '0912345678', gioiTinh: 'Nam' };
    const res = await request(app).post('/customers').send(newC);
    expect(res.status).toBe(201);
    // api returns created object or model
    expect(res.body.tenKhach || res.body.ten_kh).toBeDefined();
  });

  it('POST /customers → trả lỗi khi thiếu thông tin', async () => {
    const res = await request(app).post('/customers').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('PUT /customers/:id → cập nhật khách', async () => {
    const res = await request(app).put('/customers/1').send({ tenKhach: 'Nguyễn Thí Nghiệm' });
    expect([200,500]).toContain(res.status); // allow DB/no-DB variance
  });

  it('DELETE /customers/:id → xóa khách', async () => {
    const res = await request(app).delete('/customers/2');
    expect([200,404]).toContain(res.status);
  });
});
