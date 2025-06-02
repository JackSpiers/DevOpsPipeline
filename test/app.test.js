const request = require('supertest');
const app = require('../src/app');

describe('Task Manager API', () => {
  let createdTaskId;

  test('GET /tasks should return empty list initially', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('POST /tasks should create a new task', async () => {
    const newTask = { title: 'Test Task', completed: false };
    const res = await request(app)
      .post('/tasks')
      .send(newTask)
      .set('Accept', 'application/json');
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(newTask.title);
    expect(res.body.completed).toBe(false);

    createdTaskId = res.body.id;
  });

  test('GET /tasks/:id should return the created task', async () => {
    const res = await request(app).get(`/tasks/${createdTaskId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdTaskId);
    expect(res.body.title).toBe('Test Task');
  });

  test('PUT /tasks/:id should update the task', async () => {
    const updates = { title: 'Updated Task', completed: true };
    const res = await request(app)
      .put(`/tasks/${createdTaskId}`)
      .send(updates)
      .set('Accept', 'application/json');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe(updates.title);
    expect(res.body.completed).toBe(true);
  });

  test('DELETE /tasks/:id should delete the task', async () => {
    const res = await request(app).delete(`/tasks/${createdTaskId}`);
    expect(res.statusCode).toBe(204);
  });

  test('GET /tasks/:id for deleted task returns 404', async () => {
    const res = await request(app).get(`/tasks/${createdTaskId}`);
    expect(res.statusCode).toBe(404);
  });

  test('GET /health should return status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'UP' });
  });
  
  test('GET /metrics should return uptime and memory usage', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('memory');
    expect(res.body.memory).toHaveProperty('rss');
    expect(res.body.memory).toHaveProperty('heapUsed');
    expect(res.body.status).toBe('ok');
  });

});


