import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginDto, RegisterDto } from './models/auth.model';
import { UserInfo } from './models/user.model';
import { jwtDecode } from 'jwt-decode'; // Added import

interface DecodedToken { // Define interface for decoded token
  role?: string; // Make role optional
  roles?: string | string[]; // Common claim for multiple roles
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[]; // Common Microsoft claim
  [key: string]: any; // Allow for other potential claims
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'jwt_token';
  private roleKey = 'user_role'; // Added roleKey
  private _isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());
  private _userRole = new BehaviorSubject<string | null>(this.getRoleFromToken()); // Modified to get role from token

  isAuthenticated$ = this._isAuthenticated.asObservable();
  userRole$ = this._userRole.asObservable(); // Expose user role as observable

  constructor(private http: HttpClient) { }

  login(credentials: LoginDto): Observable<{ token: string, role: string }> { // Updated response type
    return this.http.post<{ token: string, role: string }>(`${this.apiUrl}/api/Auth/login`, credentials).pipe( // Updated response type
      tap(response => {
        this.setToken(response.token);
        const decodedToken = jwtDecode<DecodedToken>(response.token); // Decode token
        const extractedRole = this.extractRoleFromDecodedToken(decodedToken); // Helper to extract role
        this.setRole(extractedRole || null); // Store role from token, or null if not found
        this._isAuthenticated.next(true);
        this._userRole.next(extractedRole || null); // Update role subject
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

  private setRole(role: string | null): void { // Added setRole
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

  getRole(): string | null { // Modified getRole
    return this.getRoleFromToken();
  }

  private getRoleFromToken(): string | null { // Added getRoleFromToken
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        console.log('AuthService: Decoded Token:', decodedToken);
        const role = this.extractRoleFromDecodedToken(decodedToken);
        console.log('AuthService: Extracted Role:', role);
        return role;
      } catch (Error) {
        console.error('AuthService: Error decoding token:', Error);
        return null;
      }
    }
    console.log('AuthService: No token found.');
    return null;
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey); // Also remove role on logout
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: string | string[]): boolean {
    const userRole = this.getRole();
    console.log('AuthService: Checking role. User Role:', userRole, 'Required Roles:', roles);
    if (!userRole) {
      return false;
    }
    if (typeof roles === 'string') {
      return userRole === roles;
    }
    return roles.includes(userRole);
  }
}