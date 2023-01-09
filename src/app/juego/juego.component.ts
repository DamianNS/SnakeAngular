import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

class UpdateMapData {
  x!:number;
  y!:number;
  tipo!:number;
}

@Component({
  selector: 'app-juego',
  templateUrl: './juego.component.html',
  styleUrls: ['./juego.component.scss']
})
export class JuegoComponent implements OnInit {
  private connection: HubConnection;
  idServer = '';
  ready = false;
  context!: CanvasRenderingContext2D;
  message = "";
  statusServer = 0;

  @ViewChild('canvas', { static: true}) myCanvas!: ElementRef;
  constructor(
    private route: ActivatedRoute
  ) { 
    this.connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7064/serverhub')
      .build();

      this.connection.on("UpdateMap", message => this.UpdateMap(message));
      this.connection.on("Chat", message => this.Chat(message));
      this.connection.on("Status", message => this.Status(message));
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    console.log(event.key);
    let direccion="";
    switch(event.key.toLowerCase()){
      case "w": direccion = "Arriba"; break;
      case "s": direccion = "Abajo"; break;
      case "a": direccion = "Izquierda"; break;
      case "d": direccion = "Derecha"; break;
      default: return;
    }
    event.preventDefault();
    this.CambioDireccion(direccion);
  }

  private CambioDireccion(direccion:string){
    let msg:NewMessage = {
      command: 3, // direccion
      serverId: this.idServer,
      datos:direccion
    };
    this.connection.invoke('SendCommand', msg)
  }
  
  Status(status: number): any {
    this.statusServer = status;
  }
  Chat(message: string): any {
    this.message = message;
  }
  UpdateMap(updateData:UpdateMapData): any {
    switch(updateData.tipo){
      case 0:
        this.drawCuadro(updateData.x,updateData.y, "#E6E6E6");
        break;
      case 1:
        this.fillCuadro(updateData.x,updateData.y, "#FF0000");
        break;
      case 2: //comida
        console.log("comida", updateData);
        
        this.fillCuadro(updateData.x,updateData.y, "#00FF1C");
        break;
    }
  }

  async ngOnInit() {
    this.route.queryParams.subscribe( params =>{
      this.idServer = params['id'];
      console.log(params);
      
    });

    const canvas:HTMLCanvasElement = this.myCanvas.nativeElement;
    var cc = canvas.getContext('2d');
    
    if(cc){
      this.context = cc;
      await this.drawGrilla(this.context);
    }

    this.connection.start()
      .then(_ => {
        console.log('Connection Started');
      }).catch(error => {
        return console.error(error);
      });
  }
  async drawGrilla(context: CanvasRenderingContext2D) {
    context.strokeStyle = "#E6E6E6";
    for(let i=0;i<600;i=i+10){
      for(let y=0;y<500;y=y+10)
      context.strokeRect(i,y,10,10);
      //await this.sleep(1000);
    }
  }

  drawCuadro(x:number,y:number,color:string){
    this.context.clearRect(x*10,y*10,10,10)
    this.context.strokeStyle = color;
    this.context.strokeRect(x*10,y*10,10,10);
  }

  fillCuadro(x:number,y:number,color:string){
    this.context.fillStyle = color;
    this.context.fillRect(x*10,y*10,10,10);
  }

  sleep = (ms:number) => new Promise(r => setTimeout(r, ms));

  onClickReady(){
    let msg:NewMessage = {
      serverId: this.idServer,
      command: 0,
      datos: "Damián"
    };

    this.connection.invoke('AddJugador', msg)
      .then(_ => {
        this.ready = true;
        let msg:NewMessage = {
          command: 0,
          serverId: this.idServer,
          datos:"Damián"
        };
        this.connection.invoke('SendCommand', msg)
      }).catch( err => {
        console.log(err);        
      });
  }

  onClickStart(){
    let msg:NewMessage = {
      command: 2, // iniciar
      serverId: this.idServer,
      datos:undefined
    };
    this.connection.invoke('SendCommand', msg)
  }
  onClickExit(){
    
  }
  
}

interface NewMessage {
  serverId: string;
  command: number;
  datos?: string;
}