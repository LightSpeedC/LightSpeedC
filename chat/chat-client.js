// chat-client.js

void function () {
	'use strict';

	var io = require('socket.io-client');
	var log = require('log-manager').getLogger();
	log.setLevel(process.env.APPLSC_LOG_LEVEL || 'trace');
	log.info('logLevel:', process.env.APPLSC_LOG_LEVEL || 'trace');

	var targetUrl = process.argv[2] || 'http://localhost:3000';

	// time 時刻
	var tm = () => new Date().toLocaleTimeString();
	var time = 500;
	var seq = 1000;

	var socket, pingTime;
	connect();

	function connect() {
		var startTime = new Date;
		socket = io(targetUrl);
		time = 500;

		socket.on('connect', function () {
			var msg = {id:++seq, my:'connect', tm:tm()};
			log.debug('connect:', msg, ['time:', (new Date - startTime)/1000, 'msec']);
			socket.emit('my other event', msg);

			setImmediate(() => {
				var msg = {id:++seq, my:'connect2', tm:tm()};
				log.trace('other', msg);
				socket.emit('my other event', msg);
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

				socket.emit('ping!', {});
				log.debug('ping!');
				pingTime = new Date;
			}, time);

		}); // socket on connect

		socket.on('pong!', function () {
			log.debug('pong!', new Date - pingTime, 'msec');
			socket.emit('pong!', {});
		}); // socket on pong

		socket.on('news', function (msg) {
			log.trace('news', msg);
			msg = {id:++seq, my:'other', tm:tm()};
			log.trace('other', msg);
			socket.emit('my other event', msg);
		}); // socket on first message

		socket.on('disconnect', function () {
			log.debug('disconnect!');
		}); // socket on disconnect

	}

	console.log('io:', Object.getOwnPropertyNames(io).join(', '));
	console.log('io#', Object.getOwnPropertyNames(io.__proto__).join(', '));
	console.log('socket:', Object.getOwnPropertyNames(socket).join(', '));
	console.log('socket#', Object.getOwnPropertyNames(socket.__proto__).join(', '));
}();
