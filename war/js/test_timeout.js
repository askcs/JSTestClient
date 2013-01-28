// login part
session.appServices = sessionStorage.getItem("appService");

module("Login module");

function login(user, pass) {
	var ret = 0;
	var passHash = MD5(pass);

	$.ajax({
		url : session.appServices + 'login',
		type : "GET",
		async : false,
		xhrFields : {
			withCredentials : true
		},
		data : {
			"uuid" : '' + user,
			"IMEI" : '',
			"pass" : '' + passHash
		},
		statusCode : {
			200 : function(data) {
				console.log("200");
				ret = 1;
				var xid = "";
				if($.isPlainObject(data)){
					xid = data['X-SESSION_ID'];
				}else{
					xid = JSON.parse(data)["X-SESSION_ID"];
				}
				console.log("xid", xid);
				session.setSessionKey(xid);
			},
			400 : function(data) {
				console.log("400");
				ret = 2;
			}
		},
		error : function(e) {
			console.log(e);
			ret = 0;
		}
	});

	return ret;
}

var logout = function() {
	var ret = 0;

	$.ajax(session.appServices + "logout", {
		headers : {
			'X-SESSION_ID' : session.sessionKey
		},
		async : false,
		xhrFields : {
			withCredentials : true
		},
		statusCode : {
			200 : function(data) {
				session.setSessionKey("");
				ret = 1;
			},
			400 : function(data) {
				ret = 2;
			}
		}
	});

	return ret;
}

// login and logout
test("Login", function() {

	var result = login("mma@ask-cs.com", "ask");

	equal(result, 2, "Login failed!");
	result = login("mma@ask-cs.com", "askask");

	equal(result, 1, "Login success!");
	result = logout();
	equal(result, 1, "logout success!");

});
// login as admin

module("Admin functions ", {
	setup : function() {
		var result = login("timeout@ask-cs.com", "askask");
		equal(result, 1, "Login success !");
	}
});

test("get timeout list ", function() {
	var getTimeoutList = function() {
		var ret = 0;
		session.get("timeout/admin/tmlist", null, function(res) {
			if(res == "error") {
				ret = 2;
			} else {
				ret = 1;
			}
		}, function() {
			ret = 3;
		});
		return ret;
	};
	equal(getTimeoutList(), 1, "get timeout list success! ");

	var testRemoteChange = function(res) {
		var ret = 0;
		session.post("timeout/remoteChange", null, function() {
			if(res == "error") {
				ret = 2;
			} else {
				ret = 1;
			}
		}, function() {
			ret = 3;
		});
		return ret;
	}
	equal(testRemoteChange(), 1, "Test the remote change ! ");

	var result = logout();
	equal(result, 1, "logout success!");
});
// test("remote change ")

// create test account
test("create or delete the test account", function() {

	var validUsers = function() {
		var ret = 0;
		var paraUsers = ["test_a@ask-cs.com", "test_b@ask-cs.com", "test_ctc@ask-cs.com"];

		session.post("timeout/validUser", paraUsers, function(res) {
			if(res == "ok") {
				ret = 1;
			} else {
				ret = 2;
			}
		}, function(res) {
			ret = 2;
		});
		return ret;
	}
	var result = validUsers();
	equal(result, 1, "valid users !");

	if(result != 1) {
		var deleteTimeoutUsers = function() {
			var paraUsers = ["test_a@ask-cs.com", "test_b@ask-cs.com", "test_ctc@ask-cs.com"];
			var ret = 0;
			session.post("timeout/admin/removeUser", paraUsers, function(res) {
				if(res == "ok") {
					ret = 1;
				} else {
					ret = 2;
				}
			}, function(res) {
				ret = 2;
			});
			return ret;
		}
		result = deleteTimeoutUsers();
		equal(result, 1, "delete users.");

		var para = {
			"userId" : "test_a@ask-cs.com"
		};
		var deleteTimeout = function() {
			var ret = 0;
			session.post("timeout/removeTimeout", para, function(res) {
				ret = 1;
			}, function(res) {
				ret = 2;
			});
			return ret;
		}
		result = deleteTimeout();
		equal(result, 1, "remove timeout setup .");
	} else {
		var createTimeout = function() {
			var ret = 0;
			var para = {
				'timeout' : {
					'personA' : {
						'id' : "test_a@ask-cs.com",
						'pass' : MD5("askask"),
						'phone' : "0624384730",
						'clear' : "askask"
					},
					'personB' : {
						'id' : "test_b@ask-cs.com",
						'pass' : MD5("askask"),
						'phone' : "533",
						'clear' : "askask"
					},
					'contact' : {
						'id' : "test_ctc@ask-cs.com",
						'phone' : "534"
					},
					'address' : {
						'address' : "Damrak 1",
						'zipcode' : "012 LG Amsterdam",
						'country' : 'the Netherlands'
					}
				}
			};

			session.post("timeout/setupAsync", para, function(res) {
				if(res == "error") {
					ret = 2;
				} else {
					ret = 1;
				}
			}, function(res) {
				ret = 3;
			});
			return ret;
		};
		equal(createTimeout(), 1, "setup a timeout config ! (Async)");
	}

});

var getCreatedTestAcct = function() {
	var count = 0;
	var checkTimeout = function() {
		session.get("timeout/admin/tmlist", null, function(res) {
			if(res != "error") {
				var json = JSON.parse(res);
				var obj = null;
				$.map(json, function(item, i) {
					console.log("item --> ", item);
					if(item.personA == "test_a@ask-cs.com" && item.status == "1") {
						obj = item;
					}
				});
				if(obj != null) {// if there is test account in the list and status is 1 (ready)
					ok(true, "Test account created , ready to do a user test!");
					startFrontTest();
					start();
				} else {
					scriptLog("Test account is being created, will try to get it after 10 secs.");
					count++;
					if(count < 6) {
						setTimeout(function() {
							checkTimeout();
						}, 10000);
					} else {
						ok(false, "Test account is not created , not ready to do a user test!");
						start();
					}
				}
			}
		}, function() {
		});
	}
	checkTimeout();
}

setTimeout(function() {
	asyncTest("get the created test account : after it has been created !", getCreatedTestAcct);
}, 3000);
// start and stop timeout
var startFrontTest = function() {
	module("frontend functions ", {
		setup : function() {
			var result = login("test_a@ask-cs.com", "askask");
			equal(result, 1, "Login success !");
		},
		teardown : function() {
			var result = logout();
			equal(result, 1, "logout success !");
		}
	});

	test("Timeout start , stop , check sensor, add note, get note", function() {
		var timeout_start = function() {
			var ret = 0;
			session.get("timeout/start", null, function(res) {
				ret = 1;
			}, function() {
				ret = 2;
			});
			return ret;
		}
		equal(timeout_start(), 1, "timeout start ! ");

		var timeout_checksensor = function() {
			var ret = 0;
			session.get("timeout/checkSensor", null, function(res) {
				ret = 1;
			}, function() {
				ret = 2;
			});
			return ret;
		}
		equal(timeout_checksensor(), 1, "timeout check sensor ! ");

		var getNotes = function() {
			var ret = 0;
			session.get("timeout/checkSensor", null, function(res) {
				ret = 1;
			}, function() {
				ret = 2;
			});
			return ret;
		}
		equal(getNotes(), 1, "get notes ! ");

		var timeout_stop = function() {
			var ret = 0;
			session.get("timeout/stop", null, function(res) {
				ret = 1;
			}, function() {
				ret = 2;
			});
			return ret;
		}
		equal(timeout_stop(), 1, "timeout stop ! ");
	});
}
// get the timeout setting