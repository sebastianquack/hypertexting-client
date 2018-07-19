import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

//var baseUrl = 'http://192.168.1.2:3000';
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
  currentRoomId:string;

  constructor(public http: HttpClient) {
    this.currentRoomId = null;

    this.socket = io(baseUrl);
    this.socket.on('disconnect', function(){
      console.log("socket disconnect");
    });
    this.socket.on('connect', function(){
      console.log("socket connect");
    });
    this.socket.on('reconnect_attempt', () => {
      console.log("reconnect_attempt");
      this.socket.io.opts.query = {
        currentRoomId: this.currentRoomId
      };
    });
  }

  // socket.io api

  setCurrentRoomId(id) {
    this.currentRoomId = id;
  }

  socketConnected() {
    return this.socket.connected;
  }

  joinRoom(room:string) {
    this.setCurrentRoomId(room);
    this.socket.emit('joinRoom', room); // ask server to put us in a room
  }

  listenForMessages(callback) {
    this.socket.on('message', callback);
  }

  emitMessage(msg, nodeId) {
    this.socket.emit('message', {message: msg, room: nodeId});
  }

  leaveRoom(room:string) {
    this.setCurrentRoomId(null);
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
