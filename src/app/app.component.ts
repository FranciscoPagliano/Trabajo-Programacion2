import { Component, inject } from '@angular/core';
import { RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
@Component({selector:'app-root',standalone:true,imports:[RouterLink,RouterLinkActive,RouterOutlet],template:`
@if(auth.user()){<header class="topbar"><a class="brand" routerLink="/home"><span class="mark">N</span><span>Norte<span class="brand-light"> & Co.</span><small>GESTIÓN EMPRESARIAL</small></span></a>
<nav><a routerLink="/home" routerLinkActive="active">Home</a><a routerLink="/clientes" routerLinkActive="active">Clientes</a><a routerLink="/sucursales" routerLinkActive="active">Sucursales</a><a routerLink="/ventas" routerLinkActive="active">Ventas</a>@if(auth.isAdmin()){<details class="nav-admin-menu"><summary>Administración</summary><div class="nav-admin-popover"><a routerLink="/clientes/nuevo">Crear cliente</a><a routerLink="/sucursales/nueva">Crear sucursal</a><a routerLink="/ventas/nueva">Cargar factura</a></div></details>}</nav>
<div class="account">@if(auth.user(); as u){<span class="user-name">{{u.nombre}} · Categoría {{u.categoria}}</span><button class="button button-quiet" (click)="salir()">Salir</button>}</div></header>}<main><router-outlet /></main>@if(auth.user()){<footer>© 2026 Norte & Co. <span>Gestión clara para crecer mejor.</span></footer>}`})
export class AppComponent {auth=inject(AuthService);salir(){this.auth.logout().subscribe({error:()=>this.auth.clearSession()});}}
