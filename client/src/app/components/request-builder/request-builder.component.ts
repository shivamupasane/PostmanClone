import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import type { HttpRequest, HttpResponse, ParamRow, HeaderRow } from '../../models/http-models';

@Component({
  selector: 'app-request-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
    MatSnackBarModule
  ],
  template: `
    <div class="request-builder">
      <!-- URL Bar -->
      <div class="url-bar">
        <mat-form-field appearance="outline" class="method-select">
          <mat-select [(value)]="currentRequest().method" (selectionChange)="onMethodChange($event.value)">
            <mat-option value="GET">GET</mat-option>
            <mat-option value="POST">POST</mat-option>
            <mat-option value="PUT">PUT</mat-option>
            <mat-option value="DELETE">DELETE</mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="url-input">
          <input matInput placeholder="Enter request URL" 
                 [(ngModel)]="currentRequest().url"
                 (ngModelChange)="onUrlChange($event)">
        </mat-form-field>
        
        <button mat-raised-button color="primary" 
                [disabled]="isLoading || !currentRequest().url"
                (click)="sendRequest()"
                class="send-button">
          {{ isLoading ? 'Sending...' : 'Send' }}
        </button>
      </div>

      <!-- Tabs -->
      <mat-tab-group class="request-tabs">
        <mat-tab label="Params">
          <div class="tab-content">
            <div class="params-table">
              <div class="table-header">
                <div class="header-cell">Enabled</div>
                <div class="header-cell">Key</div>
                <div class="header-cell">Value</div>
                <div class="header-cell">Description</div>
                <div class="header-cell">Actions</div>
              </div>
              
              <div *ngFor="let param of params(); let i = index" class="table-row">
                <div class="cell">
                  <mat-checkbox [(ngModel)]="param.enabled" (change)="updateParam(i, 'enabled', $event.checked)">
                  </mat-checkbox>
                </div>
                <div class="cell">
                  <mat-form-field appearance="outline">
                    <input matInput placeholder="Key" 
                           [(ngModel)]="param.key"
                           (ngModelChange)="updateParam(i, 'key', $event)">
                  </mat-form-field>
                </div>
                <div class="cell">
                  <mat-form-field appearance="outline">
                    <input matInput placeholder="Value" 
                           [(ngModel)]="param.value"
                           (ngModelChange)="updateParam(i, 'value', $event)">
                  </mat-form-field>
                </div>
                <div class="cell">
                  <mat-form-field appearance="outline">
                    <input matInput placeholder="Description" 
                           [(ngModel)]="param.description"
                           (ngModelChange)="updateParam(i, 'description', $event)">
                  </mat-form-field>
                </div>
                <div class="cell">
                  <button mat-icon-button color="warn" (click)="removeParam(i)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
              
              <button mat-button color="primary" (click)="addParam()" class="add-button">
                <mat-icon>add</mat-icon>
                Add Parameter
              </button>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Headers">
          <div class="tab-content">
            <div class="headers-table">
              <div class="table-header">
                <div class="header-cell">Enabled</div>
                <div class="header-cell">Key</div>
                <div class="header-cell">Value</div>
                <div class="header-cell">Description</div>
                <div class="header-cell">Actions</div>
              </div>
              
              <div *ngFor="let header of headers(); let i = index" class="table-row">
                <div class="cell">
                  <mat-checkbox [(ngModel)]="header.enabled" (change)="updateHeader(i, 'enabled', $event.checked)">
                  </mat-checkbox>
                </div>
                <div class="cell">
                  <mat-form-field appearance="outline">
                    <input matInput placeholder="Key" 
                           [(ngModel)]="header.key"
                           (ngModelChange)="updateHeader(i, 'key', $event)">
                  </mat-form-field>
                </div>
                <div class="cell">
                  <mat-form-field appearance="outline">
                    <input matInput placeholder="Value" 
                           [(ngModel)]="header.value"
                           (ngModelChange)="updateHeader(i, 'value', $event)">
                  </mat-form-field>
                </div>
                <div class="cell">
                  <mat-form-field appearance="outline">
                    <input matInput placeholder="Description" 
                           [(ngModel)]="header.description"
                           (ngModelChange)="updateHeader(i, 'description', $event)">
                  </mat-form-field>
                </div>
                <div class="cell">
                  <button mat-icon-button color="warn" (click)="removeHeader(i)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
              
              <button mat-button color="primary" (click)="addHeader()" class="add-button">
                <mat-icon>add</mat-icon>
                Add Header
              </button>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Body">
          <div class="tab-content">
            <mat-form-field appearance="outline" class="body-field">
              <textarea matInput placeholder="Request body (JSON)" 
                        rows="15"
                        [(ngModel)]="currentRequest().body"
                        (ngModelChange)="onBodyChange($event)">
              </textarea>
            </mat-form-field>
          </div>
        </mat-tab>

        <mat-tab label="Auth">
          <div class="tab-content">
            <div class="auth-placeholder">
              <mat-icon>lock</mat-icon>
              <p>Authentication options coming soon</p>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .request-builder {
      background: white;
      border-bottom: 1px solid #e0e0e0;
    }

    .url-bar {
      display: flex;
      gap: 12px;
      padding: 16px;
      align-items: center;
      border-bottom: 1px solid #f0f0f0;
    }

    .method-select {
      width: 120px;
    }

    .url-input {
      flex: 1;
    }

    .send-button {
      height: 56px;
      padding: 0 24px;
    }

    .request-tabs {
      min-height: 400px;
    }

    .tab-content {
      padding: 16px;
    }

    .params-table, .headers-table {
      width: 100%;
    }

    .table-header {
      display: grid;
      grid-template-columns: 80px 1fr 1fr 1fr 80px;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
      font-weight: 500;
      color: #666;
    }

    .table-row {
      display: grid;
      grid-template-columns: 80px 1fr 1fr 1fr 80px;
      gap: 12px;
      padding: 8px 0;
      align-items: center;
    }

    .header-cell {
      font-size: 12px;
      text-transform: uppercase;
    }

    .cell {
      display: flex;
      align-items: center;
    }

    .cell mat-form-field {
      width: 100%;
    }

    .add-button {
      margin-top: 16px;
    }

    .body-field {
      width: 100%;
    }

    .body-field textarea {
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }

    .auth-placeholder {
      text-align: center;
      padding: 48px 16px;
      color: #666;
    }

    .auth-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
  `]
})
export class RequestBuilderComponent implements OnInit {
  @Input() request!: HttpRequest;
  @Input() isLoading = false;
  @Output() requestChange = new EventEmitter<HttpRequest>();
  @Output() sendRequestEvent = new EventEmitter<any>();

