const misFunctions = require('../misFunctions.js');

function f_genera_field_sql(){ 
    const fec_reg ="fec_reg::text || ' | ' || substring((hor_reg::text),1,5) as fec_reg ";
    const fec_cam =" to_char(fec_cam,'DD/MM/YYYY') as fec_cam ";    
    const column  = [fec_cam, 'val_ccp', 'val_cvp', 'val_ccb', 'val_cvb', fec_reg, 'use_nom'];

    const colname = ['fec_cam', 'val_ccp', 'val_cvp', 'val_ccb', 'val_cvb', 'fec_reg', 'use_nom'];      
    const headers = ['Fecha','Compra Sunat', 'Venta Sunat','Compra Paralelo','Venta Paralelo', 'Registro', 'Usuario']
    const headwid = [ '15%',          '12%',          '12%',             '12%',            '12%',       '13%',      '14%']
    const colsus  = [   'c',           'r',           'r',              'r',             'r',        'c',       'c']
    const colpat  = [   'd',          'n3',          'n3',             'n3',            'n3',        'x',       'x']

    const array_values= {column:column, array_header:{colname:colname, headers:headers, headwid:headwid, colsus :colsus, colpat :colpat}}
    return array_values;    
};

async function f_select_gGeneral( param_find){    
   try {     
          const array_gen= await f_genera_field_sql();  
          let colname =array_gen.column; 
          let t_table='dba.ct2a02a';
          const key_array=param_find.split('|');
          const param_anio=key_array[0];
          const param_mess=key_array[1];
          const key_dias  =  await misFunctions.f_First_LastDay(param_anio,  param_mess);
          const fec_001   = key_dias.DiaUno;
          const fec_002   = key_dias.DiaFin;

          let s_where=" sig_mon='US$' and fec_cam between '" + fec_001 + "' and '" + fec_002 + "'" ;                 
          let s_sort='fec_cam';
          let s_sort_id='fec_cam';
          let s_group=[];
          let id_btn=true;
          let id_row=true;
          let param_array={ t_table:t_table, column: colname, s_where:s_where, s_sort:s_sort, s_sort_id:s_sort_id, s_group:s_group, id_btn:id_btn, id_row:id_row}
   
          let sql_str = await misFunctions.f_genera_grilla_fixed( param_array);
          //  sql_str += ' limit 50';
          const respuesta = await db.query(sql_str);
          return (respuesta.rows);   
    } catch (error) {
       console.log( 'Error al consultar', error );
      return null; 
    }
};

async function f_get_detalle( param_find){    
   try {
          let colname =['*']; 
          let t_table='dba.ct3a02';
          param_find=param_find.trim();
          let s_where="cod_art =" + param_find;        
          let s_sort='';
          let s_sort_id='';
          let s_group=[];
          let id_btn=false;
          let id_row=false;
          let param_array={ t_table:t_table, column: colname, s_where:s_where, s_sort:s_sort, s_sort_id:s_sort_id, s_group:s_group, id_btn:id_btn, id_row:id_row}
   
          let sql_str = await misFunctions.f_genera_grilla_fixed( param_array);            
          const respuesta = await db.query(sql_str);
          const keyfam= respuesta.rows[0].key_fam;
          let desfam = await misFunctions.f_look_des( 'ct3a01_all', keyfam);                      
  //console.log(respuesta.rows, desfam);        
          const result_obj={rows_data: respuesta.rows, key_ref:desfam}
          //return (respuesta.rows);   
          return result_obj;   
    } catch (error) {
       console.log( 'Error al consultar', error );
      return null; 
    }
};

async function f_get_lastrow(){    
  try {
          let colname =['cod_art']; 
          let t_table='dba.ct3a02';
          let s_where="";        
          let param_array={ t_table:t_table, column: colname, s_where:s_where}
   
          let respuesta = await misFunctions.f_last_row( param_array);            
    //console.log('f_get_lastrow DAO',respuesta); 
          return (respuesta);   
      } catch (error) {
        console.log( 'Error al consultar', error );
        return 'Error al consultar'; 
      }
};

module.exports = {
  f_select_gGeneral, f_genera_field_sql, f_get_detalle, f_get_lastrow,
} 