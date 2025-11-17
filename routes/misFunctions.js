async function get_variables(user){
  let ModuleLink = [];
  let tree_file=null;
  if (user=='admin') {
    ModuleLink = ['CA','EG', 'GA', 'AL', 'IN', 'PH'];
  } else {
    //get tabla de user
    const valores=[user]
    const query = `SELECT DISTINCT jsonb_object_keys(a.key_mod) AS key_0 
                   FROM dba._sy0a00 a WHERE a.use_nom = $1 order by 1`;
    const result = await db.query(query, valores);    
    const key_module= await result.rows;
    ModuleLink = key_module.map(item => item.key_0);

    const query2 = `SELECT array_agg(DISTINCT segunda_clave) as key_1
                    FROM (
                      SELECT jsonb_object_keys(value) AS segunda_clave
                      FROM dba._sy0a00 t,
                      LATERAL jsonb_each(key_mod)
                      WHERE t.use_nom = $1
                    ) sub`;
    const result1 = await db.query(query2, valores);    
    tree_file= await result1.rows;                  
  }
  
  const ModuleList_all = {'CA':'Inicio', 'CO':'Compras', 'EG':'Cuentas por Pagar', 'GA':'Pagos', 'AL':'Almacenes','FA':'Ventas', 'IN':'Cobranza', 'BA':'Bancos', 'PH':'Personal', 'CN':'Contabilidad', 'GE':'Gestión' };
  let ModuleList={};
     ModuleLink.forEach(function(colIndex) {
          ModuleList[colIndex]=ModuleList_all[colIndex];
      });

let tree_modite={};
 ModuleLink.forEach(function(colIndex) {
//1. INICIO
    item_mod='CA';
    if (item_mod==colIndex) {
        tree_modite[colIndex]=[{file_name:'ca_w1011',des_name:'Registro de Empresa'},
                               {file_name:'ca_w1012',des_name:'Unidades de Gestión'},                               
                               {file_name:'ca_w1015',des_name:'Tipo de Impuesto'},
                               {file_name:'ca_w1016',des_name:'Tipo de Cámbio'},
                               {file_name:'ca_w1017',des_name:'Correlativo de Documentos'},
                               {file_name:'ca_w1019',des_name:'Clasifica Artículos y Servicios'},
                               {file_name:'ca_w1021',des_name:'Artículos y Servicios'},
                               {file_name:'ca_w1020',des_name:'Entidades Públicas y Privadas'}
                              ]

    }
//3. CUENTAS POR PAGAR
    item_mod='EG';
    if (item_mod==colIndex) {
        tree_modite[colIndex]=[{file_name:'eg_w1011',des_name:'Registro de Provisiones'},
                               {file_name:'eg_w1013',des_name:'Liquidación de Caja Chica'}
                              ]

    }
//4. ALMACENES
    item_mod='AL';
    if (item_mod==colIndex) {
        tree_modite[colIndex]=[{file_name:'al_w1011',des_name:'Registro de Inventario'},
                               {file_name:'al_w1012',des_name:'Guías de Recepción'},
                               {file_name:'al_w1013',des_name:'Guías de Ingreso'},
                               {file_name:'al_w1014',des_name:'Guías de Remisión'},
                               {file_name:'al_w1015',des_name:'Guías de Salida'}
                              ]

    }    
 });

 if (user !='admin'){
    const tree_user=tree_file[0].key_1;
    const result = {};
    for (const key in tree_modite) {
      if (tree_modite.hasOwnProperty(key)) {
        result[key] = tree_modite[key].filter(item => tree_user.includes(item.file_name));
      }
    }
    tree_modite=result;   
 }

 return {ModuleLink , ModuleList, tree_modite}
}

