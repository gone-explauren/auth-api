'use strict';
// integration test

require('dotenv').config();
const server = require('../src/server');
const { users } = require('../src/models');
const supertest = require('supertest');
const request = supertest(server.server);

beforeAll( async() => {
  await users.model.sync();
});

afterAll( async() => {
  await users.model.drop();
});

describe('Testing Auth: sign in / sign up', () => {
  let testUser = {};
  let token = '';

  test('Can successfully sign up a user', async () => {
    testUser = {
      username: 'Laurel',
      password: '1992'
    }

    let response = await request.post('/signup').send(testUser);
    expect(response.body.user.username).toEqual('Laurel');
  });

  test('Can successfully sign in with a proper login and recieve a token', async () => {
    let response = await request.post('/signin').auth('Laurel', '1992');
    token = response.body.token;

    expect(response.body.user.username).toEqual('Laurel');
    expect(token).toBeTruthy();
  });
});