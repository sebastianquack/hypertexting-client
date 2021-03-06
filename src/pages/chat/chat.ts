import { Component, ViewChild } from '@angular/core';
import { NavController, Content, NavParams, ModalController, ActionSheetController, LoadingController } from 'ionic-angular';

import { EditPage } from '../edit/edit';
import { ServerProvider } from '../../providers/server/server';

import * as $ from "jquery";

import { Geolocation } from '@ionic-native/geolocation';

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
    public actionSheetCtrl: ActionSheetController,
    private geolocation: Geolocation,
    public loadingCtrl: LoadingController,
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

  openAttachOptions() {
    console.log("attach clicked");
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Send Attachment',
      buttons: [
        {
          text: 'Location',
          icon: 'md-locate',
          handler: () => {
            console.log('Location clicked');
            const loader = this.loadingCtrl.create({
              content: "Getting Location..."
            });
            loader.present();
            this.geolocation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 0}).then((resp) => {
              console.log(resp);
              
              let mapUrl = "https://www.google.com/maps/@"+resp.coords.latitude+","+resp.coords.longitude+",18z";

              let mapImgUrl = 
              "https://maps.googleapis.com/maps/api/staticmap?center="
              +resp.coords.latitude+","+resp.coords.longitude
              +"&zoom=18&size=150x150"
              +"&markers=size:small%7Ccolor:blue%7C"+resp.coords.latitude+","+resp.coords.longitude
              +"&key=AIzaSyDQLtgFdKIsghQkoiYN-ojaa2wX7K4d630";

              this.send("<a target='_blank' href='"+mapUrl+"'><img width='150', height='150' src='"+mapImgUrl+"' alt='map'></a>");
                
              loader.dismiss();
            }).catch((error) => {
              console.log('Error getting location', error);
              loader.dismiss();
            });
          }
        },
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            console.log('Camera clicked');
          }
        },
        {
          text: 'Gallery',
          icon: 'image',
          handler: () => {
            console.log('Gallery clicked');
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
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

