import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import {Geolocation} from '@ionic-native/geolocation';

import { CodemirrorModule } from '@nomadreservations/ngx-codemirror';
import { HttpClientModule } from '@angular/common/http';  // replaces previous Http service

import { MyApp } from './app.component';
import { ServerProvider } from '../providers/server/server';

import { ListPage } from '../pages/list/list';
import { ChatPage } from '../pages/chat/chat';
import { EditPage } from '../pages/edit/edit';

@NgModule({
  declarations: [
    MyApp,
    ListPage,
    ChatPage,
    EditPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    CodemirrorModule,
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ListPage,
    ChatPage,
    EditPage
  ],
  providers: [
    Geolocation,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ServerProvider
  ]
})
export class AppModule {}
