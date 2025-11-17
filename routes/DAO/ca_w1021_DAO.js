const misFunctions = require('../misFunctions.js');

function f_genera_field_sql(){    
    let tip_imp=" case when tip_imp ='A' then 'Afecto' else 'Otro' end as tip_imp ";
    let est_reg=" case when est_reg='I' then 'Activo' else 'Anulado' end as est_reg ";
    const column  = ['cod_art','des_art','und_vta','key_fam','pes_art','pre_vta', tip_imp, est_reg];

    const colname = ['cod_art','des_art','und_vta','key_fam','pes_art','pre_vta', 'tip_imp', 'est_reg'];      
    const headers = ['Código','Descripción','UND','Clasificacion','Pesable','Precio','Impuesto','Status']
    const headwid = [ '10%',         '24%',  '6%',           '8%',     '6%',    '8%',      '8%',   '20%']
    const colsus  = [   'c',           'l',   'c',            'l',      'c',     'r',       'c',     'c']
    const colpat  = [   "x",           "x",   "x",            "x",      "x",     "x",       "x",     "x"]

    const array_values= {column:column, array_header:{colname:colname, headers:headers, headwid:headwid, colsus :colsus, colpat :colpat}}
    return array_values;    
};

async function f_select_gGeneral( param_find){    
   try {     
          const array_gen= await f_genera_field_sql();  
          let colname =array_gen.column; 
          let t_table='dba.ct3a02';
          const param_arr=param_find.split('|');
          let param_busca=param_arr[5];  param_busca=param_busca.trim();
          let s_where='';
          if (isFinite(Number(param_busca))){
            s_where="cod_art =" + param_busca;
          } else {
            s_where="des_art like '%" + param_busca + "%'";
          }
        
          let s_sort='des_art';
          let s_sort_id='des_art';
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