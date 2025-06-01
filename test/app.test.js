console.log(typeof expect);  //Should print "function"


const request = require('supertest');
const { app, resetData } = require('../app');
const expect = require('expect');

describe('Express App Endpoints', () => {
  //Reset the in-memory data before each test so tests don't affect each other
  beforeEach(() => {
    resetData();
  });

  it('GET / should respond with Hello, Jenkins Pipeline!', async () => {
    const res = await request(app).get('/');
    expect(res.text).toBe('Hello, Jenkins Pipeline!');
  });

  it('GET /health should respond 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('GET /api/items should return [] initially', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('POST /api/items should create a new item', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'TestItem' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, name: 'TestItem' });
  });

  it('PUT /api/items/1 should update the item', async () => {
    //First create the item
    await request(app).post('/api/items').send({ name: 'TestItem' });

    //Then update it
    const res = await request(app)
      .put('/api/items/1')
      .send({ name: 'UpdatedItem' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, name: 'UpdatedItem' });
  });

  it('DELETE /api/items/1 should delete the item', async () => {
    //First create the item
    await request(app).post('/api/items').send({ name: 'TestItem' });

    //Then delete it
    const res = await request(app).delete('/api/items/1');
    expect(res.status).toBe(204);

    //Check the item is gone
    const getRes = await request(app).get('/api/items');
    expect(getRes.body.find(i => i.id === 1)).toBeUndefined();
  });
});
