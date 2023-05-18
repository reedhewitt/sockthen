# SockThen
A simple proof-of-concept for wrapping websocket messages in a promise to make them then-able.

## Usage
Initialize a new instance of SockThen and use the send function, similarly to a regular websocket. But unlike a regular websocket, it returns a promise so you can use `.then()` or `await`.

In the browser:
```
const sock = new SockThen('ws://localhost:3000');

// Then-able websocket message!
sock.send('Hello, world!').then(response => console.log(response));

// Not in a hurry? Just wait.
await sock.send('Hello again');
```
This requires special handling on the server side, because your message gets wrapped in an object with a unique ID property and the original payload. This object is JSON encoded and sent over the websocket. The server can parse the JSON and do whatever you want with the payload, but it must respond with a JSON object that has the same ID and a payload property with the response value.

On the server, inside the message handler function:
```
// Parse the message.
const data = JSON.parse(message);

// Do something with the payload to get a response value.
const responsePayload = myAwesomeFunction(data.payload);

// Send the response value inside a JSON object with the same ID.
ws.send(JSON.stringify({
  id: data.id,
  payload: responsePayload,
}));
```

## How It Works
As mentioned above, SockThen wraps each message in an object with two properties: a unique ID and the original payload. Then it creates a promise to return from the send function. Inside that promise, an event listener is attached to ThenSock's dedicated EventTarget object with a unique event name based on the ID. When a response comes from the server, it includes the ID, so the unique event name can be used to dispatch a custom event with the response value. The event handler removes itself and resolves the promise with the response value.

## To Do
- Handle connection failures, reconnection
- Expose properties of the inner websocket (readystate, etc.)
- Emit events of the inner websocket (message, error, etc.)
