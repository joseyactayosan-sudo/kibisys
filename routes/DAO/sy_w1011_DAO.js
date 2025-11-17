const misFunctions = require('../misFunctions.js');

function f_genera_field_sql(){
    let ult_fec=" to_char(ultdate,'DD/MM/YYYY') as ult_fec";    
    let blo_cke=" case when blocked='0' then '' else 'Blockeado' end as blo_cke ";    
    let column = ['use_nom', 'phone', 'email', ult_fec, 'lastvisitdate', blo_cke];

    const colname = ['use_nom', 'phone', 'email', 'ult_fec', 'lastvisitdate', 'blo_cke'];      
    const headers = ['Usuario','Teléfono','Correo','Ultimo Ingreso','Hora','Status']
    const headwid = [ '12%',         '14%',  '26%',        '16%',   '12%',    '10%']
    const colsus  = [   'c',           'c',   'l',          'c',    'c',        'c']
    const colpat  = [   "x",           "x",   "x",          "x",    "x",        "x"]

    const array_values= {column:column, array_header:{colname:colname, headers:headers, headwid:headwid, colsus :colsus, colpat :colpat}}
    return array_values;    
};

async function f_select_gGeneral(){                 
   try {      
        const array_gen= await f_genera_field_sql();  
        let colname =array_gen.column; 
        let t_table='dba._sy0a00';        
        let s_where='';
            
        let s_sort="case when use_nom like  '%owner%'  or use_nom like  '%admin%'  then '1' else '2' end , use_nom";
        let s_sort_id=s_sort;
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
          let t_table='dba._sy0a00';
          param_find=param_find.trim();
          let s_where="use_nom ='" + param_find +"'";        
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

async function f_doc_selected() {
 try {
    const query =`Select '' as cod_doc, 'Seleccione' as des_doc
                  union all
                  Select 'V01' as cod_doc, 'Registro de Provisiones' as des_doc
                  union all
                  Select  cod_doc, max(des_doc) as des_doc
                  From dba.ct2a03
                  Where est_reg != 'A' and substring(cod_doc,1,1) != 'C' Group by cod_doc 
                  Order by cod_doc`; 
    const result = await db.query(query);
    return (result.rows);   
  } catch (error) {
     console.log( 'Error al consultar', error );
     return null; 
  }
}
module.exports = {
  f_select_gGeneral, f_genera_field_sql, f_get_detalle, f_doc_selected,
} 