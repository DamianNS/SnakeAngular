import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BackendService } from '../servicios/backend.service';

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

  constructor(
    private back: BackendService,
    private router:Router
  ) {
    this.connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7064/chathub')
      .build();
    this.connection.on("NewUser", message => this.newUser(message));
    this.connection.on("NewMessage", message => this.newMessage(message));
    this.connection.on("LeftUser", message => this.leftUser(message));
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
    this.back.crearServer().subscribe(id => {
      console.log('crearServer', id);
      this.router.navigate(['juego'], { queryParams: { id: id, name: this.userName}});
    });
  }

}

interface NewMessage {
  userName: string;
  message: string;
  groupName?: string;
}