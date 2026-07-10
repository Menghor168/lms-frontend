import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthResponse, User } from '../models/models';

const TOKEN_KEY = 'lms_token';
const USER_KEY  = 'lms_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser    = signal<User | null>(this.readUser());
  isLoggedIn     = computed(() => !!this.currentUser());
  isStaffOrAdmin = computed(() => ['Admin','Staff'].includes(this.currentUser()?.role_type ?? ''));
  isAdmin        = computed(() => this.currentUser()?.role_type === 'Admin');
  isMember       = computed(() => this.currentUser()?.role_type === 'Member');

  constructor(private api: ApiService, private router: Router) {}

  private readUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  get token(): string | null { return localStorage.getItem(TOKEN_KEY); }

  login(username: string, password: string) {
    return this.api.post<AuthResponse>('/auth/login', { username, password });
  }

  register(payload: { username: string; password: string; email: string; full_name: string; phone?: string }) {
    return this.api.post<AuthResponse>('/auth/register', payload);
  }

  setSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  redirectAfterLogin() {
    const role = this.currentUser()?.role_type;
    if (role === 'Admin' || role === 'Staff') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/member']);
    }
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
