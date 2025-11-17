const misFunctions = require('../misFunctions.js');

function f_genera_field_sql(){    
    let key_ing="(doc_ing || '-' || ser_ing || '-' || lpad(nro_ing::text,8,'0')) as key_ing ";
    let fec_ing=" to_char(fec_ing,'DD/MM/YYYY') as fec_ing ";
    let des_ent="case when est_reg='A' then ' A   N   U   L   A   D   O' else (Select des_ent from dba.ct3a03 where dba.ct3a03.num_ruc=dba.mo1a01.num_ruc) end as des_ent ";
    let key_cpr=" (doc_cpr || '-' || ser_cpr || '-' || lpad(nro_cpr::text, case when length(nro_cpr::text) <8 then 8 else length(nro_cpr::text) end, '0') ) as key_cpr ";
    let est_reg="case when est_reg='A' then 'Anulado' else 'Activo' end as est_reg";

    let column=[ key_ing, fec_ing, "num_ruc", des_ent, key_cpr, est_reg];

    const colname = ["key_ing", "fec_ing", "num_ruc", "des_ent", "key_cpr", "est_reg"] 
    const headers = ['Documento', 'Fecha',  'RUC','Proveedor', 'Referencia','Status']        
    const headwid = [    '15%',   '10%',    '10%',      '30%',        '15%',   '10%']
    const colsus  = [      'c',     'c',      'c',        'l',          'c',     'c']
    const colpat  = [      'x',     'x',      'x',        'x',          'x',     'x']

    const array_values= {column:column, array_header:{colname:colname, headers:headers, headwid:headwid, colsus :colsus, colpat :colpat}}
    return array_values;    
};

async function f_select_gGeneral( param_find){    
   try {
        const array_gen= await f_genera_field_sql();  
        let colname =array_gen.column;     
        let t_table='dba.mo1a01';
        const key_array=param_find.split('|');
        const param_anio=key_array[0];
        const param_mess=key_array[1];
        const param_doc =key_array[2];
        const param_ser =key_array[3];
        const param_ugi =key_array[4];

        const doc_ing= param_doc;             
        const ser_ing= param_ser; //'T006';             
        const key_dias  =  await misFunctions.f_First_LastDay(param_anio,  param_mess);
        const fec_001   = key_dias.DiaUno;
        const fec_002   = key_dias.DiaFin;

        let s_where='';
        s_where +="doc_ing ='" + doc_ing + "' and ser_ing='" + ser_ing + "' and fec_ing between '" + fec_001 + "' and '" + fec_002 + "'";
                
        let s_sort='nro_ing';
        let s_sort_id='nro_ing';
        let s_group=[];
        let id_btn=true;
        let id_row=true;
        let param_array={ t_table:t_table, column: colname, s_where:s_where, s_sort:s_sort, s_sort_id:s_sort_id, s_group:s_group, id_btn:id_btn, id_row:id_row}
      
        let sql_str = await misFunctions.f_genera_grilla_fixed( param_array);
          // sql_str += ' limit 50';
        const respuesta = await db.query(sql_str);
        //console.log('Responder a sql',  respuesta.rows.length, 'filas');
        return (respuesta.rows);   
  } catch (error) {
     console.log( 'Error al consultar', error );
     return null; 
  }
};

async function f_get_detalle( param_find){    
   try {
          let colname =['*']; 
          let t_table='dba.mo1a01';
          const key_ing_arra=param_find.split('-');
          let s_where="doc_ing ='" + key_ing_arra[0] + "' and ser_ing='" + key_ing_arra[1] + "' and nro_ing=" + key_ing_arra[2];        
          
          let s_sort='';
          let s_sort_id='';
          let s_group=[];
          let id_btn=false;
          let id_row=false;
          let param_array={ t_table:t_table, column: colname, s_where:s_where, s_sort:s_sort, s_sort_id:s_sort_id, s_group:s_group, id_btn:id_btn, id_row:id_row}
   
          let sql_str = await misFunctions.f_genera_grilla_fixed( param_array);            
          const respuesta = await db.query(sql_str);
          const num_ruc= respuesta.rows[0].num_ruc;
          let des_ent = await misFunctions.f_look_des( 'ct3a03', num_ruc);                      
          const key_ent = num_ruc + ' | ' + (des_ent[0]).des_ent;
//console.log('f_get_detalle', num_ruc, (des_ent[0]).des_ent);        
          const result_obj={rows_data: respuesta.rows, key_ref:key_ent}  
          return result_obj;            
    } catch (error) {
       console.log( 'Error al consultar', error );
      return null; 
    }
};

