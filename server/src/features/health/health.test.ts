import request from 'supertest';
import { describe, expect, test } from 'vitest';

import { App } from '../../app.js';

describe('/api/v1/health', () => {
  test('дано: запрос GET, ожидается: возврат статуса 200 с сообщением, отметкой времени и временем работы', async () => {
    const app = App();
    
    const actual = await request(app).get('/api/v1/health').expect(200);
    const expected = {
      message: 'OK',
      timestamp: expect.any(Number),
      uptime: expect.any(Number),
    };
    
    expect(actual.body).toEqual(expected);
  });
});