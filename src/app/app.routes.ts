import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards';
import { HomeComponent, LoginComponent } from './pages/pages.component';
import { ClientesComponent } from './pages/clientes.component';
import { SucursalesComponent } from './pages/sucursales.component';
import { VentasComponent } from './pages/ventas.component';
export const routes:Routes=[
 {path:'',pathMatch:'full',redirectTo:'login'},
 {path:'login',component:LoginComponent,canActivate:[guestGuard]},
 {path:'home',component:HomeComponent,canActivate:[authGuard]},
 {path:'clientes/nuevo',component:ClientesComponent,canActivate:[adminGuard]},
 {path:'clientes',component:ClientesComponent,canActivate:[authGuard]},
 {path:'sucursales/nueva',component:SucursalesComponent,canActivate:[adminGuard]},
 {path:'sucursales',component:SucursalesComponent,canActivate:[authGuard]},
 {path:'ventas/nueva',component:VentasComponent,canActivate:[adminGuard]},
 {path:'ventas',component:VentasComponent,canActivate:[authGuard]},
 {path:'**',redirectTo:'login'}
];
