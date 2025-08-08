import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpResponse } from '../../models/http-models';

@Component({
  selector: 'app-response-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="response-viewer">
      <div class="response-header" *ngIf="response">
        <div class="response-info">
          <h3 class="response-title">Response</h3>
          <div class="response-meta">
            <mat-chip-set>
              <mat-chip [ngClass]="getStatusClass(response.status)">
                {{ response.status }} {{ response.statusText }}
              </mat-chip>
              <mat-chip>Time: {{ response.time }}</mat-chip>
              <mat-chip>Size: {{ response.size }}</mat-chip>
            </mat-chip-set>
          </div>
        </div>
        <div class="response-actions">
          <button mat-button (click)="copyResponse()">
            <mat-icon>content_copy</mat-icon>
            Copy
          </button>
          <button mat-button>
            <mat-icon>save</mat-icon>
            Save
          </button>
        </div>
      </div>

      <div class="response-content" *ngIf="response && !isLoading; else loadingOrEmpty">
        <mat-tab-group class="response-tabs">
          <mat-tab label="Body">
            <div class="tab-content">
              <div class="view-mode-buttons">
                <button mat-button 
                        [class.active]="viewMode() === 'pretty'"
                        (click)="viewMode.set('pretty')">
                  Pretty
                </button>
                <button mat-button 
                        [class.active]="viewMode() === 'raw'"
                        (click)="viewMode.set('raw')">
                  Raw
                </button>
                <button mat-button 
                        [class.active]="viewMode() === 'preview'"
                        (click)="viewMode.set('preview')">
                  Preview
                </button>
              </div>
              
              <div class="response-body">
                <div *ngIf="viewMode() === 'pretty' && isJsonResponse()" class="json-viewer" [innerHTML]="getFormattedJson()">
                </div>
                <pre *ngIf="viewMode() === 'raw' || !isJsonResponse()" class="raw-viewer">{{ getResponseText() }}</pre>
                <div *ngIf="viewMode() === 'preview'" class="preview-viewer">
                  <p>Preview mode - showing formatted content</p>
                  <pre>{{ getResponseText() }}</pre>
                </div>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Headers">
            <div class="tab-content">
              <div class="headers-table">
                <div *ngFor="let header of getHeaderEntries()" class="header-row">
                  <div class="header-key">{{ header.key }}:</div>
                  <div class="header-value">{{ header.value }}</div>
                </div>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Test Results">
            <div class="tab-content">
              <div class="test-placeholder">
                <mat-icon>check_circle</mat-icon>
                <p>Test results will appear here</p>
                <p class="subtitle">Write tests to validate your API responses</p>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <ng-template #loadingOrEmpty>
        <div class="empty-state" *ngIf="!isLoading">
          <mat-icon>http</mat-icon>
          <h3>No Response</h3>
          <p>Send a request to see the response here</p>
        </div>
        
        <div class="loading-state" *ngIf="isLoading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Waiting for response...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .response-viewer {
      flex: 1;
      background: white;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .response-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .response-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
    }

    .response-meta mat-chip-set {
      display: flex;
      gap: 8px;
    }

    .response-actions {
      display: flex;
      gap: 8px;
    }

    .response-content {
      flex: 1;
      overflow: hidden;
    }

    .response-tabs {
      height: 100%;
    }

    .tab-content {
      padding: 16px;
      height: calc(100% - 48px);
      overflow: auto;
    }

    .view-mode-buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 8px;
    }

    .view-mode-buttons button.active {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .response-body {
      height: calc(100% - 60px);
      overflow: auto;
    }

    .json-viewer {
      font-family: 'Courier New', monospace;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      overflow-x: auto;
    }

    .raw-viewer {
      font-family: 'Courier New', monospace;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      overflow-x: auto;
      margin: 0;
    }

    .preview-viewer {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
    }

    .headers-table {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .header-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .header-key {
      width: 200px;
      font-weight: 500;
      color: #666;
    }

    .header-value {
      flex: 1;
      word-break: break-all;
    }

    .empty-state, .loading-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #666;
      text-align: center;
    }

    .empty-state mat-icon, .loading-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .loading-state {
      gap: 16px;
    }

    .test-placeholder {
      text-align: center;
      padding: 48px 16px;
      color: #666;
    }

    .test-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .subtitle {
      font-size: 14px;
      color: #999;
      margin: 8px 0 0 0;
    }

    /* Status chip styles */
    .status-success {
      background-color: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .status-error {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }

    .status-warning {
      background-color: #fff3e0 !important;
      color: #ef6c00 !important;
    }
  `]
})
export class ResponseViewerComponent {
  @Input() response: HttpResponse | null = null;
  @Input() isLoading = false;

  viewMode = signal<'pretty' | 'raw' | 'preview'>('pretty');

  constructor() {}

  getStatusClass(status: number): string {
    if (status >= 200 && status < 300) return 'status-success';
    if (status >= 400 && status < 500) return 'status-error';
    if (status >= 500) return 'status-error';
    return 'status-warning';
  }

  isJsonResponse(): boolean {
    if (!this.response) return false;
    return typeof this.response.body === 'object';
  }

  getResponseText(): string {
    if (!this.response) return '';
    return typeof this.response.body === 'string' 
      ? this.response.body 
      : JSON.stringify(this.response.body, null, 2);
  }

  getFormattedJson(): string {
    if (!this.response || !this.isJsonResponse()) return '';
    
    const jsonString = JSON.stringify(this.response.body, null, 2);
    
    // Simple syntax highlighting
    return jsonString
      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: (\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
      .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
      .replace(/: (null)/g, ': <span class="json-null">$1</span>');
  }

  getHeaderEntries(): { key: string; value: string }[] {
    if (!this.response) return [];
    return Object.entries(this.response.headers).map(([key, value]) => ({ key, value }));
  }

  async copyResponse() {
    if (!this.response) return;
    
    try {
      const text = this.getResponseText();
      await navigator.clipboard.writeText(text);
      console.log('Response copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard');
    }
  }
}