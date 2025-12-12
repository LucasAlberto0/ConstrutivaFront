import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginDto, RegisterDto } from './models/auth.model';
import { UserInfo } from './models/user.model';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  role?: string;
  roles?: string | string[];
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
  sub?: string;
  nameid?: string;
  jti?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'jwt_token';
  private roleKey = 'user_role';
  private _isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());
  private _userRole = new BehaviorSubject<string | null>(this.getRoleFromToken());

  isAuthenticated$ = this._isAuthenticated.asObservable();
  userRole$ = this._userRole.asObservable();

  constructor(private http: HttpClient) { }

  login(credentials: LoginDto): Observable<{ token: string, role: string }> {
    return this.http.post<{ token: string, role: string }>(`${this.apiUrl}/api/Auth/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.token);
        const decodedToken = jwtDecode<DecodedToken>(response.token);
        const extractedRole = this.extractRoleFromDecodedToken(decodedToken);
        this.setRole(extractedRole || null);
        this._isAuthenticated.next(true);
        this._userRole.next(extractedRole || null);
      })
    );
  }

  register(userData: RegisterDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/Auth/register`, userData);
  }

  getMe(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.apiUrl}/api/Auth/me`);
  }

  uploadProfilePicture(file: File): Observable<{ message: string }> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return this.http.post<{ message: string }>(`${this.apiUrl}/api/users/me/profile-picture`, formData);
  }

  logout(): void {
    this.removeToken();
    this._isAuthenticated.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setRole(role: string | null): void {
    if (role) {
      localStorage.setItem(this.roleKey, role);
    } else {
      localStorage.removeItem(this.roleKey);
    }
  }

  private extractRoleFromDecodedToken(decodedToken: DecodedToken): string | null {
    let role: string | null = null;
    if (decodedToken.role && typeof decodedToken.role === 'string') {
      role = decodedToken.role;
    } else if (decodedToken.roles && typeof decodedToken.roles === 'string') {
      role = decodedToken.roles;
    } else if (decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] && typeof decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'string') {
      role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }
    return role;
  }

  getRole(): string | null {
    return this.getRoleFromToken();
  }

  private getRoleFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const role = this.extractRoleFromDecodedToken(decodedToken);
        return role;
      } catch (Error) {
        return null;
      }
    }
    return null;
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: string | string[]): boolean {
    const userRole = this.getRole();
    if (!userRole) {
      return false;
    }
    if (typeof roles === 'string') {
      return userRole === roles;
    }
    return roles.includes(userRole);
  }

  getUserIdFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken.sub) {
          return decodedToken.sub;
        } else {
          if (decodedToken.nameid) {
            return decodedToken.nameid;
          }
          if (decodedToken.jti) {
            return decodedToken.jti;
          }
          return null;
        }
      } catch (Error) {
        return null;
      }
    }
    return null;
  }
}