class SockThen {
  pending = new EventTarget();
  counter = 1;
  socket;
  
  // Connect to the websocket URL and listen for responses. Responses will be
  // dispatched to a custom event based on the message ID so that the corresponding
  // promise can be resolved.
  constructor(url){
    this.socket = new WebSocket(url);
    this.socket.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);
      this.pending.dispatchEvent(new CustomEvent('e_' + data.id, {detail: data.payload}));
    });
  }
  
  // Send the websocket message and return a promise that is will be resolved when
  // a response message arrives with a matching ID.
  send(payload){
    const data = {
      id: this.counter++,
      payload: payload,
    }
    
    return new Promise((resolve) => {
      // A single-use event handler that removes itself and resolves the promise.
      const handleAndResolve = (e) => {
        this.pending.removeEventListener('e_' + data.id, handleAndResolve);
        resolve(e.detail);
      };
      
      this.pending.addEventListener('e_' + data.id, handleAndResolve);
      
      this.socket.send(JSON.stringify(data));
    });
  }
  
    
  close(){
    this.socket.close();
  }
}