function f_genera_grilla_fixed( param_array){

  //  datatable, t_table, s_where, key_pk, s_sort, co_nome, column, headersx, headwidx, 
  //colsusx, colpatx, hidecol, id_row, id_btn, s_sort_id, s_group

t_table =param_array.t_table;
column =param_array.column;
s_where =param_array.s_where;
s_group =param_array.s_group;
id_row =param_array.id_row;
id_btn =param_array.id_btn;
s_sort =param_array.s_sort;
s_sort_id =param_array.s_sort_id;
/*    if ( count($co_nome)>0 &&  count($co_nome)==count($column) &&  count($co_nome)==count($headersx) &&   count($co_nome)==count($headwidx) &&
                               count($co_nome)==count($colsusx) &&  count($co_nome)==count($colpatx) && strlen($s_sort)>0 ){
                                
  */ 
str_campos =column.join();      
str_campos +=(id_btn)? ", ' ' as id_btn " : "";
id_ite=(id_row)? " ROW_NUMBER() OVER (ORDER BY " + s_sort_id + ") AS id_ite, " : "";
where_all= (s_where.length==0)? '' : " Where " + s_where;
group_all= (s_group.length==0)? '' : " Group By " + s_group.join();
ordel_all= (s_sort.length==0)?  '' : " Order By " + s_sort;

sql="Select " +  id_ite + " " + str_campos + " From " + t_table  + where_all  + group_all + ordel_all;
//console.log(sql);
return sql;

    /*
      } else {
       $TableRender= 'Error >>> los vectores filtro difieren, consulte al administrador del sistema';
       return $TableRender ;
     }
     */
}

//SELECT
async function f_SELECT(param_array) {  
  try {
      const { filter_value , field_value, table_name, sort_id} = param_array; 

      const key_where = Object.keys(filter_value); 
      let  field_name = field_value; 

      if (field_name.length === 0 || key_where.length === 0  || table_name.length === 0 ) {
         throw { type: 'NO_RECORD',   message: 'No se enviaron datos para actualizar' };
      }          

      //todos los campos de la tabla         
      let array_field=await getTableFields(table_name);
       const sinAlias = field_name.filter(campo => !campo.includes(" as "));

      // verifica si se ha precisado los campos a mostrar
      if (field_value[0] !='*'){      
        const array_find=sinAlias.concat(key_where); 
        const notFound = array_find.filter(item => !array_field.some(field => field.col_name === item));
  // console.log('notFound f_select',field_name, key_where, key_values, array_field, notFound );  
        if (notFound.length > 0) {
          throw { message: notFound.join(',') , code:42703 };
        }
      }

      const valores = [];
      const setClauses = [];
      Object.entries(field_name).forEach(([clave, valor], index) => {         
          setClauses.push(`${valor}`); 
      });

      // genera string para where
      const value_where = [];
      let setClauses_where = '';
      let sw_x=valores.length;   
      const conditions = [];
      Object.entries(filter_value).forEach(([clave, valor]) => {
        conditions.push(`${clave} = $${sw_x + 1}`);
        valores.push(valor);
        sw_x++;
      });
      setClauses_where = conditions.join(' and ');
      const query = `SELECT ${setClauses.join(', ')}  from ${table_name}  WHERE ${setClauses_where} Order by ${sort_id}`; 
    // Ejecutar la consulta a PostgreSQL)
    const result = await db.query(query, valores);
    ////result.rowCount = 0;  // prueba error
    if (result.rowCount === 0) {
      throw { type: 'NO_RECORD',   message: 'No se encontró el registro a actualizar' };
    }
    //console.log('exito');
    return {  ok: true,  message: `Registro consultado correctamente`,  data:result.rows, rowCount: result.rowCount };
    
  } catch (error) {
      // Manejar errores específicos de PostgreSQL
      let userMessage ={};
          userMessage.message = 'Error al efectuar la consulta';
      if (error.code) {  
          userMessage = handleDBError(error);
          //console.log ('x f_select', error.code, userMessage);
      } else if (error.type === 'NO_RECORD') {
        userMessage.message = error.message;
      }
     
    return { ok: false, error: userMessage.message,   details: process.env.NODE_ENV === 'development' ? error : undefined };    
  }
}

