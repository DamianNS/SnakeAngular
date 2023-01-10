import { Component, OnInit } from '@angular/core';
import { MatListOption, MatSelectionListChange } from '@angular/material/list';
import { Route, Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { BackendService } from '../servicios/backend.service';

interface UpdateListServersModel {
  guid:string;
  name:string;
  jugadoresJoined:number;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  public userName = '';
  public groupName = '';
  public messageToSend = '';
  public joined = false;
  public conversation: NewMessage[] = [{
    message: 'Bienvenido',
    userName: 'Sistema'
  }];

  private connection: HubConnection;
  activeServers:UpdateListServersModel[] = [];
  serverNameInput:string = "sin nombre";
  selectedServer: UpdateListServersModel|undefined;
  private urlBack = environment.urlBack;

  constructor(
    private back: BackendService,
    private router:Router
  ) {
    this.connection = new HubConnectionBuilder()
      .withUrl(`${this.urlBack}/chathub`)
      .build();
    this.connection.on("NewUser", message => this.newUser(message));
    this.connection.on("NewMessage", message => this.newMessage(message));
    this.connection.on("LeftUser", message => this.leftUser(message));
    this.connection.on("UpdateListServers", message => this.UpdateListServers(message));
  }

  UpdateListServers(message: UpdateListServersModel[]): any {
    this.activeServers = message;
  }

  ngOnInit(): void {
    this.connection.start()
      .then(_ => {
        console.log('Connection Started');
      }).catch(error => {
        console.error(error);
      });
  }

  public join() {
    if(this.userName.trim() == ''){
      alert("ingrese un nombre");
    }
    this.connection.invoke('JoinGroup', "Lobby", this.userName)
      .then(_ => {
        this.joined = true;
      });
  }

  public sendMessage() {
    const newMessage: NewMessage = {
      message: this.messageToSend,
      userName: this.userName,
      groupName: this.groupName
    };

    this.connection.invoke('SendMessage', newMessage)
      .then(_ => this.messageToSend = '');
  }

  public leave() {
    this.connection.invoke('LeaveGroup', this.groupName, this.userName)
      .then(_ => this.joined = false);
  }

  private newUser(message: string) {
    console.log(message);
    this.conversation.push({
      userName: 'Sistema',
      message: message
    });
  }

  private newMessage(message: NewMessage) {
    console.log(message);
    this.conversation.push(message);
  }

  private leftUser(message: string) {
    console.log(message);
    this.conversation.push({
      userName: 'Sistema',
      message: message
    });
  }

  onClikCreateServer() {
    this.back.crearServer(this.serverNameInput).subscribe(id => {
      console.log('crearServer', id);
      this.router.navigate(['juego'], { queryParams: { id: id, name: this.userName}});
    });
  }

  onSelectionChange($event:MatSelectionListChange){
    console.log($event);
    if($event.options && $event.options.length > 0){
      let xserver:MatListOption = $event.options[0];
      if(xserver){
        this.selectedServer = xserver.value;        
      }
    }
  }

  onClikJoinServer(){
    if(this.selectedServer){
      this.router.navigate(['juego'], { queryParams: { id: this.selectedServer.guid, name: this.userName}});
    }    
  }
}

interface NewMessage {
  userName: string;
  message: string;
  groupName?: string;
}