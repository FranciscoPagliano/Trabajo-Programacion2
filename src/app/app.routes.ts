import { Routes } from '@angular/router';
import { authGuard } from './core/guards';
import { HomeComponent, LoginComponent } from './pages/pages.component';
import { ClientesComponent } from './pages/clientes.component';
import { SucursalesComponent } from './pages/sucursales.component';
import { VentasComponent } from './pages/ventas.component';
export const routes:Routes=[
 {path:'',component:HomeComponent},
 {path:'login',component:LoginComponent},
 {path:'clientes',component:ClientesComponent,canActivate:[authGuard]},
 {path:'sucursales',component:SucursalesComponent},
 {path:'ventas',component:VentasComponent,canActivate:[authGuard]},
 {path:'**',redirectTo:''}
];
