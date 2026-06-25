import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { INotification } from '../interfaces/notification.model';
import { AuthServiceService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | undefined;
  public notificationReceived = new Subject<INotification>();
  private readonly _auth = inject(AuthServiceService);

  public startConnection(): void {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.baseUrl}/hubs/notifications`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connection started');
        this.addNotificationListener();
      })
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  private addNotificationListener(): void {
    if (this.hubConnection) {
      this.hubConnection.on('ReceiveNotification', (notification: INotification) => {
        const user = this._auth.currentUser();
        const roles = this._auth.getRoles();
        
        const isAuthorized = 
            notification.recipientEmail === user?.email || 
            (notification.recipientRole && roles.includes(notification.recipientRole)) || 
            (roles.includes('Admin') && !notification.userId && !notification.recipientEmail && !notification.recipientRole);
        
        if (isAuthorized) {
          this.notificationReceived.next(notification);
        }
      });
    }
  }
}
