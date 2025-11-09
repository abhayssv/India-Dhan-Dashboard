// src/app/shared/pages/access-denied.component.ts
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-access-denied',
  template: `
    <div class="container py-5 text-center">
      <h3 class="mb-2">Access denied</h3>
      <p class="text-muted">You don’t have permission to view this page.</p>
    </div>
  `
})
export class AccessDeniedComponent {}