//UPDATE
async function f_UPD(param_array) {
  try {
// console.log('upd ini ',param_array);    
      //param_array.field_value={}   // para prueba
      //validaciones
      const { filter_value , field_value, table_name} = param_array; 
      
      const key_where = Object.keys(filter_value); 
      const key_values= Object.values(filter_value);   
      const field_name= Object.keys(field_value); 
      if (field_name.length === 0 || key_where.length === 0  || table_name.length === 0 ) {
        throw { type: 'NO_RECORD',   message: 'No se enviaron datos para actualizar' };
      }          

      const array_field=await getTableFields(table_name);
      const array_find=field_name.concat(key_where); 
      const notFound = array_find.filter(item => !array_field.some(field => field.col_name === item));

      if (notFound.length > 0) {
        throw { message: notFound.join(',') , code:42703 };
      }
    // end validaciones

      const valores = [];
      const setClauses = [];
      Object.entries(field_value).forEach(([clave, valor], index) => {         
          setClauses.push(`${clave} = $${(index + 1)}`); 
          valores.push(valor);             
      });
      // Agregar elementos del filtro como último parámetro para la cláusula WHERE                 
      valores.push(key_values.join(', '));
      // genera string para where
      const value_where = [];
      let setClauses_where = '';
      let sw_x=valores.length;   sw_x--;
      const conditions = [];
      Object.entries(filter_value).forEach(([clave, valor]) => {
        conditions.push(`${clave} = $${sw_x + 1}`);
        sw_x++;
      });
      setClauses_where = conditions.join(' and ');
      const query = `UPDATE ${table_name}  SET ${setClauses.join(', ')} WHERE ${setClauses_where} RETURNING *`; 
 console.log('update query ',query, valores);
    // Ejecutar la consulta a PostgreSQL)
    const result = await db.query(query, valores);
    ////result.rowCount = 0;  // prueba error
    if (result.rowCount === 0) {
      throw { type: 'NO_RECORD',   message: 'No se encontró el registro a actualizar' };
    }
    console.log('exito');
    return {  ok: true,  message: `Registro actualizado correctamente`,   rowCount: result.rowCount };
    
  } catch (error) {
  //  console.error('Error en f_UPD:', error.message, error.code);
  
    // Manejar errores específicos de PostgreSQL
    let userMessage ={};
        userMessage.message = 'Error al actualizar el registro';
    if (error.code) {  
        userMessage = handleDBError(error);
 console.log ('x', userMessage);

    } else if (error.type === 'NO_RECORD') {
      userMessage.message = error.message;
    }
     
    console.log ( { ok: false, error: userMessage.message,   details: process.env.NODE_ENV === 'development' ? error : undefined } );    
    return { ok: false, error: userMessage.message,   details: process.env.NODE_ENV === 'development' ? error : undefined };    
    //return { ok: false, error: userMessage,   details: process.env.NODE_ENV === 'development' ? error : undefined };    
  }
}

