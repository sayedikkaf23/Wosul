import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
//import { environment } from 'src/environments/environment.prod';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})

export class SocketService {
  private socket;
  // private serverUrl = 'https://app.yeepeey.com'
  private serverUrl = environment.serverUrl
  constructor() {
    this.socket = io(this.serverUrl);
    console.log('object socket :>> ');
  }
  public onEvent(action) {
    return new Observable<any>((observer) => {
      this.socket.on(action, (data) => observer.next(data));
    });
  }
}
