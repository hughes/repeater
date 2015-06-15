var ws = require('nodejs-websocket');

var conns = [];

function subscribe(conn) {
  console.log('subscribe!');
  conns.push(conn);
  conn.on('text', receive);
  conn.on('close', unsubscribe);
}

function unsubscribe() {
  var i;
  while ((i = conns.indexOf(this)) !== -1) {
    conns.splice(i, 1);
  }
}

function receive(str) {
  console.log('received: ' + str);
  var result;
  try {
    result = JSON.parse(str);
  } catch(e) {
    console.log('received malformed message: ' + str);
    this.sendText('{err: true}');
    return;
  }
  console.log('parsed: ' + JSON.stringify(result));
  verify(result) && broadcast(result);
}

function verify(result) {
  var valid = true;
  console.log('a: ' + valid);
  valid = valid && (result.x !== undefined);
  console.log('b: ' + valid + ' ' + valid['x']);
  valid = valid && (result.y !== undefined);
  console.log('c: ' + valid);
  valid = valid && (result.id !== undefined);
  console.log('valid: ' + valid);
  return result;
}

function broadcast(message) {
  var str = JSON.stringify({
    x: message.x,
    y: message.y,
    id: message.id,
  }), conn;
  for(var i=0; i<conns.length; i++) {
    conn = conns[i];
    conn.sendText(str);
  }
}

var server = ws.createServer(subscribe).listen(8001);