//INSERT: Add a new user
async function f_ADD(param_array) {
  try {
      //param_array.field_value={}   // para prueba
      //validaciones
      const { field_value, table_name} = param_array;       
// console.log('add ini ',param_array);

      const field_name  = Object.keys(field_value); 
      if (field_name.length === 0 || table_name.length === 0 ) {
        throw { type: 'NO_RECORD',   message: 'No se enviaron datos para actualizar' };
      }          

      const array_field=await getTableFields(table_name);
      const notFound = field_name.filter(item => !array_field.some(field => field.col_name === item));
  //console.log('notFound',notFound);
      if (notFound.length > 0) {
        throw { message: notFound.join(',') , code:42703 };
      }
    // end validaciones

      const valores = [];
      const setClauses = [];
      Object.entries(field_value).forEach(([clave, valor], index) => {         
          setClauses.push(`$${(index + 1)}`); 
          valores.push(valor);             
      });
      const query = `INSERT INTO ${table_name} (${field_name.join(', ')}) VALUES (${setClauses.join(', ')}) RETURNING *`;  
  // console.error('add:', query);    

    // Ejecutar la consulta a PostgreSQL)
    const result = await db.query(query, valores);
//console.log(query, valores);    
    //result.rowCount = 0;  // prueba error
    if (result.rowCount === 0) {
      throw { type: 'NO_RECORD',   message: 'No se agregaron registros' };
    }
    return {  ok: true,  message: `Registro agregado correctamente`,   rowCount: result.rowCount };
    
  } catch (error) {
  //  console.error('Error en f_ADD:', error.message, error.code);
  
    // Manejar errores específicos de PostgreSQL
    let userMessage ={};
        userMessage.message = 'Error al agregar el registro';
    if (error.code) {  
        userMessage = handleDBError(error);
 //console.log ('x', userMessage);

    } else if (error.type === 'NO_RECORD') {
      userMessage.message = error.message;
    }
     
//    console.log ( { ok: false, error: userMessage.message,   details: process.env.NODE_ENV === 'development' ? error : undefined } );    
    return { ok: false, error: userMessage.message,   details: process.env.NODE_ENV === 'development' ? error : undefined };    
  } 
}

async function getTableFields(table_name){
  let sql_str  ="SELECT a.attname as col_name ";
      sql_str +="FROM pg_catalog.pg_tables p, pg_class c, pg_attribute a, pg_type t ";
      sql_str +="WHERE ";
      sql_str +="p.schemaname || '.' || p.tablename='" + table_name + "' ";
      sql_str +="and p.tablename=c.relname ";
      sql_str +="AND a.atttypid=t.oid ";
      sql_str +="AND a.attrelid=c.oid ";
      sql_str +="AND a.attnum > 0 ";
  const result = await db.query(sql_str);
  return result.rows;
}

function handleDBError(error) {
  const errorMap = {
    '42703': { message: `Columna no existe: ${error.message}`, status: 400 },
    '23505': { message: 'Violación de valor único', status: 409 },
    '22P02': { message: 'Tipo de dato incorrecto', status: 400 },
    '23503': { message: 'Violación de llave foránea', status: 400 }
  };

  return errorMap[error.code] || { 
    message: `Error de base de datos: ${error.message}`, 
    status: 500 
  };
}

async function f_last_row( param_array){
  try {
        t_table =param_array.t_table;
        column  =param_array.column; 
        s_where =param_array.s_where;
        where_all= (s_where.length==0)? '' : " Where " + s_where;    

        let result = await db.query('Select max(' +  column + ') as n_row From ' + t_table +  where_all);
//console.log ('last Miscf A', result.rows);        
        // Verificación segura PostgreSQL
        if (result.rows && result.rows.length > 0) {
            result.rows[0].n_row += 1;
        } else {
            result.rows = [{ n_row: 1 }];
        }

        // Verificación segura 
        /*
        if (result && result.rows && Array.isArray(result.rows) && result.rows.length > 0) {
            result.rows[0].n_row += 1;
        } else {
            console.error('Estructura inesperada en result:', result);
            // Opción: inicializar si no existe
            result.rows = [{ n_row: 1 }];
        }
        */
        // Obtenemos el valor actual (o 0 si es null/undefined) y le sumamos 1.
        /* 
        let proximo_id = (result?.rows[0]?.n_row || 0) + 1;
        console.log ('last Miscf next', proximo_id);
        result.rows[0].n_row = proximo_id;
        */

 //       console.log ('last Miscf B', result.rows);
        return result.rows;
  } catch (err) {
    console.error(err.stack);
    return { error: 'Database error' };
  }

}

