import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API } from './auth.service';
import { Cliente,Sucursal,Venta,SerieMensual } from './models';
@Injectable({providedIn:'root'})
export class DataService {
  private http=inject(HttpClient);
  clientes(){return this.http.get<Cliente[]>(`${API}/clientes/list.php`)}
  crearCliente(x:Partial<Cliente>){return this.http.post<Cliente>(`${API}/clientes/create.php`,x)}
  eliminarCliente(id:number){return this.http.delete<{ok:boolean}>(`${API}/clientes/delete.php?id=${id}`)}
  sucursales(){return this.http.get<Sucursal[]>(`${API}/sucursales/list.php`)}
  crearSucursal(x:Partial<Sucursal>){return this.http.post<Sucursal>(`${API}/sucursales/create.php`,x)}
  eliminarSucursal(id:number){return this.http.delete<{ok:boolean}>(`${API}/sucursales/delete.php?id=${id}`)}
  ventas(){return this.http.get<Venta[]>(`${API}/ventas/list.php`)}
  crearVenta(x:object){return this.http.post(`${API}/ventas/create.php`,x)}
  actualizarVenta(id:number,x:object){return this.http.post<{ok:boolean;id:number;numero_factura:string;total:number}>(`${API}/ventas/update.php?id=${id}`,x)}
  eliminarVenta(id:number){return this.http.delete<{ok:boolean;id:number;numero_factura:string}>(`${API}/ventas/delete.php?id=${id}`)}
  series(anio:number){return this.http.get<SerieMensual[]>(`${API}/sucursales/series.php?anio=${anio}`)}
}
