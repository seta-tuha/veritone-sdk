'use strict';

var request = require('request'),
	validatejs = require('validate.js'),
	fs = require('fs'),
	path = require('path'),
	RetryHelper = require('./RetryHelper');

function ApiClient(options) {
	if (typeof options === 'string') {
		options = {
			token: options
		};
	}
	if (!options.token) {
		throw 'Missing token!';
	}
	this._token = options.token;
	this._baseUri = options.baseUri || 'https://api.veritone.com';
	this._version = options.version || 1;
	this._maxRetry = options.maxRetry;
	this._retryIntervalMs = options.retryIntervalMs;
	if (typeof this._version === 'number') {
		this._baseUri = this._baseUri + '/v' + this._version;
	} else {
		this._baseUri = this._baseUri + '/' + this._version;
	}
	this._retryHelper = new RetryHelper({maxRetry: this._maxRetry, retryIntervalMs: this._retryIntervalMs});
}

var applicationEndpoint = '/application/',
	dropboxWatcherEndpoint = '/watcher/dropbox/',
	recordingEndpoint = '/recording/',
	tasksByRecordingEndpoint = '/recording/tasks',
	taskTypeByJobEndpoint = '/job/task_type/',
	jobEndpoint = '/job/',
	searchEndpoint = '/search',
	reportsEndpoint = '/report/',
	batchEndpoint = '/batch',
	transcriptEndpoint = '/transcript/',
	metadataHeader = 'X-Veritone-Metadata',
	applicationIdHeader = 'X-Veritone-Application-Id';

function generateHeaders(token) {
	var headers = {};
	headers.Authorization = 'Bearer ' + token;
	return headers;
}

//function validateApplication(application) {
//	if (typeof application !== 'object') {
//		throw 'Missing application!';
//	}
//	var validation = {
//		applicationName: {
//			presence: true
//		},
//		contact: {
//			presence: true
//		},
//		'contact.name': {
//			presence: true
//		},
//		'contact.emailAddress': {
//			presence: true,
//			email: true
//		}
//	};
//	var validationErrors = validatejs(application, validation);
//	if (validationErrors) {
//		throw 'Invalid application object!';
//	}
//}
//
//ApiClient.prototype.createApplication = function createApplication(application, callback) {
//	validateApplication(application);
//	if (typeof callback !== 'function') {
//		throw 'Missing callback!';
//	}
//
//	request({
//		method: 'POST',
//		url: this._baseUri + applicationEndpoint,
//		headers: generateHeaders(this._token),
//		json: application
//	}, function(err, response, body) {
//		if (err) {
//			return callback(err, body);
//		}
//		if (response.statusCode !== 200) {
//			return callback('Received status: ' + response.statusCode, body);
//		}
//		callback(null, body);
//	});
//};
//
//ApiClient.prototype.getApplication = function getApplication(callback) {
//	if (typeof callback !== 'function') {
//		throw 'Missing callback!';
//	}
//
//	request({
//		method: 'GET',
//		url: this._baseUri + applicationEndpoint,
//		headers: generateHeaders(this._token),
//		json: true
//	}, function(err, response, body) {
//		if (err) {
//			return callback(err, body);
//		}
//		if (response.statusCode !== 200) {
//			return callback('Received status: ' + response.statusCode, body);
//		}
//		callback(null, body);
//	});
//};
//
//ApiClient.prototype.updateApplication = function updateApplication(application, callback) {
//	validateApplication(application);
//	if (typeof callback !== 'function') {
//		throw 'Missing callback!';
//	}
//
//	request({
//		method: 'PUT',
//		url: this._baseUri + applicationEndpoint,
//		headers: generateHeaders(this._token),
//		json: application
//	}, function(err, response, body) {
//		if (err) {
//			return callback(err, body);
//		}
//		if (response.statusCode !== 200) {
//			return callback('Received status: ' + response.statusCode, body);
//		}
//		callback(null, body);
//	});
//};