  params = signal<ParamRow[]>([
    { id: '1', enabled: true, key: '', value: '', description: '' }
  ]);

  headers = signal<HeaderRow[]>([
    { id: '1', enabled: true, key: '', value: '', description: '' }
  ]);

  constructor() {}

  ngOnInit() {
    // Initialize with the input request
  }

  currentRequest = signal<HttpRequest>({
    method: 'GET',
    url: '',
    headers: {},
    params: {},
    body: ''
  });

  onMethodChange(method: string) {
    const updated = { ...this.currentRequest(), method: method as any };
    this.currentRequest.set(updated);
    this.requestChange.emit(updated);
  }

  onUrlChange(url: string) {
    const updated = { ...this.currentRequest(), url };
    this.currentRequest.set(updated);
    this.requestChange.emit(updated);
  }

  onBodyChange(body: string) {
    const updated = { ...this.currentRequest(), body };
    this.currentRequest.set(updated);
    this.requestChange.emit(updated);
  }

  // Params methods
  addParam() {
    this.params.update(current => [
      ...current,
      { id: Date.now().toString(), enabled: true, key: '', value: '', description: '' }
    ]);
  }

  updateParam(index: number, field: keyof ParamRow, value: any) {
    this.params.update(current => {
      const updated = [...current];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  removeParam(index: number) {
    this.params.update(current => current.filter((_, i) => i !== index));
  }

  // Headers methods
  addHeader() {
    this.headers.update(current => [
      ...current,
      { id: Date.now().toString(), enabled: true, key: '', value: '', description: '' }
    ]);
  }

  updateHeader(index: number, field: keyof HeaderRow, value: any) {
    this.headers.update(current => {
      const updated = [...current];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  removeHeader(index: number) {
    this.headers.update(current => current.filter((_, i) => i !== index));
  }

  sendRequest() {
    const enabledParams = this.params()
      .filter(p => p.enabled && p.key && p.value)
      .reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {});

    const enabledHeaders = this.headers()
      .filter(h => h.enabled && h.key && h.value)
      .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

    let finalUrl = this.currentRequest().url;
    const paramString = new URLSearchParams(enabledParams).toString();
    if (paramString) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + paramString;
    }

    const requestData = {
      method: this.currentRequest().method,
      url: finalUrl,
      headers: enabledHeaders,
      body: this.currentRequest().body && this.currentRequest().method !== 'GET' 
        ? JSON.parse(this.currentRequest().body || '{}') 
        : undefined
    };

    // For now, simulate API call with fetch
    fetch(requestData.url)
      .then(response => response.json())
      .then(data => {
        const mockResponse = {
          status: 200,
          statusText: 'OK',
          headers: {'Content-Type': 'application/json'},
          body: data,
          time: '245ms',
          size: '1.2kb'
        };
        this.sendRequestEvent.emit(mockResponse);
        console.log('Request sent successfully');
      })
      .catch(error => {
        console.error('Request failed:', error.message);
      });
  }
}