function f_genera_field_list(key_detail){   
  
    let des_art="(Select des_art from dba.ct3a02 where dba.ct3a02.cod_art=dba.mo1a01a.cod_art) as des_art ";
    let btn_del="'' as btn_del ";
    //let column=['*']
    let column=['nro_ite','cod_art', des_art, 'can_tot','val_uni','imp_par','igv_par','imp_tot','por_igv','pre_sol','val_sol','can_pro','can_mer','can_aju','cla_det', btn_del]

    const colname = ['nro_ite','cod_art', 'des_art', 'can_tot','val_uni','imp_par','igv_par','imp_tot','por_igv','pre_sol','val_sol','can_pro','can_mer','can_aju','cla_det','btn_del'] 
    const headers = ['Id', 'Código',  'Descripción','Cantidad', 'Valor Unitario','Valor Compra','Importe IGV','Parcial','pre_sol','val_sol','can_pro','can_mer','can_aju','cla_det','...']        
    const headwid = ['3%',  '9%',  '37%',   '9%',  '9%',  '9%',  '9%',    '9%',  '0%',  '0%',  '0%',  '0%',  '0%',  '0%', '6%']
    const colsus  = [ 'c',    'c',    'l',   'r',   'r',   'r',   'r',     'r',   'h',   'h',   'h',   'h',   'h',   'h',  'c']
    const colpat  = [ 'x',    'x',    'x',   'n3',  'n6', 'n2',  'n2',    'n2',   'x',   'x',   'x',   'x',   'x',   'x',  'x']

    const filter_column=["doc_ing","ser_ing","nro_ing"]
    const sort_id =['nro_ite']
    const table_name='dba.mo1a01a'

    const array_values= {column:column, filter_column:filter_column, sort_id:sort_id, table_name:table_name, array_header:{colname:colname, headers:headers, headwid:headwid, colsus :colsus, colpat :colpat}}
    return array_values;    
};

async function f_get_render_list( param_find){    
   try {
          let colname =['*']; 
          let t_table='dba.mo1a01a';
          const key_ing_arra=param_find.split('-');
          let s_where="doc_ing ='" + key_ing_arra[0] + "' and ser_ing='" + key_ing_arra[1] + "' and nro_ing=" + key_ing_arra[2];        

          let s_sort='ite_det';
          let s_sort_id='';
          let s_group=[];
          let id_btn=false;
          let id_row=false;
          let param_array={ t_table:t_table, column: colname, s_where:s_where, s_sort:s_sort, s_sort_id:s_sort_id, s_group:s_group, id_btn:id_btn, id_row:id_row}
   
          let sql_str = await misFunctions.f_SELECT( param_array);            
console.log('f_get_render_list', s_where, sql_str);          
/*
          const respuesta = await db.query(sql_str);
          const keyfam= ''; //respuesta.rows[0].key_fam;
          let desfam = ''; //await misFunctions.f_look_des( 'ct3a01_all', keyfam);                      
  //console.log(respuesta.rows, desfam);        
          const result_obj={rows_data: respuesta.rows, key_ref:desfam}
          //return (respuesta.rows);   
          return result_obj;  
          */ 
    } catch (error) {
       console.log( 'Error al consultar', error );
      return null; 
    }
};

async function f_doc_valida_DAO(param_mod, param_file, user) {
 const param_serlca=await misFunctions.f_doc_validos(param_mod, param_file, user);
 return param_serlca;
}; 
module.exports = {
  f_select_gGeneral, f_genera_field_sql, 
  f_get_detalle, f_genera_field_list, f_doc_valida_DAO,
} 