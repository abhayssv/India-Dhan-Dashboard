import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  standalone: true,
  selector: 'app-global-loader',
  imports: [NgIf],
  styles: [`
    .loader-overlay {
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(1px);
    }
    .spinner {
      width: 56px; height: 56px; border-radius: 50%;
      border: 4px solid rgba(255,255,255,.35);
      border-top-color: white;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  template: `
    <div class="loader-overlay" *ngIf="svc.isLoading()">
      <div class="spinner"></div>
    </div>
  `,
})
export class GlobalLoaderComponent {
  svc = inject(LoaderService);
}
