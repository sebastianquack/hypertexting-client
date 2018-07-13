import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

//var baseUrl = 'http://localhost:3000';
var baseUrl = 'https://htserver.herokuapp.com';

/*
  Generated class for the ServerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServerProvider {

  socket:any;
  constructor(public http: HttpClient) {
    this.socket = io(baseUrl);
  }

  // socket.io api

  joinRoom(room:string) {
    this.socket.emit('joinRoom', room); // ask server to put us in a room
  }

  listenForMessages(callback) {
    this.socket.on('message', callback);
  }

  emitMessage(msg, nodeId) {
    this.socket.emit('message', {message: msg, room: nodeId});
  }

  leaveRoom(room:string) {
    this.socket.off('message');
    this.socket.emit('leaveRoom', room); // ask server to remove us from a room
  }
  
  // rest api

  getNodes() {
    return this.http.get(baseUrl + '/nodes');
  }

  getNode(nodeId) {
    return this.http.get(baseUrl + '/node?id='+nodeId);
  }

  postNode(nodeId, nodeData) {
	  return this.http.post(baseUrl + '/node', {
		  id: nodeId,
    	script: nodeData.script,
      name: nodeData.name
    });
  }

}
