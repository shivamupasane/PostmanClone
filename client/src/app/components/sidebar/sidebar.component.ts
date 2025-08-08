import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { Collection, RequestItem, HistoryItem } from '../../models/http-models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="sidebar-container">
      <!-- Tabs -->
      <mat-tab-group class="sidebar-tabs">
        <mat-tab label="Collections">
          <div class="tab-content">
            <div class="collections-header">
              <button mat-raised-button color="primary" (click)="openNewCollectionDialog()">
                <mat-icon>add</mat-icon>
                New Collection
              </button>
            </div>
            
            <mat-list class="collections-list">
              <div *ngFor="let collection of collections()" class="collection-item">
                <mat-list-item class="collection-header">
                  <mat-icon matListItemIcon>folder</mat-icon>
                  <div matListItemTitle>{{ collection.name }}</div>
                  <button mat-icon-button [matMenuTriggerFor]="collectionMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </mat-list-item>
                
                <div class="requests-list" *ngIf="getRequestsForCollection(collection.id).length > 0">
                  <mat-list-item 
                    *ngFor="let request of getRequestsForCollection(collection.id)"
                    class="request-item"
                    (click)="selectRequest(request)">
                    <div class="request-content">
                      <span class="method-badge" [ngClass]="'method-' + request.method.toLowerCase()">
                        {{ request.method === 'DELETE' ? 'DEL' : request.method }}
                      </span>
                      <span class="request-name">{{ request.name }}</span>
                    </div>
                  </mat-list-item>
                </div>
                
                <div class="no-requests" *ngIf="getRequestsForCollection(collection.id).length === 0">
                  <span class="no-requests-text">No requests yet</span>
                </div>
              </div>
              
              <div *ngIf="collections().length === 0" class="no-collections">
                <mat-icon>folder_open</mat-icon>
                <p>No collections yet</p>
                <p class="subtitle">Create a collection to organize your requests</p>
              </div>
            </mat-list>
          </div>
        </mat-tab>
        
        <mat-tab label="History">
          <div class="tab-content">
            <div class="history-header">
              <button mat-button color="warn" (click)="clearHistory()" *ngIf="history().length > 0">
                <mat-icon>clear_all</mat-icon>
                Clear History
              </button>
            </div>
            
            <mat-list class="history-list">
              <mat-list-item 
                *ngFor="let item of history()" 
                class="history-item"
                (click)="selectHistoryItem(item)">
                <div class="history-content">
                  <span class="method-badge" [ngClass]="'method-' + item.method.toLowerCase()">
                    {{ item.method === 'DELETE' ? 'DEL' : item.method }}
                  </span>
                  <div class="history-details">
                    <span class="history-url">{{ item.url }}</span>
                    <span class="history-time">{{ formatTime(item.createdAt) }}</span>
                  </div>
                </div>
              </mat-list-item>
              
              <div *ngIf="history().length === 0" class="no-history">
                <mat-icon>history</mat-icon>
                <p>No history yet</p>
                <p class="subtitle">Your request history will appear here</p>
              </div>
            </mat-list>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .sidebar-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #fafafa;
    }

    .sidebar-tabs {
      height: 100%;
    }

    .tab-content {
      padding: 16px;
      height: calc(100vh - 200px);
      overflow-y: auto;
    }

    .collections-header, .history-header {
      margin-bottom: 16px;
    }

    .collection-item {
      margin-bottom: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: white;
    }

    .collection-header {
      border-bottom: 1px solid #f0f0f0;
    }

    .requests-list {
      padding: 8px 0;
    }

    .request-item {
      cursor: pointer;
      padding: 8px 16px;
    }

    .request-item:hover {
      background-color: #f5f5f5;
    }

    .request-content {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .method-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      min-width: 48px;
      text-align: center;
    }

    .request-name {
      flex: 1;
      font-size: 14px;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .no-requests {
      padding: 16px;
      text-align: center;
    }

    .no-requests-text {
      font-size: 12px;
      color: #999;
    }

    .no-collections, .no-history {
      text-align: center;
      padding: 32px 16px;
      color: #666;
    }

    .no-collections mat-icon, .no-history mat-icon {
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

    .history-item {
      cursor: pointer;
      margin-bottom: 8px;
      padding: 12px;
      border-radius: 8px;
      background: white;
      border: 1px solid #e0e0e0;
    }

    .history-item:hover {
      background-color: #f5f5f5;
    }

    .history-content {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .history-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .history-url {
      font-size: 14px;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .history-time {
      font-size: 12px;
      color: #999;
    }
  `]
})
export class SidebarComponent implements OnInit {
  collections = signal<Collection[]>([]);
  requests = signal<RequestItem[]>([]);
  history = signal<HistoryItem[]>([]);

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCollections();
    this.loadHistory();
  }

  loadCollections() {
    this.apiService.getCollections().subscribe({
      next: (collections) => {
        this.collections.set(collections);
        // Load requests for each collection
        collections.forEach(collection => {
          this.apiService.getRequestsByCollection(collection.id).subscribe({
            next: (requests) => {
              this.requests.update(current => [
                ...current.filter(r => r.collectionId !== collection.id),
                ...requests
              ]);
            }
          });
        });
      },
      error: (error) => {
        this.snackBar.open('Failed to load collections', 'Close', { duration: 3000 });
      }
    });
  }

  loadHistory() {
    this.apiService.getHistory().subscribe({
      next: (history) => {
        this.history.set(history);
      },
      error: (error) => {
        this.snackBar.open('Failed to load history', 'Close', { duration: 3000 });
      }
    });
  }

  getRequestsForCollection(collectionId: string): RequestItem[] {
    return this.requests().filter(r => r.collectionId === collectionId);
  }

  selectRequest(request: RequestItem) {
    // Emit request selection event
    console.log('Selected request:', request);
  }

  selectHistoryItem(item: HistoryItem) {
    // Emit history item selection event
    console.log('Selected history item:', item);
  }

  openNewCollectionDialog() {
    // Dialog logic would go here
    const name = prompt('Collection name:');
    if (name) {
      this.apiService.createCollection({ name, description: '' }).subscribe({
        next: () => {
          this.loadCollections();
          this.snackBar.open('Collection created', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Failed to create collection', 'Close', { duration: 3000 });
        }
      });
    }
  }

  clearHistory() {
    this.apiService.clearHistory().subscribe({
      next: () => {
        this.history.set([]);
        this.snackBar.open('History cleared', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to clear history', 'Close', { duration: 3000 });
      }
    });
  }

  formatTime(date?: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleTimeString();
  }
}