async function f_ct3a01_h( ){
  try {
        let result = await db.query('Select * From dba.ct3a01 Order by 1');
        // Verificación segura PostgreSQL
        if (result.rows && result.rows.length > 0) {
            //result.rows[0].n_row += 1;
        } else {
            //result.rows = [{ n_row: 1 }];
        }
        return result.rows;
  } catch (err) {
    console.error(err.stack);
    return { error: 'Database error' };
  }

}

async function f_look_des(file_f, using_keyfield) {
  let key_desc='';   let sql ='';
 if (using_keyfield.length==0)  {
    return key_desc;
  } else {
    switch(file_f)   {
      case 'ct2a03': sql = "Select (des_doc || '|' || coalesce(ugi_cos,'')) as des_doc  FROM dba.ct2a03 WHERE cod_doc || ser_doc='" + using_keyfield + "'"; break;      
      case 'ct3a01': sql = "Select des_fam FROM dba.ct3a01 WHERE key_fam='" + using_keyfield + "'"; break;
      case 'ct3a01_all': 
            sql  ="select (w.des_002 || ' »» ' ||  w.des_004 || ' »» ' ||  w.des_006) as des_fam ";
            sql +="from ( ";
            sql +="select t.key_fam, ";
            sql +="(select a.des_fam from dba.ct3a01 a where a.key_fam=  substring(t.key_fam,1,2) ) as des_002, ";
            sql +="(select a.des_fam from dba.ct3a01 a where a.key_fam=  substring(t.key_fam,1,4) ) as des_004, ";
            sql +="(select a.des_fam from dba.ct3a01 a where a.key_fam=  t.key_fam ) as des_006 ";
            sql +=" from (select '" + using_keyfield + "'::text as key_fam) t ) w "; break;
      case 'ct3a02': sql = "Select des_art FROM dba.ct3a02 WHERE cod_art=" + using_keyfield; break;
      case 'ct3a03': sql = "Select des_ent FROM dba.ct3a03 WHERE num_ruc='" + using_keyfield + "'"; break; 
    
 if ('a'=='a'){   
  /*
 	case 'ct0a01': 	 $sql = "Select des_psc FROM dba.ct0a01 WHERE key_psc='".$using_keyfield."'" ;	break;
 	case 'ct0a02': 	 $sql = "Select des_lis FROM dba.ct0a02 WHERE nom_lis || nro_lis::text='".$using_keyfield."'" ;	break;
 	case 'ct0a03': 	 $sql = "Select nom_bre FROM dba.ct0a03 WHERE tel_001 || num_cmp::text='".$using_keyfield."'" ;	break;
 	case 'ct1a02': 	 $sql = "Select des_gps FROM dba.ct1a02 WHERE key_gps='".$using_keyfield."'" ;	break;
 	case 'ct1a02_d':	 $sql = "Select dir_gps FROM dba.ct1a02 WHERE key_gps='".$using_keyfield."'" ;    break;
  case 'ct1a02_k':	 $sql = "Select ubi_geo FROM dba.ct1a02 WHERE key_gps='".$using_keyfield."'" ;	break;
 	case 'ct1a02_u':
 	 $sql_u = "Select ubi_geo FROM dba.ct1a02 WHERE key_gps='".$using_keyfield."'" ;
     $res_u= DB_query($sql_u, $db);
     if (DB_num_rows($res_u)>0)
      {$my_u=DB_fetch_row($res_u);
       $ubi_geo=$my_u[0];
      }
     $sql = "SELECT (select coalesce(a.des_uge,' ') from dba.ct7a02 a where a.key_uge=substring(c.key_uge,1,2))  ||
            case when char_length(c.key_uge) > 3 then '|' || (select coalesce(b.des_uge,' ') from dba.ct7a02 b where b.key_uge=substring(c.key_uge,1,4)) else '' end ||
            case when char_length(c.key_uge) > 4 then '|' || coalesce(c.des_uge,' ') else '' end
            FROM dba.ct7a02 c
            WHERE c.key_uge='".$ubi_geo."'" ;
	break;
  	case 'ct1a03': 	 $sql = "Select des_ubi FROM dba.ct1a03 WHERE ubi_art=".$using_keyfield ;	break; 	  
   	case 'ct2a05': 	 $sql = "Select des_tra FROM dba.ct2a05 WHERE cast(cod_ges as varchar) || cast(num_tra as varchar)='".$using_keyfield."'" ;	break;
 	  case 'ct0a01': 	 $sql = "Select des_psc FROM dba.ct0a01 WHERE key_psc='".$using_keyfield."'" ;	break;
 	  case 'ct3a01': 	 $sql = "Select des_fam FROM dba.ct3a01 WHERE key_fam='".$using_keyfield."'" ;	break;
 	  
    case 'ct3a02_v': 	 $sql = "Select  und_vta  FROM dba.ct3a02 WHERE cod_art=".$using_keyfield ;     break;
    case 'ct3a02_b': 	 $sql = "Select  cod_art  FROM dba.ct3a02 WHERE cod_bar='".$using_keyfield."'" ;     break;
    case 'ct3a02_l': 	 $sql = "Select coalesce(ruc_prv,'x') as ruc_prv FROM dba.ct3a02 WHERE cod_art=".$using_keyfield ;     break;
    case 'ct3a02_a': 	 $sql = "Select  tip_imp  FROM dba.ct3a02 WHERE cod_art=".$using_keyfield ;     break;
    case 'ct3a02_k': 	 $sql = "Select case when length(key_fam)=0 then '000000' else key_fam end FROM dba.ct3a02 WHERE cod_art=".$using_keyfield ;     break;
    case 'ct3a02_p': 	 $sql = "Select coalesce(pes_art,'N') as pes_art FROM dba.ct3a02 WHERE cod_art=".$using_keyfield ;     break;
    case 'ct3a02_i': 	 $sql = "Select coalesce((select por_imp from dba.ct2a01 x where x.tip_imp=a.tip_imp),0) as por_igv FROM dba.ct3a02 a WHERE cod_art=".$using_keyfield ;      break;
 	  
 	  case 'ct3a03_d': 	 $sql = "Select dir_ent FROM dba.ct3a03 WHERE num_ruc='".$using_keyfield."'" ;	break;
    case 'ct3a03_g': 	 $sql = "Select ubi_geo FROM dba.ct3a03 WHERE num_ruc='".$using_keyfield."'" ;	break;
 	  case 'ct3a03_u': 	 $sql_u = "Select ubi_geo FROM dba.ct3a03 WHERE num_ruc='".$using_keyfield."'" ;     
     $res_u= DB_query($sql_u, $db);
     if (DB_num_rows($res_u)>0)
      {$my_u=DB_fetch_row($res_u);
       $ubi_geo=$my_u[0];
      }
     $sql = "SELECT (select coalesce(a.des_uge,' ') from dba.ct7a02 a where a.key_uge=substring(c.key_uge,1,2))  ||
            case when char_length(c.key_uge) > 3 then '|' || (select coalesce(b.des_uge,' ') from dba.ct7a02 b where b.key_uge=substring(c.key_uge,1,4)) else '' end ||
            case when char_length(c.key_uge) > 4 then '|' || coalesce(c.des_uge,' ') else '' end
            FROM dba.ct7a02 c
            WHERE c.key_uge='".$ubi_geo."'" ;
	break;
 	case 'ct3a03g':  	 $sql = "Select des_zon FROM dba.ct3a03g WHERE cod_zon=".$using_keyfield;	break;
 	case 'ct3a03_zr': 	 $sql = "Select coalesce((Select des_zon from dba.ct3a03g where dba.ct3a03g.cod_zon=dba.ct3a03.cod_zon),'') FROM dba.ct3a03 WHERE num_ruc='".$using_keyfield."'" ;	break;
 	case 'ct3a03_z': 	 $sql = "Select coalesce(cod_zon,0) FROM dba.ct3a03 WHERE num_ruc='".$using_keyfield."'" ;	break;
 	case 'ct3a03f': 	 $sql = "Select tip_cba || '|' || sig_mon FROM dba.ct3a03f WHERE num_ruc || cod_ban || num_cba='".$using_keyfield."'" ;	break;
 	case 'ct3a03f_d': 	 $sql = "Select coalesce(cod_cta,' ') || '|' || (Select des_ban FROM dba.ct3a04 WHERE dba.ct3a04.cod_ban=dba.ct3a03f.cod_ban) FROM dba.ct3a03f WHERE num_ruc || cod_ban || num_cba='".$using_keyfield."'" ;	break;
 	case 'ct3a04': 	 $sql = "Select des_ban FROM dba.ct3a04 WHERE cod_ban='".$using_keyfield."'" ;	break;
 	case 'ct3a08_ref': 	 $sql = "Select pla_ref FROM dba.ct3a08 WHERE pla_ser='".$using_keyfield."'" ;	break;
 	case 'ct3a08_car': 	 $sql = "Select lep_vmo FROM dba.ct3a08 WHERE pla_ser='".$using_keyfield."'" ;	break;
 	case 'ct3a08_r': 	 $sql = "Select reg_mtc FROM dba.ct3a08 WHERE pla_ser='".$using_keyfield."'" ;	break;
 	case 'ct4a01': 	 $sql = "Select nom_tra FROM dba.ct4a01 WHERE cod_tra=".$using_keyfield ;	break;
 	case 'ct4a01_dni': 	 $sql = "Select cod_tra FROM dba.ct4a01 WHERE nro_dcm='".$using_keyfield."'" ;	break;
 	case 'ct4a01_pll': 	 $sql = "Select nom_tra FROM dba.ct4a01 WHERE nro_dcm='".$using_keyfield."'" ;	break;
 	case 'ct4a01_dcm': 	 $sql = "Select nro_dcm FROM dba.ct4a01 WHERE cod_tra=".$using_keyfield;	break;
 	case 'ct4a01_afp': 	 $sql = "Select cod_afp FROM dba.ct4a01 WHERE cod_tra=".$using_keyfield;	break;
 	case 'ct4a01_u':
     if ((int)$using_keyfield==0) {
     	 $sql = "Select cast('Venta Oficina' as varchar) FROM dba.ct1a01" ;
      } else {
      	 $sql = "Select use_tra FROM dba.ct4a01 WHERE cod_tra=".$using_keyfield ;
      }
	break;

	case 'ct4a01_e';      $sql = "Select des_esp FROM dba.ct4a01 WHERE cod_tra=".$using_keyfield ;  	break;
 	case 'ct4a10': 	 $sql = "Select des_dcm FROM dba.ct4a10 WHERE cod_dcm=".$using_keyfield ;	break;
 	case 'ct4a11': 	 $sql = "Select des_dcm FROM dba.ct4a11 WHERE cod_dcm=".$using_keyfield ;	break;
 	case 'ct4a07': 	 $sql = "Select des_dcm FROM dba.ct4a07 WHERE cod_dcm=".$using_keyfield ;	break;
  case 'fa1a01_f': 	 $sql = "Select fec_fac FROM dba.fa1a01 WHERE nro_fac=".$using_keyfield ;   //revisar debe ser con toda la llave	break;
  case 'fa1a01_tip': 	 $sql = "Select tip_tra FROM dba.fa1a01 WHERE nro_fac=".$using_keyfield ;   //revisar debe ser con toda la llave	break;
 	case 'ct5a01': 	 $sql = "Select des_lar FROM dba.ct5a01 WHERE key_cta='".$using_keyfield."'" ;	break;
 	case 'ct6a01':     $sql = "SELECT nom_cho FROM dba.ct6a01 WHERE nro_dni='".$using_keyfield."'" ;    break;
 	case 'ct6a01_b':     $sql = "SELECT nro_bre FROM dba.ct6a01 WHERE nro_dni='".$using_keyfield."'" ;    break;
	case 'ct7a02':     $sql = "SELECT (select coalesce(a.des_uge,' ') from dba.ct7a02 a where a.key_uge=substring(c.key_uge,1,2))  ||
            case when char_length(c.key_uge) > 3 then '|' || (select coalesce(b.des_uge,' ') from dba.ct7a02 b where b.key_uge=substring(c.key_uge,1,4)) else '' end ||
            case when char_length(c.key_uge) > 4 then '|' || coalesce(c.des_uge,' ') else '' end
            FROM dba.ct7a02 c
            WHERE c.key_uge='".$using_keyfield."'" ;
    break;
 	  case 'ct7a03':     $sql = "Select des_art FROM dba.ct7a03 WHERE cod_hos=".$using_keyfield ;    break;
    case 'ct7a02_d':     $sql = "Select des_uge FROM dba.ct7a02 WHERE key_uge='".$using_keyfield."'" ;    break;
    case 'mail_user':     $sql = "Select email from dba._sy0a00 WHERE use_nom='".$using_keyfield."'" ;    break;
    case 'wsy0a01':     $sql = "Select des_app FROM dba.wsy0a01 WHERE sys_nam='".$using_keyfield."'" ;    break;
    case 'ct9a01':   $sql = "Select nom_com FROM dba.ct9a01 WHERE nro_his=".$using_keyfield ;   break;
    case 'sy0a00_t': $sql = "Select coalesce(mod_014,'M') FROM dba._sy0a00 WHERE use_nom='".$using_keyfield."'";  break;
    
    */   
  }


   } // end switch

    let result = await db.query(sql);
    // Verificación segura PostgreSQL
    if (result.rows && result.rows.length > 0) {
        key_desc=result.rows;
    }
    return  key_desc;
  }

}

