import {
    Component,
    inject,
    signal,
    OnInit,
    HostListener,
    computed
  } from '@angular/core';
  import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
  import { AuthStore } from '../../core/state/auth.store';
  import { CommonModule } from '@angular/common';    
  
  @Component({
    selector: 'app-shell',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './shell.component.html',
  })
  export class ShellComponent implements OnInit {
    private router = inject(Router);
    auth = inject(AuthStore);
  
  
    currentYear!: number;
  
    // --- Mobile menu (Sneat side nav) ---
    menuOpen = signal(false);
    toggleMenu() { this.menuOpen.update(v => !v); }
    closeMenu() { this.menuOpen.set(false); }
  
    // --- Profile dropdown (pure Angular; no Bootstrap JS needed) ---
    userMenuOpen = signal(false);
    toggleUserMenu(ev: Event) {
      ev.preventDefault();
      ev.stopPropagation();
      this.userMenuOpen.update(v => !v);
    }
    closeUserMenu() { this.userMenuOpen.set(false); }
  
    // Close profile menu on any document click
    @HostListener('document:click')
    onDocumentClick() { this.closeUserMenu(); }

    // inside ShellComponent
    @HostListener('document:keydown.escape')
    onEsc() { this.closeMenu(); }
  
    // --- Submenu state (e.g., RBAC) ---
    sectionOpen = signal<Record<string, boolean>>({});
    toggleSection(key: string) {
      this.sectionOpen.update(s => ({ ...s, [key]: !s[key] }));
    }
    isSectionOpen(key: string) {
      // auto-open if current URL is inside the section
      if (key === 'rbac' && this.router.url.startsWith('/rbac')) return true;
      return !!this.sectionOpen()[key];
    }
  
    // Route helpers
    isActive = (path: string) => this.router.url.startsWith(path);
  
    ngOnInit(): void {
      console.log(22, this.auth.canStrict('nbfc.read'));
      this.currentYear = new Date().getFullYear();
    }

    // ✅ Confirm then logout
    async logout(e: Event) {
        e.preventDefault();
        this.closeUserMenu();

        const ok = window.confirm('Are you sure you want to log out?');
        if (!ok) return;

        await this.auth.logout(); // your store already shows a toast + routes to /login
    }

    getInitials(nameOrEmail: string) {
        if (!nameOrEmail) return '?';
        // Split full name; if it's an email, take chars before @ as one token
        const raw = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
        const parts = raw.trim().split(/\s+|[._-]+/); // split on spaces or common separators
        const first = parts[0]?.[0] ?? '';
        const second = parts[1]?.[0] ?? (parts[0]?.[1] ?? '');
        return (first + second).toUpperCase();
    }

    userInitials() {
        // If you also store full_name in user, prefer it; otherwise fallback to email
        const u = this.auth.user();
        const display = (u as any)?.full_name || u?.email || 'User';
        return this.getInitials(display);
    }

    displayName = computed(() => {
        const u = this.auth.user();
        if (!u) return '';
        const n = (u as any).full_name as string | null; // if you added full_name to user
        return (n && n.trim()) || u.email;
      });
  }
  