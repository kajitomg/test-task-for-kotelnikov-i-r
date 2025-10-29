import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { App } from '../../app.js';

async function setup() {
  const app = App();
  
  return { app};
}

describe('/api/v1/health', async () => {
  test('дано: запрос GET, ожидается: успешное(200) выполнение с message = "ОК", timestamp и uptime', async () => {
    const { app } = await setup();
    
    const actual = await request(app).get('/api/v1/health').expect(200);
    const expected = {
      message: 'OK',
      timestamp: expect.any(Number),
      uptime: expect.any(Number),
    };
    
    expect(actual.body).toEqual(expected);
  });
});