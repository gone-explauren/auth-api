'use strict';

const server = require('../src/server');
const { db } = require('../src/auth/models');
const supertest = require('supertest');
const request = supertest(server.app);

beforeAll(async () => {
	await db.sync();
});

afterAll(async () => {
	await db.drop();
});

//v1 tests
describe('Testing unauthenticated server routes', () => {
	let userEx, clothesEx, foodEx, user_res, clothes_res, food_res;

	test('Can POST to create an item', async () => {
		//test items
		userEx = {
			username: 'Laurel',
			password: 'N@OH337',
		};

		clothesEx = {
			name: 'dress',
			color: 'blue',
			size: 'S',
		};

		foodEx = {
			name: 'tofu',
			calories: 90,
			type: 'protein',
		};


		//POST requests
		user_res = await request.post('/api/v1/users').send(userEx);
		clothes_res = await request.post('/api/v1/clothes').send(clothesEx);
		food_res = await request.post('/api/v1/food').send(foodEx);

		expect(user_res.body.username).toEqual('Laurel');
		expect(clothes_res.body.name).toEqual('dress');
		expect(food_res.body.name).toEqual('tofu');
	});

	test('Can GET all items', async () => {
		const userEx02 = {
			username: 'Uli',
			password: 'p@s$w0rd',
		};

		const clothesEx02 = {
			name: 'sweater',
			color: 'purple',
			size: 'M',
		};

		const foodEx02 = {
			name: 'broccoli',
			calories: 30,
			type: 'vegetable',
		};

		await request.post('/api/v1/users').send(userEx02);
		await request.post('/api/v1/clothes').send(clothesEx02);
		await request.post('/api/v1/food').send(foodEx02);

		const res = await request.get('/api/v1/users');
		const res2 = await request.get('/api/v1/users');
		const res3 = await request.get('/api/v1/users');

		expect(res.body.length).toEqual(2);
		expect(res2.body.length).toEqual(2);
		expect(res3.body.length).toEqual(2);
	});

	test('Can GET a single item by ID', async () => {
		const res = await request.get(`/api/v1/users/${user_res.body.id}`);
		const res2 = await request.get(`/api/v1/food/${food_res.body.id}`);
		const res3 = await request.get(`/api/v1/clothes/${clothes_res.body.id}`);

		expect(res.body.username).toEqual('Laurel');
		expect(res2.body.name).toEqual('tofu');
		expect(res3.body.name).toEqual('dress');
	});

	test('Can update a single item by id', async () => {
		userEx.username = 'Mannie';
		foodEx.name = 'burrito';
		clothesEx.name = 'pants';


		const res = await request.put(`/api/v1/users/${user_res.body.id}`).send(userEx);
		const res2 = await request.put(`/api/v1/food/${food_res.body.id}`).send(foodEx);
		const res3 = await request.put(`/api/v1/clothes/${clothes_res.body.id}`).send(clothesEx);

		expect(res.body.username).toEqual('Mannie');
		expect(res2.body.name).toEqual('burrito');
		expect(res3.body.name).toEqual('pants');
	});

	test('Can delete an item', async () => {
		const res = await request.delete(`/api/v1/users/${user_res.body.id}`);
		const res2 = await request.delete(`/api/v1/food/${food_res.body.id}`);
		const res3 = await request.delete(`/api/v1/clothes/${clothes_res.body.id}`);

		expect(res.body).toEqual(1);
		expect(res2.body).toEqual(1);
		expect(res3.body).toEqual(1);

		const res_1 = await request.get(`/api/v1/users/${user_res.body.id}`);
		const res_2 = await request.get(`/api/v1/food/${food_res.body.id}`);
		const res_3 = await request.get(`/api/v1/clothes/${clothes_res.body.id}`);

		expect(res_1.body).toBeFalsy();
		expect(res_2.body).toBeFalsy();
		expect(res_3.body).toBeFalsy();
	});
});

//v2 tests
describe('Testing authenticated server routes', () => {
	let token, userEx, clothesEx, foodEx, writerEx, adminEx, user_res, writer_res, admin_res, clothes_res, food_res, bad_res;

	test('Can POST to create an item', async () => {
		//test items
		userEx = {
			username: 'Laurel',
			password: 'N@OH337',
		};

		writerEx = {
			username: 'Phil',
			password: 'c00lGuy4o',
			role: 'writer',
		};

		adminEx = {
			username: 'Nate',
			password: 'hyd0fl@sk88',
			role: 'admin',
		};

		clothesEx = {
			name: 'hat',
			color: 'black',
			size: 'M',
		};

		admin_res = await request.post('/signup').send(adminEx);
		token = admin_res.body.token;
		console.log('token', token);

		//POST requests
		user_res = await request.post('/api/v2/users')
			.set('Authorization', `Bearer ${token}`)
			.send(userEx);
		writer_res = await request.post('/api/v2/users')
			.set('Authorization', `Bearer ${token}`)
			.send(writerEx);
		bad_res = await request.post('/api/v2/users')
			.set('Authorization', `Bearer badtoken`)
			.send(writerEx);

		expect(user_res.body.username).toEqual('Laurel');
		expect(writer_res.body.username).toEqual('Phil');
		expect(bad_res.status).toEqual(500);
	});

	test('Can GET all items', async () => {
		foodEx = {
			name: 'strawberries',
			calories: 30,
			type: 'fruit',
		};
		food_res = await request.post('/api/v2/food')
			.set('Authorization', `Bearer ${token}`)
			.send(foodEx);

		//GET requests
		const user_res2 = await request.get('/api/v2/users')
			.set('Authorization', `Bearer ${token}`);
		const food_res2 = await request.get('/api/v2/food')
			.set('Authorization', `Bearer ${token}`);
		const clothes_res2 = await request.get('/api/v2/clothes')
			.set('Authorization', `Bearer badtoken`);

		expect(user_res2.body.length).toEqual(4);
		expect(food_res2.body.length).toEqual(2);
		expect(clothes_res2.body.length).toBeFalsy();
	});

	test('Can GET item by ID', async () => {
		//GET requests
		const food_id = food_res.body.id;
		const res2 = await request.get(`/api/v2/food/${food_id}`)
			.set('Authorization', `Bearer ${token}`);
		const res3 = await request.get(`/api/v2/food/${food_id}`)
			.set('Authorization', `Bearer badtoken`);
		console.log(res2);
		expect(res2.body.name).toEqual('strawberries');
		expect(res3.status).toEqual(500);
	});

	test('Can update item by ID', async () => {
		//GET requests
		const food_id = food_res.body.id;
		food_res.body.name = 'raspberries';
		const res2 = await request.put(`/api/v2/food/${food_id}`)
			.set('Authorization', `Bearer ${token}`)
			.send(food_res.body);

		food_res.body.name = 'blueberries';
		const res3 = await request.put(`/api/v2/food/${food_id}`)
			.set('Authorization', `Bearer ${writer_res.body.token}`)
			.send(food_res.body);

		expect(res2.body.name).toEqual('raspberries');
		expect(res3.status).toEqual(500);
	});

	test('Can delete item by ID', async () => {
		//GET requests
		const food_id = food_res.body.id;
		const res2 = await request.delete(`/api/v2/food/${food_id}`)
			.set('Authorization', `Bearer ${token}`);

		const user_id = admin_res.body.id;
		const res3 = await request.delete(`/api/v2/users/${user_id}`)
			.set('Authorization', `Bearer ${writer_res.body.token}`);

		expect(res2.body).toEqual(1);
		expect(res3.status).toEqual(500);
	});
});
