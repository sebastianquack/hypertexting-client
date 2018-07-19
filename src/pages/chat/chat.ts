import { Component, ViewChild } from '@angular/core';
import { NavController, Content, NavParams, ModalController } from 'ionic-angular';

import { EditPage } from '../edit/edit';
import { ServerProvider } from '../../providers/server/server';

import * as $ from "jquery";

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html'
})
export class ChatPage {

  msgInput:string;
  messages:any[];
  socket:any;
  node:any;
  autoTyping:boolean;

  @ViewChild(Content) content: Content;

  constructor(
    public navCtrl: NavController, 
    private navParams: NavParams,
    public modalCtrl: ModalController,
    private server: ServerProvider) {
  	
    this.msgInput = '';
    this.messages = [];
    this.node = this.navParams.get('node');
    this.autoTyping = false;
  }

  ngAfterViewInit(){
      $(document).ready(function(){
        console.log('JQuery is working!!');
      });
  }

  ionViewWillEnter() {
    this.systemMsg("connecting...");

    console.log("asking server to send to room " + this.node.id);
    this.server.joinRoom(this.node.id); 
    this.server.listenForMessages((data)=>{this.receive(data)});
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

  // todo: find a way to do this with angular
  updateMarkEvents() {
    setTimeout(()=> {
      console.log("setting up events on marks");
      $('mark').off("click");
      $('mark').on("click", (event)=> {
        this.autoType(event.target.innerHTML);
      });    
    }, 500);
  }

  // animate typing into input field when user clicks shortcut in log
  autoType(text) {
    if (this.autoTyping) return;
    else this.autoTyping = true;
    var delay = 90;
    var type = (text, delay) => {
      let character = text.substr(0,1);
      let remaining = text.substr(1);
      this.msgInput += character;
      if (remaining != "") setTimeout(()=>{type(remaining, delay)}, delay);
    }
    type(text, delay);
    setTimeout(()=> { this.send(this.msgInput); this.autoTyping = false; }, delay * (text.length+5));
  }


  displayMsg(item) {
    this.messages.push(item);
    if(item.typing) {
      let index = this.messages.length - 1;
      setTimeout(()=>{
        this.messages[index].typing = false;
        this.updateMarkEvents();  
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

