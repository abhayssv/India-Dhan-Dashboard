// src/app/core/services/loader.service.ts
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private _count = signal(0);                 // number of active HTTP calls
  readonly isLoading = computed(() => this._count() > 0);

  start() { this._count.update(n => n + 1); }
  stop()  { this._count.update(n => Math.max(0, n - 1)); }
  reset() { this._count.set(0); }
}
