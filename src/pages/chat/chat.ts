import { Component, ViewChild } from '@angular/core';
import { NavController, Content, NavParams, ModalController } from 'ionic-angular';

import { EditPage } from '../edit/edit';
import { ServerProvider } from '../../providers/server/server';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html'
})
export class ChatPage {

  msgInput:string;
  messages:any[];
  socket:any;
  node:any;

  @ViewChild(Content) content: Content;

  constructor(
    public navCtrl: NavController, 
    private navParams: NavParams,
    public modalCtrl: ModalController,
    private server: ServerProvider) {
  	
    this.msgInput = '';
    this.messages = [];
    this.node = this.navParams.get('node');
    
    console.log("asking server to send to room " + this.node.id);
    server.joinRoom(this.node.id); 

    server.listenForMessages((data)=>{this.receive(data)});
  }

  ionViewWillEnter() {
    //if(!this.server.socketConnected()) {
    this.systemMsg("connecting...");
    //}  
  }

  openEditModal() {
    var modalPage = this.modalCtrl.create(EditPage, {nodeId: this.node.id}); 
    modalPage.onDidDismiss(data => {
      this.server.getNode(this.node.id).subscribe((res:any) => {
        this.node = res;
      });
    }); 
    modalPage.present(); 
  }

  chatMsg(msg, side) {
    let item = {
      "styleClass": "chat-message " + side, 
      "content": msg.message, 
      "name": side == "left" ? msg.name : null,
      "typing": side == "left" ? true : false
    };
    this.displayMsg(item);
  }

  systemMsg(msg) {
    let item = {"styleClass": "system-message", "content": msg};
    this.displayMsg(item);
  }

  displayMsg(item) {
    this.messages.push(item);
    if(item.typing) {
      let index = this.messages.length - 1;
      setTimeout(()=>{
        this.messages[index].typing = false;  
      }, 100 * item.content.length);
    }
    if(this.content._scroll) {
      this.content.scrollTo(0, this.content.getContentDimensions().scrollHeight - 48, 500);  
    } 
  }

  send(msg) {
		if(msg != '') {
      this.chatMsg({message: msg}, "right");
      this.server.emitMessage(msg, this.node.id);
		}
		this.msgInput = '';
  }

  receive(msg) {
		console.log("received message");
    console.log(msg);
    if(!msg) {
      return;
    }
    if(msg.system) {
      if(msg.message) {
        this.systemMsg(msg.message);  
      }
      if(msg.moveTo) {
        this.node = msg.moveTo;
      }
    } else {
      this.chatMsg(msg, "left");  
    }
    
	}

  ionViewWillLeave() {
    this.server.leaveRoom(this.node.id);
  }

}

