import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { Usuario } from './models';

export const API = '/api';
export const credentialsInterceptor: HttpInterceptorFn = (req,next) => next(req.clone({withCredentials:true}));
@Injectable({providedIn:'root'})
export class AuthService {
  private http=inject(HttpClient); private router=inject(Router);
  user=signal<Usuario|null>(null); ready=signal(false);
  constructor(){ this.me().pipe(finalize(()=>this.ready.set(true))).subscribe({error:()=>this.user.set(null)}); }
  me(){return this.http.get<Usuario>(`${API}/auth/me.php`).pipe(tap(u=>this.user.set(u)),catchError((e:HttpErrorResponse)=>{this.user.set(null);return throwError(()=>e);}));}
  login(email:string,password:string){return this.http.post<Usuario>(`${API}/auth/login.php`,{email,password}).pipe(tap(u=>this.user.set(u)));}
  clearSession(){this.user.set(null);this.router.navigateByUrl('/login',{replaceUrl:true});}
  logout(){return this.http.post(`${API}/auth/logout.php`,{}).pipe(tap(()=>this.clearSession()));}
  isAdmin(){const categoria=this.user()?.categoria;return categoria===10||categoria===11;}
}
