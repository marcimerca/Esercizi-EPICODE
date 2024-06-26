import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Register } from '../models/register.interface';
import { environment } from 'src/environments/environment.development';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthData } from '../models/auth-data.interface';
import { Router } from '@angular/router';
import { FavoriteService } from '../services/favorite.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiURL = environment.apiURL;

  private authSub = new BehaviorSubject<AuthData | null>(null);
  user$ = this.authSub.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private favSrv: FavoriteService
  ) {}

  register(data: Register) {
    return this.http
      .post(`${this.apiURL}register`, data)
      .pipe(catchError(this.errors));
  }

  login(data: { email: string; password: string }) {
    return this.http.post<AuthData>(`${this.apiURL}login`, data).pipe(
      tap((data) => {
        console.log('Auth data: ', data);
      }),
      tap((data) => {
        this.authSub.next(data);
        localStorage.setItem('user', JSON.stringify(data));
      }),
      catchError(this.errors)
    );
  }

  logout() {
    this.authSub.next(null);
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  restore() {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      return;
    }
    const user: AuthData = JSON.parse(userJson);
    this.authSub.next(user);
  }

  private errors(err: any) {
    console.log(err.error);
    switch (err.error) {
      case 'Email already exists':
        return throwError('The user already exists.');
        break;

      case 'Incorrect password':
        return throwError('Incorrect password');
        break;

      case 'Cannot find user':
        return throwError('User not found');
        break;

      default:
        return throwError('Request error');
        break;
    }
  }
}
