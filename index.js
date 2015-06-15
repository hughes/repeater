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
  console.log('connection closed')
  while ((i = conns.indexOf(this)) !== -1) {
    conns.splice(i, 1);
  }
}

function receive(str) {
  var result;
  try {
    result = JSON.parse(str);
  } catch(e) {
    this.sendText('{err: true}');
    return;
  }
  verify(result) && broadcast(result);
}

function verify(result) {
  var valid = true;
  valid = valid && (result.x !== undefined);
  valid = valid && (result.y !== undefined);
  valid = valid && (result.id !== undefined);
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

