'use strict'
// integration test

const server = require('../src/server');
const { users } = require('../src/auth/models');
const base64 = require('base-64');
const supertest = require('supertest');
const request = supertest(server.app);

beforeAll( async() => {
  await users.model.sync();
});

afterAll( async() => {
  await users.model.drop();
});


describe('Auth tests', () => {
  let userEx = {};
  let token = '';

  test('Successfully signs up a user', async() => {
    userEx = {
      username: 'Laurel',
      password: 'N@OH337',
    };

    const res = await request.post('/signup').send(userEx);
    expect(res.body.username).toEqual('Laurel');
    expect(res.body.token).toBeTruthy();
  });

	test('Can sign in successfully and receive a token', async() => {
    const encoded = base64.encode(`${userEx.username}:${testUser.password}`);
    const res = await request.post('/signin').set('Authorization', `Basic ${encoded}`);
    expect(res.body.username).toEqual('Laurel');

    token = res.body.token;
    expect(token).toBeTruthy();
  });

  test('Can use token to call routes that require a token', async() => {
    const res = await request.get('/secret').set('Authorization', `Bearer ${token}`);
    expect(res.text).toEqual('Secret hit');

    const res2 = await request.get('/users').set('Authorization', `Bearer ${token}`);
    expect(res2.text).toEqual('Users hit');
  });
});