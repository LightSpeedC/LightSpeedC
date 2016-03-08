// app1-client.js

void function () {
	'use strict';

	var io = require('socket.io-client');
	var log = require('log-manager').getLogger();
	log.setLevel(process.env.APP_LOG_LEVEL || 'trace');
	log.info('logLevel:', process.env.APP_LOG_LEVEL || 'trace');

	var targetUrl = process.argv[2] || 'http://localhost:3000';

	// time 時刻
	var tm = () => new Date().toLocaleTimeString();
	var time = 500;
	var seq = 1000;

	var socket;
	connect();

	function connect() {
		var startTime = new Date;
		socket = io(targetUrl);
		time = 500;

		socket.on('connect', function () {
			log.debug('connect! time:', (new Date - startTime)/1000, 'msec');
			socket.emit('my other event', {id:++seq, my:'connect'});
			process.nextTick(() => socket.emit('my other event', {id:++seq, my:'connect2'}));
		});

		socket.on('news', function (msg) {
			log.trace('news', msg);
			msg = {id:++seq, my:'other', tm:tm()};
			log.trace('other', msg);
			socket.emit('my other event', msg);
		});

		socket.on('disconnect', function () {
			log.debug('disconnect!');
		});

		setTimeout(() => {
			socket.close();
			socket = null;
		}, 16000)

		setTimeout(function timer() {
			time *= 2;
			if (time >= 60000) time = 60000;

			if (!socket) return connect();

			setTimeout(timer, time);

			var msg = {id:++seq, my:'timer', tm:tm(), bf:new Buffer('abc')};
			log.trace('timer', msg);
			socket.emit('my timer event', msg);
		}, time);

	}

	console.log('io:', Object.getOwnPropertyNames(io).join(', '));
	console.log('io#', Object.getOwnPropertyNames(io.__proto__).join(', '));
	console.log('socket:', Object.getOwnPropertyNames(socket).join(', '));
	console.log('socket#', Object.getOwnPropertyNames(socket.__proto__).join(', '));
}();