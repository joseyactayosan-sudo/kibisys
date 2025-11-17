const misFunctions = require('../misFunctions.js');

function f_genera_field_sql(){    
    let tip_imp=" case when tip_imp ='A' then 'Afecto' else 'Otro' end as tip_imp ";
    let est_reg=" case when est_reg='I' then 'Activo' else 'Anulado' end as est_reg ";

    let column = ['num_ruc','des_ent','tel_uno','mai_to','pag_web', tip_imp, est_reg];

    const colname = ['num_ruc','des_ent','tel_uno','mai_to','pag_web', 'tip_imp', 'est_reg'];      
    const headers = ['RUC','Razón Social','Teléfono','Correo','WEB','Impuesto','Status']
    const headwid = [ '8%',         '26%',  '12%',        '18%',   '10%',       '8%',   '8%']
    const colsus  = [   'c',           'l',   'c',          'l',    'l',        'c',     'c']
    const colpat  = [   "x",           "x",   "x",          "x",    "x",        "x",     "x"]

    const array_values= {column:column, array_header:{colname:colname, headers:headers, headwid:headwid, colsus :colsus, colpat :colpat}}
    return array_values;    
};

async function f_select_gGeneral( param_find){                 
   try {     
        const array_gen= await f_genera_field_sql();  
        let colname =array_gen.column; 
        let t_table='dba.ct3a03';
        const param_arr=param_find.split('|');
        let param_busca=param_arr[5];  param_busca=param_busca.trim();        
        let s_where='';
        if (isFinite(Number(param_busca))){
          s_where="num_ruc ='" + param_busca + "%'";
        } else {
          s_where="des_ent like '%" + param_busca + "%'";
        }
            
        let s_sort='des_ent';
        let s_sort_id='des_ent';
        let s_group=[];
        let id_btn=true;
        let id_row=true;
        let param_array={ t_table:t_table, column: colname, s_where:s_where, s_sort:s_sort, s_sort_id:s_sort_id, s_group:s_group, id_btn:id_btn, id_row:id_row}
      
        let sql_str = await misFunctions.f_genera_grilla_fixed( param_array);
          // sql_str += ' limit 50';
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
          let t_table='dba.ct3a03';
          param_find=param_find.trim();
          let s_where="num_ruc ='" + param_find +"'";        
          let s_sort='';
          let s_sort_id='';
          let s_group=[];
          let id_btn=false;
          let id_row=false;
          let param_array={ t_table:t_table, column: colname, s_where:s_where, s_sort:s_sort, s_sort_id:s_sort_id, s_group:s_group, id_btn:id_btn, id_row:id_row}
   
          let sql_str = await misFunctions.f_genera_grilla_fixed( param_array);            
          const respuesta = await db.query(sql_str);
          const keyfam= ''; //respuesta.rows[0].key_fam;
          let desfam = ''; //await misFunctions.f_look_des( 'ct3a01_all', keyfam);                      
  //console.log(respuesta.rows, desfam);        
          const result_obj={rows_data: respuesta.rows, key_ref:desfam}
          //return (respuesta.rows);   
          return result_obj;   
    } catch (error) {
       console.log( 'Error al consultar', error );
      return null; 
    }
};

module.exports = {
  f_select_gGeneral, f_genera_field_sql, f_get_detalle,
} 