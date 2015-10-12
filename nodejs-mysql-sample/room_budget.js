var mysql = require('mysql');
var http = require('http');
var dispatcher = require('httpdispatcher');

// mysql connection
var connection = mysql.createConnection({
	host : '<host-name>',
	user : '<user-name>',
	password : '<password>',
	database : '<database-name>'
});

connection.connect(function(err) {
	if (err != null) {
		console.log("Error in connection - " + err);
	}
});

function DateString() {
	var d = new Date();
	function pad(n) {
		return n < 10 ? '0' + n : n
	}
	return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-'
			+ pad(d.getDate()) + ' ' + pad(d.getHours()) + ':'
			+ pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}

dispatcher.onGet("/RoomBudget/", function(req, res) {
	var resBody = "";

	var query = connection.query(
			'select * from room_budget order by sno desc limit 20', function(
					err, rows, fileds) {
				if (err != null) {
					console.log("Error while select - " + err);
					resBody = {
						"status" : "error",
						"data" : []
					};
				} else {
					resBody = {
						"status" : "success",
						"data" : rows
					};
				}

				res.writeHead(200, {
					'Content-Type' : 'application/json'
				});
				res.end(JSON.stringify(resBody));
			});

});

dispatcher.onPost("/RoomBudget/", function(req, res) {

	var reqBody = JSON.parse(req.body);
	var resBody = "";
	reqBody.sno = null;
	reqBody.buydate = DateString();

	var query = connection.query('INSERT INTO room_budget SET ?', reqBody,
			function(err, result) {
				if (err != null) {
					resBody = {
						"status" : "error",
						"data" : []
					};
					console.log("Error in inserting - " + err);
				} else {
					resBody = {
						"status" : "success",
						"data" : [ reqBody ]
					};
				}

				res.writeHead(200, {
					'Content-Type' : 'application/json'
				});
				res.end(JSON.stringify(resBody));
			});
});

http.createServer(function(req, res) {
	dispatcher.dispatch(req, res);
}).listen(1337, '127.0.0.1');
