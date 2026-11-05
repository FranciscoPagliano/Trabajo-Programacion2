import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map, of } from 'rxjs';
import { Usuario } from './models';
const validCategory=(u:Usuario|null):boolean=>!!u&&Number.isInteger(u.categoria)&&u.categoria>=0&&u.categoria<=11;
const elevatedCategory=(u:Usuario|null):boolean=>!!u&&(u.categoria===10||u.categoria===11);
export const authGuard:CanActivateFn=()=>{const a=inject(AuthService);const r=inject(Router);if(a.user())return validCategory(a.user())?true:r.createUrlTree(['/login']);return a.me().pipe(map(u=>validCategory(u)?true:r.createUrlTree(['/login'])),catchError(()=>of(r.createUrlTree(['/login']))));};
export const adminGuard:CanActivateFn=()=>{const a=inject(AuthService);const r=inject(Router);if(a.user())return elevatedCategory(a.user())?true:r.createUrlTree(['/home']);return a.me().pipe(map(u=>elevatedCategory(u)?true:u?r.createUrlTree(['/home']):r.createUrlTree(['/login'])),catchError(()=>of(r.createUrlTree(['/login']))));};
export const guestGuard:CanActivateFn=()=>{const a=inject(AuthService);const r=inject(Router);if(a.user())return r.createUrlTree(['/home']);return a.me().pipe(map(()=>r.createUrlTree(['/home'])),catchError(()=>of(true)));};

