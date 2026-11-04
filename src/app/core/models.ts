export interface Cliente { id:number; nombre:string; apellido:string; documento:string; email:string; telefono:string; direccion:string; }
export interface Sucursal { id:number; nombre:string; direccion:string; empleados:number; }
export interface Venta { id:number; numero_factura:string; fecha:string; cliente_id:number; sucursal_id:number; cliente:string; sucursal:string; detalle:string; cantidad:number; precio_unitario:number; total:number; }
export interface SerieMensual { sucursal_id:number; sucursal:string; meses:number[]; total:number; }
export interface Usuario { id:number; nombre:string; rol:'admin'|'usuario'; }
