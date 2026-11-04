import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map, of } from 'rxjs';
export const authGuard:CanActivateFn=()=>{const a=inject(AuthService);const r=inject(Router);if(a.user())return true;return a.me().pipe(map(()=>true),catchError(()=>of(r.createUrlTree(['/login']))));};
export const adminGuard:CanActivateFn=()=>{const a=inject(AuthService);const r=inject(Router);return a.isAdmin()?true:r.createUrlTree(['/']);};
