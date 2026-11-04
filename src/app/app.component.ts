import { Component, inject } from '@angular/core';
import { RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
@Component({selector:'app-root',standalone:true,imports:[RouterLink,RouterLinkActive,RouterOutlet],template:`
<header class="topbar"><a class="brand" routerLink="/"><span class="mark">N</span><span>Norte<span class="brand-light"> & Co.</span><small>GESTIÓN EMPRESARIAL</small></span></a>
<nav><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a><a routerLink="/sucursales" routerLinkActive="active">Sucursales</a>@if(auth.user()){<a routerLink="/clientes" routerLinkActive="active">Clientes</a><a routerLink="/ventas" routerLinkActive="active">Ventas</a>}</nav>
<div class="account">@if(auth.user(); as u){<span class="user-name">{{u.nombre}} · {{u.rol}}</span><button class="button button-quiet" (click)="auth.logout().subscribe()">Salir</button>}@else{<a class="button button-dark" routerLink="/login">Ingresar</a>}</div></header>
<main><router-outlet /></main><footer>© 2026 Norte & Co. <span>Gestión clara para crecer mejor.</span></footer>`})
export class AppComponent {auth=inject(AuthService)}
