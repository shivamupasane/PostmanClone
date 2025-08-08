import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { RequestBuilderComponent } from '../../components/request-builder/request-builder.component';
import { ResponseViewerComponent } from '../../components/response-viewer/response-viewer.component';
import { HttpRequest, HttpResponse } from '../../models/http-models';

@Component({
  selector: 'app-api-tester',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    // SidebarComponent,
    RequestBuilderComponent,
    ResponseViewerComponent
  ],
  template: `
    <div class="api-tester-container">
      <!-- Header -->
      <mat-toolbar color="primary" class="header">
        <mat-icon class="app-icon">code</mat-icon>
        <span class="app-title">API Tester</span>
        <span class="spacer"></span>
      </mat-toolbar>

      <!-- Main Content -->
      <div class="content-area">
        <mat-sidenav-container class="sidenav-container">
          <!-- Sidebar - temporarily disabled for testing -->
          <mat-sidenav mode="side" opened class="sidebar">
            <div>Sidebar placeholder</div>
          </mat-sidenav>

          <!-- Main Panel -->
          <mat-sidenav-content class="main-content">
            <div class="request-response-container">
              <!-- Request Builder -->
              <app-request-builder
                [request]="currentRequest()"
                [isLoading]="isLoading()"
                (requestChange)="onRequestChange($event)"
                (sendRequestEvent)="onSendRequest($event)">
              </app-request-builder>

              <!-- Response Viewer -->
              <app-response-viewer
                [response]="response()"
                [isLoading]="isLoading()">
              </app-response-viewer>
            </div>
          </mat-sidenav-content>
        </mat-sidenav-container>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading()">
        <div class="loading-content">
          <mat-spinner diameter="40"></mat-spinner>
          <span class="loading-text">Sending request...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .api-tester-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      position: relative;
      z-index: 10;
    }

    .app-icon {
      margin-right: 8px;
    }

    .app-title {
      font-size: 20px;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .content-area {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .sidenav-container {
      width: 100%;
      height: 100%;
    }

    .sidebar {
      width: 320px;
      border-right: 1px solid #e0e0e0;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .request-response-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-content {
      background: white;
      padding: 24px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .loading-text {
      font-size: 16px;
      color: #666;
    }
  `]
})
export class ApiTesterComponent implements OnInit {
  currentRequest = signal<HttpRequest>({
    method: 'GET',
    url: '',
    headers: {},
    params: {},
    body: ''
  });

  response = signal<HttpResponse | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    // Component initialization logic here
  }

  onRequestChange(request: HttpRequest) {
    this.currentRequest.set(request);
  }

  onSendRequest(requestData: any) {
    this.isLoading.set(true);
    // Request sending logic will be handled by the request builder component
  }

  onResponse(response: HttpResponse) {
    this.response.set(response);
    this.isLoading.set(false);
  }

  onRequestError() {
    this.isLoading.set(false);
  }
}