function f_First_LastDay(anio, mes) {
    // mes en JavaScript es 0-indexado (enero = 0)
    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0); // día 0 = último día del mes anterior

    // Formatear a yyyy-mm-dd
    const formato = (fecha) => {
        const yyyy = fecha.getFullYear();
        const mm = String(fecha.getMonth() + 1).padStart(2, '0'); // +1 porque getMonth() es 0-indexado
        const dd = String(fecha.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    return {
        DiaUno: formato(primerDia),
        DiaFin: formato(ultimoDia)
    };
}

async function f_doc_validos(param_mod, param_file, param_user){
 try { 
  const query = `SELECT (
      SELECT array_to_string(array[
        coalesce(  (SELECT key_mod -> x.mod -> x.file_name ->> 1 AS tip_doc FROM dba._sy0a00 WHERE use_nom='admin' ) ,'null'),
           case when x.user='admin' 
           then (select string_agg(ser_doc::text, ', ') from dba.ct2a03 where cod_doc=coalesce(  (SELECT key_mod -> x.mod -> x.file_name ->> 1 AS tip_doc FROM dba._sy0a00 WHERE use_nom='admin' ) ,'null') and est_reg='I' order by 1)
           else ( key_mod -> x.mod -> x.file_name ->> 1)
           end ,
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
     const param_values=result.rows[0].key_param;
     const param_array=param_values.split('|');
     const doc_tem= await param_array[0].trim();
     const ser_tem= await param_array[1].split(',');
     const att_tem= await param_array[2].trim();
 
     const key_des_tem = await Promise.all(
        ser_tem.map(async (item) => {             
          item=item.trim();
          let des_tem = await f_look_des('ct2a03', doc_tem + item);        
          return des_tem.map(clave => {
            const parts = clave.des_doc.split('|');
            return  {
                      key: doc_tem + '|' + item + '|' + parts[1],
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
  get_variables, 
  f_genera_grilla_fixed, 
  f_SELECT, f_UPD,  f_ADD , 
  f_last_row, f_ct3a01_h, f_look_des, f_First_LastDay, 
  f_doc_validos, 
} 