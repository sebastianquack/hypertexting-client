import { Component } from '@angular/core';
import { NavController, ModalController, NavParams } from 'ionic-angular';

import { ServerProvider } from '../../providers/server/server';

import { ChatPage } from '../chat/chat';
import { EditPage } from '../edit/edit';

/**
 * Generated class for the ListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage {

  nodes = [];

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
    public modalCtrl: ModalController,
  	public server: ServerProvider) {
  }

  updateNodeList() {
    this.server.getNodes().subscribe((res:any)=>{
      console.log(res);
      this.nodes = res.nodes;
    });
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad ListPage');
    this.updateNodeList(); 
  }

  openChat(node) {
  	console.log(node);
  	this.navCtrl.push(ChatPage, {
      node: node
    });
  }

  createNode() {
    var modalPage = this.modalCtrl.create(EditPage, {nodeId: null}); 
    modalPage.onDidDismiss(data => {
      this.updateNodeList();
    });
    modalPage.present(); 
  }

}
