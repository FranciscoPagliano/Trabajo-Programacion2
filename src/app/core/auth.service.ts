import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { Usuario } from './models';

export const API = 'http://localhost/empresa-api/api';
export const credentialsInterceptor: HttpInterceptorFn = (req,next) => next(req.clone({withCredentials:true}));
@Injectable({providedIn:'root'})
export class AuthService {
  private http=inject(HttpClient); private router=inject(Router);
  user=signal<Usuario|null>(null); ready=signal(false);
  constructor(){ this.me().subscribe({next:u=>this.user.set(u),error:()=>this.user.set(null),complete:()=>this.ready.set(true)}); }
  me(){return this.http.get<Usuario>(`${API}/auth/me.php`).pipe(tap(u=>this.user.set(u)),catchError((e:HttpErrorResponse)=>{this.user.set(null);return throwError(()=>e);}));}
  login(email:string,password:string){return this.http.post<Usuario>(`${API}/auth/login.php`,{email,password}).pipe(tap(u=>this.user.set(u)));}
  logout(){return this.http.post(`${API}/auth/logout.php`,{}).pipe(tap(()=>{this.user.set(null);this.router.navigateByUrl('/');}));}
  isAdmin(){return this.user()?.rol==='admin';}
}
