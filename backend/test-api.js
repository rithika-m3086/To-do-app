const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./src/app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth & Task API End-to-End Tests', () => {
  let userToken = '';
  let taskId = '';

  test('POST /api/auth/register - 400 Bad Request on password < 6 chars', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 6 characters/i);
  });

  test('POST /api/auth/register - 400 Bad Request on missing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
  });

  test('POST /api/auth/register - 201 Created on valid input', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user1@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'user1@example.com');
    userToken = res.body.token;
  });

  test('POST /api/auth/register - 409 Conflict on existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user1@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('POST /api/auth/login - 401 Unauthorized on invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user1@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login - 200 OK on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user1@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/tasks - 201 Created task with Auth Token', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Test Task 1',
        description: 'Testing task creation',
        priority: 'high',
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Test Task 1');
    expect(res.body.status).toBe('pending');
    taskId = res.body._id;
  });

  test('GET /api/tasks - 200 Returns user tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test('PUT /api/tasks/:id - 200 Updates task status', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
  });

  test('DELETE /api/tasks/:id - 200 Deletes task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
