const misFunctions = require('../misFunctions.js');

function f_genera_field_sql(){    
    let key_com="(ano_com::text || '-' || lpad(mes_com::text,2,'0') || '-' || lpad(tip_com::text,2,'0') || '-' ||  lpad(nro_com::text,4,'0')) as key_com ";
    let fec_rec=" to_char(fec_rec,'DD/MM/YYYY') as fec_rec ";
    let des_ent="case when est_reg='A' then ' A   N   U   L   A   D   O' else (Select des_ent from dba.ct3a03 where dba.ct3a03.num_ruc=dba.eg1a01.num_ruc) end as des_ent ";
    let key_cpr=" (doc_cpr || '-' || ser_cpr || '-' || lpad(nro_cpr::text, case when length(nro_cpr::text) <8 then 8 else length(nro_cpr::text) end, '0') ) as key_cpr ";
    let tot_sol="case when est_reg='A' then 0 else case when tip_mon='S/.' then case when doc_cpr='C07' then tot_pag * (-1) else tot_pag end else 0 end end as tot_sol ";
    let tot_dol="case when est_reg='A' then 0 else case when tip_mon='S/.' then 0 else case when doc_cpr='C07' then tot_pag * (-1) else tot_pag end end end as tot_dol ";
    let key_cja="case when doc_chi <> 'SCA' then (doc_chi || '-' || lpad(ser_chi::text,3,'0') || '-' || lpad(nro_chi::text,8,'0')) else '' end as key_cja ";
    let val_doc="case when est_reg='A' then 0 else case when round((coalesce(imp_sol,0) + coalesce(tot_ser,0) + coalesce(imp_dol,0)),2) != case when doc_cpr in ('AFI','PRB','PRT','PAC','PAG') then round(( tot_pag * tip_cam ),2) else round(((coalesce(imp_pag,0) + coalesce(imp_ina,0)) * tip_cam),2) end then 1 else 0 end end as val_doc ";
    let est_reg="case when est_reg='A' then 'Anulado' else 'Activo' end as est_reg";

    let column=["num_ruc", key_com,  des_ent, key_cpr, tot_sol, tot_dol, key_cja, est_reg, val_doc];

    const colname = ["num_ruc","key_com",  "des_ent", "key_cpr", "tot_sol", "tot_dol", "key_cja", "est_reg", "val_doc"] 
    const headers = ['RUC','Registro Contable','Proveedor', 'Documento','Total S/.','Total US$', 'Referencia','Status','']        
    const headwid = ['0%',    '12%',    '30%',       '12%',          '8%',      '8%',   '12%', '6%', '2%']
    const colsus  = [ 'h',       'c',      'l',         'c',           'r',       'r',    'c',   'c',  'c']
    const colpat  = [  'x',       'x',      'x',         'x',          'n2',      'n2',    'x',   'x',  'x']

    const array_values= {column:column, array_header:{colname:colname, headers:headers, headwid:headwid, colsus :colsus, colpat :colpat}}
    return array_values;    
};

async function f_select_gGeneral( param_find){  
   try {
        const array_gen= await f_genera_field_sql();  
        let colname =array_gen.column;     
        let t_table='dba.eg1a01';
        const key_array=param_find.split('|');
        const param_anio=key_array[0];
        const param_mess=key_array[1];
        const serlca    =key_array[2];
        const tip_com   =  serlca.replace("V","");

        let s_where='';
        s_where +="ano_com =" + param_anio + " and mes_com=" + param_mess + " and tip_com=" + tip_com;
                
        let s_sort='nro_com';
        let s_sort_id='nro_com';
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
          let t_table='dba.eg1a01';
          const key_com_arra=param_find.split('-');
          let s_where="ano_com =" + key_com_arra[0] + " and mes_com=" + key_com_arra[1] + " and tip_com=" + key_com_arra[2] + " and nro_com=" + key_com_arra[3];        
console.log(s_where);          
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

async function f_doc_valida_DAO(param_mod, param_file, param_user) { 
 try { 
  const query = `SELECT (
      SELECT array_to_string(array[
         (Select w.ser_dox || '|' || cod_dox
          From (SELECT MAX(a.ser_doc) AS ser_dox, STRING_AGG(a.cod_doc, ',' ORDER BY a.cod_doc) AS cod_dox 
          FROM dba.ct2a03 a
          WHERE a.cod_doc IN ('V01', 'V80', 'V02', 'V05', 'V91')
            AND a.ser_doc=(SELECT MAX(b.ser_doc) FROM  dba.ct2a03 b WHERE b.cod_doc='V01')
           ) w) ,
           key_mod -> x.mod -> x.file_name ->> 0
          ], '|') as key_param 
      FROM dba._sy0a00 WHERE use_nom=x.user
     )
    FROM (SELECT $1::text AS mod, $2::text AS file_name, $3::text AS user) x`; 
    const valores=[param_mod, param_file, param_user]
    // Ejecutar la consulta a PostgreSQL)      
    const result = await db.query(query, valores);

    if (result.rowCount === 0) {
      throw { type: 'NO_RECORD',   message: 'No se encontró registros' };
    }
     const param_values=await result.rows[0].key_param;         
     const param_array=param_values.split('|');
     const doc_tem= await param_array[0].trim();
     const ser_tem= await param_array[1].split(',');
     const att_tem= await param_array[2].trim();    

     const key_des_tem = await Promise.all(
        ser_tem.map(async (item) => {                                 
          item=item.trim();                    
          let des_tem = await misFunctions.f_look_des('ct2a03', item + doc_tem);        
          return des_tem.map(clave => {
            const parts = clave.des_doc.split('|');
            return  {
                      key: item + '|' + doc_tem + '|' + parts[1],
                      value: 'Serie: ' + item + '|' + parts[0]
                    };
          });
        })
      );
    // Aplanar y convertir a objeto { key: value }
    const key_des_obj = key_des_tem
      .flat()                    // convierte [[{key,value}], [{key,value}]] → [{key,value}]
      .reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

    return {  ok: true,  message: `Registro consultado correctamente`,  data:key_des_obj };
  } catch (error) {
    const userMessage = error.type === 'NO_RECORD'? error : { message: 'Error interno del servidor' };
    return {  ok: false,   error: userMessage.message,
              details: process.env.NODE_ENV === 'development' ? error : undefined
      };  
  }
 
}    

module.exports = {
  f_select_gGeneral, f_genera_field_sql, f_get_detalle, f_doc_valida_DAO,
} 