'use strict';

const express = require('express');

const { users } = require('./models/index');
const basicAuth = require('./middleware/basic');
const bearerAuth = require('./middleware/bearer');

const router = express.Router();

router.post('/signup', handleSignUp);
router.post('/signin', basicAuth, handleSignIn);

router.get('/secret', bearerAuth, handleSecret);
router.get('/users', bearerAuth, handleUsers);

async function handleSignUp(req, res, next) {
  const userObj = req.body;
  try {
    const createdUser = await users.create(userObj);
    res.status(201).json(createdUser);
  } catch (e) {
    console.error('Could not create User', e);
  }
}

function handleSignIn(req, res, next) {
  try {
    res.status(200).json(req.user);
  } catch (e) {
    console.error('Invalid user', e);
  }
}

function handleSecret(req, res, next) {
  res.send('Secret hit');
}

function handleUsers(req, res, next) {
  res.send('Users hit');
}

module.exports = router;