ApiClient.prototype.createToken = function createToken(label, rights, callback) {
	if (typeof label !== 'string' || label === '') {
		throw 'Missing label!';
	}
	if (!rights || !rights.length) {
		throw 'Missing rights!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'POST',
			url: self._baseUri + applicationEndpoint + 'token/',
			headers: generateHeaders(self._token),
			json: {
				tokenLabel: label,
				rights: rights
			}
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.revokeToken = function revokeToken(token, callback) {
	if (typeof token !== 'string' || token === '') {
		throw 'Missing token!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'DELETE',
			url: self._baseUri + applicationEndpoint + 'token/' + token,
			headers: generateHeaders(self._token),
			json: true
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200 && response.statusCode !== 204) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

function validateRecording(recording) {
	if (typeof recording !== 'object') {
		throw 'Missing recording!';
	}
	var validation = {
		startDateTime: {
			presence: true,
			numericality: {
				onlyInteger: true
			}
		},
		stopDateTime: {
			presence: true,
			numericality: {
				onlyInteger: true,
				greaterThan: recording.startDateTime
			}
		}
	};
	var validationErrors = validatejs(recording, validation);
	if (validationErrors) {
		throw 'Invalid recording object: ' + JSON.stringify(validationErrors);
	}
}

ApiClient.prototype.createRecording = function createRecording(recording, callback) {
	validateRecording(recording);
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'POST',
			url: self._baseUri + recordingEndpoint,
			headers: generateHeaders(self._token),
			json: recording
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getRecordings = function getRecordings(options, callback) {
	if (typeof options === 'function' && !callback) {
		callback = options;
		options = {};
	} else if (typeof options === 'string') {
		options = {
			recordingId: options
		};
	} else if (typeof options !== 'object') {
		throw 'Missing options!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var uri = this._baseUri + recordingEndpoint;
	if (options.limit || options.offset) {
		if (options.limit && options.ofset) {
			uri += '?limit=' + options.limit + '&offset=' + options.offset;
		} else if (options.limit) {
			uri += '?limit=' + options.limit;
		} else if (options.offset) {
			uri += '?offset=' + options.offset;
		}
	}

	var self = this;
	function task(callback) {
		request({
			method: 'GET',
			uri: uri,
			headers: generateHeaders(self._token),
			json: true
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getRecording = function getRecording(recordingId, callback) {
	if (typeof recordingId === 'number') {
		recordingId = recordingId + '';
	}
	if (typeof recordingId !== 'string' || recordingId === '') {
		throw 'Missing recordingId!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'GET',
			uri: self._baseUri + recordingEndpoint + recordingId,
			headers: generateHeaders(self._token),
			json: true
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.updateRecording = function updateRecording(recording, callback) {
	validateRecording(recording);
	if (typeof recording.recordingId === 'number') {
		recording.recordingId = recording.recordingId + '';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'PUT',
			url: self._baseUri + recordingEndpoint + recording.recordingId,
			headers: generateHeaders(self._token),
			json: recording
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.deleteRecording = function deleteRecording(recordingId, callback) {
	if (typeof recordingId === 'number') {
		recordingId = recordingId + '';
	}
	if (typeof recordingId !== 'string' || recordingId === '') {
		throw 'Missing recordingId!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'DELETE',
			url: self._baseUri + recordingEndpoint + recordingId,
			headers: generateHeaders(self._token)
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 204) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getRecordingTranscript = function getRecordingTranscript(recordingId, callback) {
	if (typeof recordingId === 'number') {
		recordingId = recordingId + '';
	}
	if (typeof recordingId !== 'string' || recordingId === '') {
		throw 'Missing recordingId!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'GET',
			uri: self._baseUri + recordingEndpoint + recordingId + '/transcript',
			headers: generateHeaders(self._token),
			json: true
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getRecordingMedia = function getRecordingMedia(recordingId, callback, progressCallback) {
	if (typeof recordingId === 'number') {
		recordingId = recordingId + '';
	}
	if (typeof recordingId !== 'string' || recordingId === '') {
		throw 'Missing recordingId!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		var progress = {
				total: 0,
				received: 0,
				percentage: 0
			},
			lastReportedPercentage = 0;

		var req = request({
			method: 'GET',
			uri: self._baseUri + recordingEndpoint + recordingId + '/media',
			headers: generateHeaders(self._token)
		}).on('error', function (err) {
			callback(err);
		}).on('response', function(response) {
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode);
			}
			progress.total = parseInt(response.headers['content-length']);
			progress.received = 0;
			progress.percentage = 0;
			if (progressCallback) {
				progressCallback(progress);
			}
			var metadata = response.headers[metadataHeader.toLowerCase()];
			callback(null, {
				contentType: response.headers['content-type'],
				metadata: (metadata ? JSON.parse(metadata) : undefined),
				stream: req
			});
		}).on('data', function(data) {
			progress.received += data.length;
			progress.percentage = (progress.total ? (progress.received / progress.total) / progress.total : 0);
			if (progressCallback) {
				// only update every tenth of a percent
				if (Math.abs(progress.percentage - lastReportedPercentage) >= 0.001) {
					lastReportedPercentage = progress.percentage;
					progressCallback(progress);
				}
			}
		}).on('end', function() {
			progress.received = progress.total;
			progress.percentage = 1.00;
			progressCallback(progress);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getRecordingAssets = function getRecordingAssets(recordingId, callback) {
	if (typeof recordingId === 'number') {
		recordingId = recordingId + '';
	}
	if (typeof recordingId !== 'string' || recordingId === '') {
		throw 'Missing recordingId!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'GET',
			uri: self._baseUri + recordingEndpoint + recordingId + '/asset/',
			headers: generateHeaders(self._token),
			json: true
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getAsset = function getAsset(recordingId, assetId, callback, progressCallback) {
	if (typeof recordingId === 'number') {
		recordingId = recordingId + '';
	}
	if (typeof recordingId !== 'string' || recordingId === '') {
		throw 'Missing recordingId!';
	}
	if (typeof assetId !== 'string' || assetId === '') {
		throw 'Missing assetId!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		var progress = {
				total: 0,
				received: 0,
				percentage: 0
			},
			percentage,
			lastReportedPercentage = 0;

		var req = request({
			method: 'GET',
			uri: self._baseUri + recordingEndpoint + recordingId + '/asset/' + assetId,
			headers: generateHeaders(self._token)
		}).on('error', function (err) {
			callback(err);
		}).on('response', function(response) {
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode);
			}
			progress.total = parseInt(response.headers['content-length']);
			progress.received = 0;
			progress.percentage = 0;
			if (progressCallback) {
				progressCallback(progress);
			}
			var metadata = response.headers[metadataHeader.toLowerCase()];
			callback(null, {
				contentType: response.headers['content-type'],
				metadata: (metadata ? JSON.parse(metadata) : undefined),
				stream: req
			});
		}).on('data', function(data) {
			progress.received += data.length;
			progress.percentage = (progress.total ? (progress.received / progress.total) / progress.total : 0);
			if (progressCallback) {
				// only update every tenth of a percent
				if (Math.abs(progress.percentage - lastReportedPercentage) >= 0.001) {
					lastReportedPercentage = progress.percentage;
					progressCallback(progress);
				}
			}
		}).on('end', function() {
			progress.received = progress.total;
			progress.percentage = 1.00;
			progressCallback(progress);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getAssetMetadata = function getAssetMetadata(recordingId, assetId, callback) {
	if (typeof recordingId === 'number') {
		recordingId = recordingId + '';
	}
	if (typeof recordingId !== 'string' || recordingId === '') {
		throw 'Missing recordingId!';
	}
	if (typeof assetId !== 'string' || assetId === '') {
		throw 'Missing assetId!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;

	function task(callback) {
		request({
			method: 'GET',
			uri: self._baseUri + recordingEndpoint + recordingId + '/asset/' + assetId + '/metadata',
			headers: generateHeaders(self._token),
			json: true
		}, function(err, response, body) {
			if (err) {
				return callback(err);
			}

			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.updateAssetMetadata = function updateAssetMetadata(recordingId, asset, callback) {
	if (typeof recordingId === 'number') {
		recordingId = recordingId + '';
	}
	if (typeof recordingId !== 'string' || recordingId === '') {
		throw 'Missing recordingId!';
	}
	if (typeof asset !== 'object') {
		throw 'Missing asset!';
	}
	if (typeof asset.assetId !== 'string' || asset.assetId === '') {
		throw 'Missing asset.assetId!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;

	function task(callback) {
		request({
			method: 'PUT',
			uri: self._baseUri + recordingEndpoint + recordingId + '/asset/' + asset.assetId + '/metadata',
			headers: generateHeaders(self._token),
			json: asset.metadata || {}
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}

			if (response.statusCode !== 204) {
				return callback('Received status: ' + response.statusCode);
			}
			callback();
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.saveAssetToFile = function saveAssetToFile(recordingId, assetId, fileName, callback, progressCallback) {
	if (typeof recordingId === 'number') {
		recordingId = recordingId + '';
	}
	if (typeof recordingId !== 'string' || recordingId === '') {
		throw 'Missing recordingId!';
	}
	if (typeof assetId !== 'string' || assetId === '') {
		throw 'Missing assetId!';
	}
	if (typeof fileName !== 'string' || fileName === '') {
		throw 'Missing fileName!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	this.getAsset(recordingId, assetId, function(err, result) {
		if (err) {
			return callback(err);
		}
		result.stream.on('end', function() {
			callback(null, result);
		});
		result.stream.pipe(fs.createWriteStream(fileName));
	}, progressCallback);
};

ApiClient.prototype.createAsset = function createAsset(recordingId, asset, callback) {
	if (typeof recordingId === 'number') {
		recordingId = recordingId + '';
	}
	if (typeof recordingId !== 'string' || recordingId === '') {
		throw 'Missing recordingId!';
	}
	if (typeof asset !== 'object') {
		throw 'Missing asset!';
	}
	if (typeof asset.fileName !== 'string' && typeof asset.stream !== 'object') {
		throw 'Missing asset.fileName or asset.stream!';
	}
	if (asset.fileName && asset.stream) {
		throw 'You can specify only asset.fileName or asset.stream!';
	}
	if (typeof asset.assetType !== 'string' || asset.assetType === '') {
		throw 'Missing asset.assetType!';
	}
	if (typeof asset.contentType !== 'string' || asset.contentType === '') {
		throw 'Missing asset.contentType!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}
	asset.metadata = asset.metadata || {};
	if (asset.fileName) {
		if (!fs.existsSync(asset.fileName)) {
			throw 'File "' + asset.fileName + '" does not exist!';
		}

		asset.metadata.fileName = path.basename(asset.fileName);
		var stat = fs.statSync(asset.fileName);
		asset.metadata.size = stat.size;
	}
	//console.log(asset);

	var self = this;

	var headers = generateHeaders(this._token);
	headers['X-Veritone-Asset-Type'] = asset.assetType;
	headers['Content-Type'] = asset.contentType;

	var opts = {
		method: 'POST',
		uri: this._baseUri + recordingEndpoint + recordingId + '/asset/',
		headers: headers,
		json: true
	};
	if (asset.metadata) {
		opts.headers[metadataHeader] = JSON.stringify(asset.metadata);
	}
	if (asset.applicationId) {
		opts.headers[applicationIdHeader] = asset.applicationId;
	}
	//console.log(opts);
	var stream = asset.stream || fs.createReadStream(asset.fileName);

	function task(callback) {
		stream.pipe(
			request(opts, function (err, response, body) {
				if (err) {
					return callback(err, body);
				}
				if (response.statusCode !== 200) {
					return callback('Received status: ' + response.statusCode, body);
				}
				callback(null, body);
			})
		);
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.updateAsset = function updateAsset(recordingId, asset, callback) {
	if (typeof recordingId === 'number') {
		recordingId = recordingId + '';
	}
	if (typeof recordingId !== 'string' || recordingId === '') {
		throw 'Missing recordingId!';
	}
	if (typeof asset !== 'object') {
		throw 'Missing asset!';
	}
	if (asset.fileName && !asset.contentType) {
		throw 'Missing asset.contentType!';
	}
	if (asset.contentType && !asset.fileName) {
		throw 'Missing asset.fileName!';
	}
	if (typeof asset.assetType !== 'string' || asset.assetType === '') {
		throw 'Missing asset.assetType!';
	}
	if (!asset.contentType && !asset.fileName && !asset.metadata) {
		throw 'Nothing to do!';
	}
	if (!fs.existsSync(asset.fileName)) {
		throw 'File "' + asset.fileName + '" does not exist!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;

	var opts = {
		method: 'PUT',
		uri: this._baseUri + recordingEndpoint + recordingId + '/asset/' + asset.assetId,
		headers: generateHeaders(this._token),
		json: true
	};
	if (asset.fileName) {
		if (!fs.existsSync(asset.fileName)) {
			throw 'File "' + asset.fileName + '" does not exist!';
		}
		opts.headers['Content-Type'] = asset.contentType;
		opts.headers['X-Veritone-Asset-Type'] = asset.assetType;
	}
	if (asset.metadata) {
		opts.headers[metadataHeader] = JSON.stringify(asset.metadata);
	}
	if (asset.applicationId) {
		opts.headers[applicationIdHeader] = asset.applicationId;
	}

	function task(callback) {
		var req = request(opts, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
		if (asset.fileName) {
			fs.createReadStream(asset.fileName).pipe(req);
		}
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

//ApiClient.prototype.deleteAsset = function deleteAsset(recordingId, assetId, callback) {
//	if (typeof recordingId === 'number') {
//		recordingId = recordingId + '';
//	}
//	if (typeof recordingId !== 'string' || recordingId === '') {
//		throw 'Missing recordingId!';
//	}
//	if (typeof assetId !== 'string' || assetId === '') {
//		throw 'Missing assetId!';
//	}
//	if (typeof callback !== 'function') {
//		throw 'Missing callback!';
//	}
//
//	request({
//		method: 'DELETE',
//		url: this._baseUri + recordingEndpoint + recordingId + '/asset/' + assetId,
//		headers: generateHeaders(this._token)
//	}, function (err, response, body) {
//		if (err) {
//			return callback(err, body);
//		}
//		if (response.statusCode !== 204) {
//			return callback('Received status: ' + response.statusCode, body);
//		}
//		callback(null, body);
//	});
//};

ApiClient.prototype.createJob = function createJob(job, callback) {
	if (typeof job !== 'object') {
		throw 'Missing job!';
	}
	if (typeof job.recordingId === 'number') {
		job.recordingId = job.recordingId + '';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}
	var validation = {
		tasks: {
			presence: true
		}
	};
	var validationErrors = validatejs(job, validation);
	if (validationErrors) {
		throw 'Invalid job object!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'POST',
			url: self._baseUri + jobEndpoint,
			headers: generateHeaders(self._token),
			json: job
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getJobs = function getJobs(options, callback) {
	if (typeof options === 'function' && !callback) {
		callback = options;
		options = {};
	} else if (typeof options === 'string') {
		options = {
			recordingId: options
		};
	} else if (typeof options !== 'object') {
		throw 'Missing options!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var uri = this._baseUri + jobEndpoint;
	if (options.limit || options.offset) {
		if (options.limit && options.ofset) {
			uri += '?limit=' + options.limit + '&offset=' + options.offset;
		} else if (options.limit) {
			uri += '?limit=' + options.limit;
		} else if (options.offset) {
			uri += '?offset=' + options.offset;
		}
	}

	var self = this;
	function task(callback) {
		request({
			method: 'GET',
			url: uri,
			headers: generateHeaders(self._token),
			json: true
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getJobsForRecording = function getJobsForRecording(options, callback) {
	if (typeof options === 'function' && !callback) {
		callback = options;
		options = {};
	} else if (typeof options === 'string') {
		options = {
			recordingId: options
		};
	} else if (typeof options !== 'object') {
		throw 'Missing options!';
	}
	if (typeof options.recordingId === 'number') {
		options.recordingId = options.recordingId + '';
	}
	if (typeof options.recordingId !== 'string' || options.recordingId === '') {
		throw 'Missing options.recordingId!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var uri = this._baseUri + jobEndpoint + 'recording/' + options.recordingId;
	if (options.limit || options.offset) {
		if (options.limit && options.ofset) {
			uri += '?limit=' + options.limit + '&offset=' + options.offset;
		} else if (options.limit) {
			uri += '?limit=' + options.limit;
		} else if (options.offset) {
			uri += '?offset=' + options.offset;
		}
	}

	var self = this;
	function task(callback) {
		request({
			method: 'GET',
			url: uri,
			headers: generateHeaders(self._token),
			json: true
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getJob = function getJob(jobId, callback) {
	if (typeof jobId !== 'string' || jobId === '') {
		throw 'Missing jobId!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'GET',
			url: self._baseUri + jobEndpoint + jobId,
			headers: generateHeaders(self._token),
			json: true
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

//ApiClient.prototype.cancelJob = function cancelJob(jobId, callback) {
//	if (typeof jobId !== 'string' || jobId === '') {
//		throw 'Missing jobId!';
//	}
//	if (typeof callback !== 'function') {
//		throw 'Missing callback!';
//	}
//	
//	request({
//		method: 'DELETE',
//		url: this._baseUri + jobEndpoint + jobId,
//		headers: generateHeaders(this._token),
//		json: true
//	}, function(err, response, body) {
//		if (err) {
//			return callback(err, body);
//		}
//		if (response.statusCode !== 204) {
//			return callback('Received status: ' + response.statusCode, body);
//		}
//		callback(null, body);
//	});
//};

ApiClient.prototype.getTaskType = function getTaskType(taskTypeId, callback) {
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'GET',
			url: self._baseUri + taskTypeByJobEndpoint + taskTypeId,
			headers: generateHeaders(self._token),
			json: true
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getTaskTypes = function getTaskTypes(callback) {
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'GET',
			url: self._baseUri + jobEndpoint + 'task_type',
			headers: generateHeaders(self._token),
			json: true
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.createTaskType = function createTaskType(taskType, callback) {
	if (typeof taskType !== 'object') {
		throw 'Missing taskType!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}
	var validation = {
		taskTypeId: {
			presence: true
		},
		validateUri: {
			presence: true
		},
		executeUri: {
			presence: true
		}
	};
	var validationErrors = validatejs(taskType, validation);
	if (validationErrors) {
		throw 'Invalid taskType object!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'POST',
			url: self._baseUri + jobEndpoint + 'task_type',
			headers: generateHeaders(self._token),
			json: taskType
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.updateTaskType = function updateTaskType(taskType, callback) {
	if (typeof taskType !== 'object') {
		throw 'Missing taskType!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}
	if (typeof taskType.taskTypeId !== 'string' || taskType.taskTypeId === '') {
		throw 'Missing taskTypeId!';
	}
	var validation = {
		taskTypeId: {
			presence: true
		},
		validateUri: {
			presence: true
		},
		executeUri: {
			presence: true
		}
	};
	var validationErrors = validatejs(taskType, validation);
	if (validationErrors) {
		throw 'Invalid taskType object!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'PUT',
			url: self._baseUri + taskTypeByJobEndpoint + taskType.taskTypeId,
			headers: generateHeaders(self._token),
			json: taskType
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.updateTask = function updateTask(jobId, taskId, result, callback) {
	if (typeof jobId !== 'string' || jobId === '') {
		throw 'Missing jobId!';
	}
	if (typeof taskId !== 'string' || taskId === '') {
		throw 'Missing taskId!';
	}
	if (typeof result !== 'object') {
		throw 'Missing result!';
	}
	if (typeof result.taskStatus !== 'string' || result.taskStatus === '') {
		throw 'Missing result.taskStatus!';
	}
	if (result.taskStatus !== 'running' && result.taskStatus !== 'complete' && result.taskStatus !== 'failed') {
		throw 'Invalid task status: ' + result.taskStatus;
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'PUT',
			url: self._baseUri + jobEndpoint + jobId + '/task/' + taskId,
			headers: generateHeaders(self._token),
			json: result
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 204) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.search = function search(searchRequest, callback) {
	if (typeof searchRequest !== 'object') {
		throw 'Missing search request!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'POST',
			url: self._baseUri + searchEndpoint,
			headers: generateHeaders(self._token),
			json: searchRequest
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

//ApiClient.prototype.generateRecordingsReport = function generateRecordingsReport(reportRequest, callback) {
//	if (typeof reportRequest !== 'object') {
//		throw 'Missing report request!';
//	}
//	if (typeof callback !== 'function') {
//		throw 'Missing callback!';
//	}
//
//	var self = this;
//	function task(callback) {
//		request({
//			method: 'POST',
//			url: self._baseUri + reportsEndpoint + 'recordings',
//			headers: generateHeaders(self._token),
//			json: reportRequest
//		}, function(err, response, body) {
//			if (err) {
//				return callback(err, body);
//			}
//			if (response.statusCode !== 200) {
//				return callback('Received status: ' + response.statusCode, body);
//			}
//			callback(null, body.reportId);
//		});
//	}
//
//	self._retryHelper.retry(task, function(err, body) {
//		if (err) {
//			return callback(err, body);
//		}
//		callback(null, body);
//	});
//};
//
//ApiClient.prototype.getRecordingsReport = function getRecordingsReport(reportId, contentType, callback) {
//	if (typeof reportId !== 'string' || reportId === '') {
//		throw 'Missing reportId!';
//	}
//	if (typeof contentType === 'function' && !callback) {
//		callback = contentType;
//		contentType = 'application/json';
//	}
//	if (typeof callback !== 'function') {
//		throw 'Missing callback!';
//	}
//
//	var headers = generateHeaders(this._token);
//	headers.Accept = contentType;
//
//	var self = this;
//	function task(callback) {
//		request({
//			method: 'GET',
//			url: self._baseUri + reportsEndpoint + 'recordings/' + reportId,
//			headers: headers,
//			json: (contentType === 'application/json')
//		}, function(err, response, body) {
//			if (err) {
//				return callback(err, body);
//			}
//			if (response.statusCode === 420) {
//				// report isn't ready
//				return callback();
//			}
//			if (response.statusCode !== 200) {
//				return callback('Received status: ' + response.statusCode, body);
//			}
//			callback(null, body);
//		});
//	}
//
//	self._retryHelper.retry(task, function(err, body) {
//		if (err) {
//			return callback(err, body);
//		}
//		callback(null, body);
//	});
//};
//
//ApiClient.prototype.listUsageReports = function listUsageReports(callback) {
//	if (typeof reportId !== 'string' || reportId === '') {
//		throw 'Missing reportId!';
//	}
//	if (typeof callback !== 'function') {
//		throw 'Missing callback!';
//	}
//
//	request({
//		method: 'GET',
//		url: this._baseUri + reportsEndpoint + 'usage',
//		headers: generateHeaders(this._token),
//		json: true
//	}, function(err, response, body) {
//		if (err) {
//			return callback(err, body);
//		}
//		if (response.statusCode !== 200) {
//			return callback('Received status: ' + response.statusCode, body);
//		}
//		callback(null, body);
//	});
//};

//ApiClient.prototype.getUsageReport = function getUsageReport(reportId, callback) {
//	if (typeof reportId !== 'string' || reportId === '') {
//		throw 'Missing reportId!';
//	}
//	if (typeof callback !== 'function') {
//		throw 'Missing callback!';
//	}
//
//	request({
//		method: 'GET',
//		url: this._baseUri + reportsEndpoint + 'usage/' + reportId,
//		headers: generateHeaders(this._token),
//		json: true
//	}, function(err, response, body) {
//		if (err) {
//			return callback(err, body);
//		}
//		if (response.statusCode !== 200) {
//			return callback('Received status: ' + response.statusCode, body);
//		}
//		callback(null, body);
//	});
//};

ApiClient.prototype.batch = function batch(requests, callback) {
	//validateBatch(requests);
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'POST',
			url: self._baseUri + batchEndpoint,
			headers: generateHeaders(self._token),
			json: requests
		}, function(err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getTaskSummaryByRecording = function getRecordings(options, callback) {
	if (typeof options === 'function' && !callback) {
		callback = options;
		options = {};
	} else if (typeof options === 'string') {
		options = {
			recordingId: options
		};
	} else if (typeof options !== 'object') {
		throw 'Missing options!';
	}
	if (typeof options.recordingId === 'number') {
		options.recordingId = options.recordingId + '';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var uri = this._baseUri + tasksByRecordingEndpoint;
	if(options.keys.length > 0) {
		uri += '?';
	}

	Object.keys(options).forEach(function(key) {
        uri += key+'='+options[key];
    });


	var self = this;
	function task(callback) {
		request({
			method: 'GET',
			uri: uri,
			headers: generateHeaders(self._token),
			json: true
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

/** SaaS functions ************************************************************************************************/

ApiClient.prototype.createDropboxWatcher = function createDropboxWatcher(watcher, callback) {
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'POST',
			url: self._baseUri + dropboxWatcherEndpoint,
			headers: generateHeaders(self._token),
			json: watcher
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getDropboxWatchers = function getDropboxWatchers(options, callback) {
	if (typeof options === 'function' && !callback) {
		callback = options;
		options = {};
	} else if (typeof options === 'string') {
		options = {
			watcherId: options
		};
	} else if (typeof options !== 'object') {
		throw 'Missing options!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var uri = this._baseUri + dropboxWatcherEndpoint;
	if (options.limit || options.offset) {
		if (options.limit && options.offset) {
			uri += '?limit=' + options.limit + '&offset=' + options.offset;
		} else if (options.limit) {
			uri += '?limit=' + options.limit;
		} else if (options.offset) {
			uri += '?offset=' + options.offset;
		}
	}

	var self = this;
	function task(callback) {
		request({
			method: 'GET',
			uri: uri,
			headers: generateHeaders(self._token),
			json: true
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.getDropboxWatcher = function getDropboxWatcher(watcherId, callback) {
	if (typeof watcherId !== 'string' || watcherId === '') {
		throw 'Missing watcherId!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'GET',
			uri: self._baseUri + dropboxWatcherEndpoint + watcherId,
			headers: generateHeaders(self._token),
			json: true
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.updateDropboxWatcher = function updateDropboxWatcher(watcher, callback) {
	if (typeof watcher !== 'object') {
		throw 'Missing watcher!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'PUT',
			url: self._baseUri + dropboxWatcherEndpoint + watcher.watcherId,
			headers: generateHeaders(self._token),
			json: watcher
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 200) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

ApiClient.prototype.deleteDropboxWatcher = function deleteDropboxWatcher(watcherId, callback) {
	if (typeof watcherId !== 'string' || watcherId === '') {
		throw 'Missing watcherId!';
	}
	if (typeof callback !== 'function') {
		throw 'Missing callback!';
	}

	var self = this;
	function task(callback) {
		request({
			method: 'DELETE',
			url: self._baseUri + dropboxWatcherEndpoint + watcherId,
			headers: generateHeaders(self._token)
		}, function (err, response, body) {
			if (err) {
				return callback(err, body);
			}
			if (response.statusCode !== 204) {
				return callback('Received status: ' + response.statusCode, body);
			}
			callback(null, body);
		});
	}

	self._retryHelper.retry(task, function(err, body) {
		if (err) {
			return callback(err, body);
		}
		callback(null, body);
	});
};

module.exports = ApiClient;
