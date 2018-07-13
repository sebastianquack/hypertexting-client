import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { ServerProvider } from '../../providers/server/server';

import { CodemirrorService } from '@nomadreservations/ngx-codemirror';

/**
 * Generated class for the EditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-edit',
  templateUrl: 'edit.html',
})
export class EditPage {

  nodeId:string = "";
  script:string = "";
  name:string = "";
  public codemirror;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl : ViewController,
    private _codeMirror: CodemirrorService,
    public server: ServerProvider) {

    this.nodeId = navParams.get('nodeId');
    if(this.nodeId) {
      console.log("sending get request for node " + this.nodeId);    
      this.server.getNode(this.nodeId).subscribe((res:any) => {
        console.log(res);
        if(res.script) {
          this.script = res.script;
        }
        if(res.name) {
          this.name = res.name;
        }
      });  
    }
  }

  public ngOnInit() {
    this._codeMirror.instance$.subscribe((editor) => {
      this.codemirror = editor;
    });
  }

  save() {
    this.server.postNode(this.nodeId, {name: this.name, script: this.script}).subscribe(
      (res:any) => {
        console.log(res);
        this.nodeId = res.node.id;
        this.viewCtrl.dismiss();
      },
      (err:any) => {
        alert("error saving script");
       }
    );
  }

  cancel() {
    this.viewCtrl.dismiss(null); // don't save
  }

}


