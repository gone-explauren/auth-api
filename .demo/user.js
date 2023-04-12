'use strict'

const { DataTypes } = require('sequelize');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
SECRET = process.env.SECRET


const User = (sequelize) => {
	const model = sequelize.define('User', {
		username: {
			type: DataTypes.STRING,
			allowNull: false
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
		role: {
			type: DataTypes.ENUM('admin', 'editor', 'writer', 'user'),
			allowNull: false,
			defaultValue: 'user'
		},
		token: {
			type: DataTypes.VIRTUAL,
			get() {
				return jwt.sign({ username: this.username }, SECRET);
			}
		},
		capabilities: {
			type: DataTypes.VIRTUAL,
			get() {
				const acl = {
					user: ['read'],
					writer: ['read', 'write'],
					editor: ['read', 'write', 'update'],
					admin: ['read', 'write', 'update', 'delete'],
				}
				return acl[this.role];
			}
		},
	});

	model.beforeCreate(async user => {
		user.password = await bcrypt.hash(user.password, 10);
	})

	return model;
}

module.exports {
	
}