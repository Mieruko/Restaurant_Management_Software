const request = require('supertest');
const app = require('../app');

describe('Order item updates', () => {
  it('updates item status via index fallback when no itemId present', async () => {
    // create order in-memory
    const create = await request(app).post('/api/orders').send({ tableId: 2, items: [{ monId: 1, quantity: 1 }] });
    expect(create.statusCode).toBe(201);
    const id = create.body.id;
    // update item 0
    const upd = await request(app).put(`/api/orders/${id}/items/0`).send({ status: 'Đang chế biến' });
    expect(upd.statusCode).toBe(200);
    expect(upd.body.item || upd.body).toBeDefined();
  });
});
