var sy_w1011 = {
    f_get_head : async function() {  
      await this.f_modifica_filtro();     
      $('#g_Most').trigger('click');
      const array_headers=  await this.f_genera_headers();
      return array_headers; 
    },

    ue_nuevo_ini : async function () {
      f_ui_inicializar_div_mensaje_modal();
      filed_origen={}
        $('#use_nom').val('');  
        $('#sw_y').val('N');  
        //this.f_ui_inicializarFormulario();
      return TIPO_MSG_OK;
    },

    f_mostrar : async function() {
      f_ui_inicializar_div_mensaje();
      let msg=''; let sw_1=0;
      const filename= $('#body_content').attr('file_name');
          const url='/api/select_gGeneral';
          var parametros = {"opcion": filename };    
          const dataJSON = await $.ajax({
                              data:  parametros,
                              url : url,
                              type: 'GET',
                              contentType: "application/json",
                              dataType: "json",
                              error: function(jqXHR, textStatus, errorThrown) {
                                    console.log('error', errorThrown);
                              }
                            });
         this.f_retrieve(dataJSON);

    },

    f_retrieve : async function (dataJSON) {    
      const array_headers= await this.f_genera_headers(); 

    let result_colname= array_headers.result_colname;
   // let result_head   = array_headers.result_head;
    let result_headwid= array_headers.result_headwid;
    let result_colsus = array_headers.result_colsus;
    let result_format = array_headers.result_format;

const titulo_1='Consulta';
const titulo_2='';
const titulo_3='';
const cols_sumary   =[];
const sumas_col = [];

cols_sumary.map( item => {  sumas_col.push(result_colname.indexOf(item));   });

  let btn_retrieve='1';
  let btn_ok=(typeof btn_retrieve=== 'undefined' || btn_retrieve[0]=='0')? '0' :'1';

  let page_ln=(btn_ok== '0')? 16 : 12;
  //var xapi;
  var pageTotal =0;

    var xaoColumnDefs=[]
  result_headwid.forEach(function (valuey, k , array) {
    switch (k) {
        default: valox = { "data": null,  "mRender":   (data, type, value) => {
                         if (btn_ok=='1' && k==(result_headwid.length - 1)){
        data_result= '<button type="button" class="btn btn-link btn-sm" onclick="ret_detalle(this)"><span class="glyphicon glyphicon-check"></span></button>';                            
                          } else {
                            data_result=value[result_colname[k]];
                            for_m=result_format[k];
                            data_result=f_patterm(data_result, for_m);
                          }
                          return data_result;
                        },  "class": 'ali_'+result_colsus[k], "sWidth": result_headwid[k]};
      }
      xaoColumnDefs.push(valox);
  });

        if ($('#table1 tfoot')) {    
            $('#table1 tfoot').remove();
        }
 
    $("#table1").append( $('<tfoot/>').append( $("#table1 thead tr").clone() ) );
    $('#table1 tfoot tr:first').each(function () {
        $(this).find("th").each(function (j, val_j) {
             $(val_j).html('');
         });
    });
     
    $('#table1').DataTable({
        "dom"       : 'Bfrtip',
 //       "lengthMenu": [ page_ln ],
        "destroy"   : true ,
        "data"      : dataJSON,
        "columns"   :  xaoColumnDefs ,
        "language"  : {"paginate": {"previous": "<<","next": ">>"}},
      ///////////////////////////////////////////////////////////////////////////////////////////////////
     
       "footerCallback": function ( row, data, start, end, display ) {
            if (end > 0) {
              var api = this.api();

              sumas_col.forEach(function (col_n, ind_n, array) {
                 col_name=result_colname[col_n];
                 nodes_t= api.column(col_n).nodes().rows( { filter : 'applied'} ) ;
                 z_nodes_fil=$(nodes_t)[0];
                 var columnas_total = api.column(col_n).nodes();
                 pageTotal =0;
                 z_nodes_fil.forEach(function (col_x, ind_x, arrayx) {
                      a=columnas_total.row(col_x).data()[col_name];
                      a= String(a);   a=a.replace(/,/g,"");
                      pageTotal = Math.round( ( parseFloat(pageTotal) + parseFloat(a) ) * 100) / 100  ;
                  });
                  // Update footer
                  $( api.column( col_n ).footer() ).css('text-align','right').html(  numberFormatter(pageTotal, 2) );
               });
               xapi=api;
          }
        },
        
       /////////////////////////////////////////////////////////////////////////////////////////////////
    });

    //let html_barr ='<div style="display: inline-flex;width: 70%;">';
    //html_barr +='<div class="col-md-5 col-xs-4"><span>'+ titulo_1 +'</span></div>';
    //html_barr +='<div class="col-md-5 col-xs-4"><span>'+ titulo_2 +'</span></div>';
    //html_barr +='</div>';
    //$("#table1_filter").before(html_barr);

    ////////////////////////////////////////////////////////////////////////////////
     
     $('#f_find').remove();
     $('#table1_filter').find('input').addClass("form-control_t");

     var xpo=$('#table1_filter').clone(true, true);
     $('#table1_filter').hide();

     var len_div= $('.container_p div').length;      len_div--;   
     $('.container_p').find('div').each(function (i) {
        if (i==len_div) {
          $(xpo).find('input').attr('size','15').css('margin-left','6px');
          $(xpo).attr('id','f_find');
          xpo.appendTo(this)
         }
     });
 
     $('#f_find label').contents().filter(function() {
        return this.nodeType === 3; // Nodo de texto
     }).first().replaceWith('Filtro:');
      
////////////////////////////////////////////////////////////////////////////////
    },

    get_values : async function () {
          const filename= $('#body_content').attr('file_name');
          const url='/api/genera_field_sql';
          var parametros = {"opcion": filename};    

          const array_field = await $.ajax({
                              data:  parametros,
                              url : url,
                              type: 'GET',
                              contentType: "application/json",
                              dataType: "json",
                              error: function(jqXHR, textStatus, errorThrown) {
                                    console.log('error', errorThrown);
                              }
                            });  
          return  array_field;               
    },
    f_ui_inicializarFormulario : async function () {            
        try {
          const response = await  fetch('/api/tree');
          if (!response.ok) {      
          }         
          const {ModuleLink , ModuleList, tree_modite, user} = await response.json();
          let user_set=$('#use_nom').val();
//console.log ('f_ui_ini', user, user_set.includes('owner'), user_set );          
          let html_x=''; 
       if (user_set=='admin'){
          ////////////// get docs /////////////
          const filename= $('#body_content').attr('file_name');
          const url='/api/doc_selected';
          var parametros = {"opcion": filename } ;    
          const dataSelect = await $.ajax({
                              data:  parametros,
                              url : url,
                              type: 'GET',
                              contentType: "application/json",
                              dataType: "json",
                              error: function(jqXHR, textStatus, errorThrown) {
                                    console.log('error', errorThrown);
                              }
                            });
          let setClauses={}
          Object.entries(dataSelect).forEach( async ([clave, valor]) => {         
              setClauses[valor.cod_doc] = valor.cod_doc + '| ' + valor.des_doc; 
          });
          const cadena_docs= await f_ui_generar_cadena_select(setClauses, ''); 
//console.log('1 cadena_docs', cadena_docs);                             

          /////////////////////////////////////        
          ModuleLink.map( (item, id) => {             
            if (id > 0){               
            html_x +='<li id="li-' + id + '">';
            html_x +='<input type="checkbox" name="list" id="nivel1-' + id + '" value="' + item + '">';            
            html_x +='<label for="nivel1-' + id + '"><b>' + ModuleList[item] + '</b></label>';            
            html_x +='<ul class="interior">';
            html_x +='<div class="row">';
      if (tree_modite[item]){
          tree_modite[item].map( (itex, ix) => { 
            html_x +=' <div class="col-xs-6 col-sm-3 p-md-1">';
            html_x +=' <div class="card-container">';
            html_x +=' <div class="body-container">';
            html_x +='   <div>' + itex.des_name + '</div>';
            html_x +='    <div>';
  
            html_x +='<span><input class="hidden" type="checkbox" id="bc-' + id + '_'+ ix + '" checked=true></span>';            
            html_x +='<span><input class="hidden" id="ch1-' + id + '_'+ ix + '" type="radio" name="bt_' + id + '_'+ ix + '"></span>';
            html_x +='<span><input class="hidden" id="ch2-' + id + '_'+ ix + '" type="radio" name="bt_' + id + '_'+ ix + '" checked=true></span>';
            html_x +='      <select class="form-control_t" id="imp-' + id + '_'+ ix + '" style="margin-left: -17px;">';            
            html_x += cadena_docs; 
            html_x +='      </select>';
            html_x +='    </div>';
            html_x +='    <input type="hidden" id="file-' + id + '_'+ ix + '" value="' + itex.file_name + '">';            
            html_x +='</div>';
            html_x +='</div>';
            html_x +='</div>';          
          });
        }  
            html_x +='</div>';     
            html_x +='</ul>';
            html_x +='</li>'; 
            }
          });
       } else {
           ModuleLink.map( (item, id) => {  
//console.log ('f_ui_ini',id, item, user, ModuleList[item]);            
            html_x +='<li id="li-' + id + '">';
            html_x +='<button type="button" id="btn_std_' + id + '" class="btn btn-link btn-sm"><span class="glyphicon glyphicon-remove col_red"></span></button>';
            html_x +='<input type="checkbox" name="list" id="nivel1-' + id + '" value="' + item + '">';
            html_x +='<label for="nivel1-' + id + '"><b>' + ModuleList[item] + '</b></label>';            
            html_x +='<ul class="interior">';
            html_x +='<div class="row">';
      if (tree_modite[item]){
          tree_modite[item].map( (itex, ix) => { 
//console.log ('f_ui_ini',ix, itex);            
            html_x +=' <div class="col-xs-6 col-sm-3 p-md-1">';
            html_x +=' <div class="card-container">';
            html_x +=' <div class="body-container">';
            html_x +='   <div>' + itex.des_name + '</div>';
            html_x +='<span><input type="checkbox" id="bc-' + id + '_'+ ix + '"></span>';
            html_x +='<span id="sp-' + id + '_'+ ix + '" style="color:red;"><i>[Sin Acceso]</i></span><br>';
            html_x +='<span><input id="ch1-' + id + '_'+ ix + '" type="radio" name="bt_' + id + '_'+ ix + '"></span>';
            html_x +='<span>Lectura</span>';
            html_x +='<span><input id="ch2-' + id + '_'+ ix + '" type="radio" name="bt_' + id + '_'+ ix + '"></span>';
            html_x +='<span>Escritura</span><br><span>Series Asignadas</span><br>';
            html_x +='<div><input type="text" class="form-control_t" id="imp-' + id + '_'+ ix + '" value="" title="Ejm : 3;7 separado por punto y coma"></div>';
            html_x +='<input type="hidden" id="file-' + id + '_'+ ix + '" value="' + itex.file_name + '">';

            html_x +='</div>';
            html_x +='</div>';
            html_x +='</div>'; 
          });
        }  
            html_x +='</div>';     
            html_x +='</ul>';
            html_x +='</li>';                  
          });       
       }
          $('#menu').html(html_x);

          if (user_set=='admin'){ 
              ModuleLink.map( (item, id) => {             
                if (id > 0){ 
                  if (tree_modite[item]){
                      tree_modite[item].map( (itex, ix) => { 
                          (async () => {
                              let key_mod_value= await this.getkey_mod(item, itex.file_name);  
                              $('#imp-' + id + '_'+ ix).val(key_mod_value[1]);
                          })();   
                      });
                    }  
                }
              });
          } else {
              ModuleLink.map( (item, id) => {                 
                  if (tree_modite[item]) {
                      tree_modite[item].map( (itex, ix) => { 
                          (async () => {
                              let key_mod_value= await this.getkey_mod(item, itex.file_name);                                
                              if (key_mod_value){
                                $('#sp-'  + id + '_' + ix).html('[' + (key_mod_value[0]=='E')? 'Escritura' :'Lectura' + ']');
                                $('#bc-'  + id + '_' + ix).attr('checked', true).prop('checked', true);
                                $('#ch1-' + id + '_' + ix).attr('checked', (key_mod_value[0]=='L')? true :false).prop('checked', (key_mod_value[0]=='L')? true :false);
                                $('#ch2-' + id + '_' + ix).attr('checked', (key_mod_value[0]=='E')? true :false).prop('checked', (key_mod_value[0]=='E')? true :false);              
                                $('#imp-' + id + '_' + ix).val(key_mod_value[1]);
                              }
                          })();   
                      });
                  }                   
              });            
          }
          
          $("[id^=btn_std_]").click(function() {    
            var id_arr=$(this).attr('id').split('_');  
            var id_li=id_arr[2];
            if ($(this).find('span').hasClass("glyphicon-remove") ) {
              $(this).find('span').removeClass("col_red").removeClass("glyphicon-remove").addClass("glyphicon-ok");
            } else {
              $(this).find('span').removeClass("glyphicon-ok").addClass("glyphicon-remove").addClass("col_red");
              ue_remove_all(id_li);
            }
            ue_setmodulos();
          });
          $("[id^=bc-]").click(function() {
            var id_arr=$(this).attr('id').split('-');
            var id_li=id_arr[1];
            if ( $(this).is(":checked")==false){
              $('#ch1-'+ id_li).attr('checked', false).prop('checked', false);
              $('#ch2-'+ id_li).attr('checked', false).prop('checked', false);
              $('#sp-'+ id_li).html('[Sin Acceso]');
              $('#imp-'+ id_li).val('');
            }
            $(this).prop('checked', $(this).prop("checked")).attr('checked', $(this).prop("checked"));
          });
          $("[id^=ch1-]").click(function() {
            var id_arr=$(this).attr('id').split('-');
            var id_li=id_arr[1];
            if ( $(this).is(":checked")==true){
              $('#sp-'+ id_li).html('[Lectura]');
              var id_li_arr=id_li.split('_');
              var id_bt=id_li_arr[0];
              $('#btn_std_'+ id_bt).find('span').removeClass("col_red").removeClass("glyphicon-remove").addClass("glyphicon-ok");
            }
            $(this).prop('checked', $(this).prop("checked")).attr('checked', $(this).prop("checked"));
            $('#ch2-'+ id_li).attr('checked', false).prop('checked', false);
            $('#bc-'+ id_li).prop('checked', true).attr('checked', true);
            ue_setmodulos();
          });
          $("[id^=ch2-]").click(function() {
            var id_arr=$(this).attr('id').split('-');
            var id_li=id_arr[1];
            if ( $(this).is(":checked")==true){
              $('#sp-'+ id_li).html('[Escritura]');
              var id_li_arr=id_li.split('_');
              var id_bt=id_li_arr[0];
              $('#btn_std_'+ id_bt).find('span').removeClass("col_red").removeClass("glyphicon-remove").addClass("glyphicon-ok");
            }
            $(this).prop('checked', $(this).prop("checked")).attr('checked', $(this).prop("checked"));
            $('#ch1-'+ id_li).attr('checked', false).prop('checked', false);
            $('#bc-'+ id_li).prop('checked', true).attr('checked', true);
            ue_setmodulos();
          });
          $("#blocked").click(function() {   
              if ($(this).is(":checked")) {
                $('#text_block').html('Bloqueado');
              } else {
                $('#text_block').html('Activo');
              }              
          }); 

        } catch (error) {
          console.error("Error al generar menu:", error);
        }
       
    },
    f_genera_headers : async function() {        
      try {        
          array_field=  await this.get_values();

          let co_nome=array_field.array_header.colname;
          let headersx=array_field.array_header.headers;
          let headwidx=array_field.array_header.headwid;
          let colsusx = array_field.array_header.colsus;
          let colpatx = array_field.array_header.colpat;
          const id_row=true;
          const id_btn=true; 
          const array_suma = headwidx.reduce((acumulador,  valorActual ) => acumulador + parseInt(valorActual.replace("%","")), 0);
          let  heaid = 100 - array_suma;    heaid =(id_btn)? (heaid /2) : heaid;

          if (id_row){ co_nome.unshift('id_ite');}
          if (id_btn){ co_nome.push('id_btn'); }

          if (id_row){ headersx.unshift('Id');}
          if (id_btn){ headersx.push('...'); }

          if (id_row){ headwidx.unshift(heaid);}
          if (id_btn){ headwidx.push(heaid);}

          if (id_row){ colsusx.unshift( 'c');}
          if (id_btn){ colsusx.push( 'c'); }

          if (id_row){ colpatx.unshift( 'x');}
          if (id_btn){ colpatx.push('x'); }


          const result_colname= co_nome;  
          const result_head   = headersx; 
          const result_headwid= headwidx; 
          const result_colsus = colsusx;  
          const result_format = colpatx;  

        let head_t='<tr role="row">'; 
          result_headwid.forEach(function (valuey, k , array) {
            head_t +='<th class="ali_' + result_colsus[k] + '">' + result_head[k] + '</th>';    
          });

        head_t +='</tr>';
        //carga form 
        const fileName= await $('#body_content').attr('file_name'); 
        const formContent = await fetch('/api/modalDetalle?filename=' + fileName);
        const formhtml = await formContent.json();
        $('#modal-body').html(formhtml); 

        const retorno_var={result_colname : result_colname, result_headwid:result_headwid, result_colsus:result_colsus, result_format:result_format, head_t:head_t}
        return retorno_var; 
      } catch (error) {
        console.error("Error f_genera_headers:", error);
      }        
           
    },

    f_modifica_filtro : function(){  

      $('.container_p div').each(function(key, value) {         
        if ( key <4){ $(this).addClass('hidden');}    
      });
      $('#ch_0').hide(); 
      $('#fec_ini').attr('type','text').attr("onkeyup","this.value=this.value.toUpperCase()").val('').focus(); 
    },
    ret_detalle_ini : async function  (xthis) {   
      f_ui_inicializar_div_mensaje_modal();   
      try {
            var row_id  = await $(xthis).closest('tr');
            var tabla   = await  $('#table1').DataTable();
            var set_row = await  tabla.row(row_id).data();    
            var use_nom = await  set_row.use_nom;           
            if ( use_nom.length==0) {    
                throw new Error('La clave de busqueda no exite o no esta definida');        
            }            
            return  {ok:true, key_find:use_nom}
          } catch (error) {
            console.error("Error", error);
            return  {ok:false, message:error}
          }        
    },
    f_setvalues_head : async function  (use_nom, filename){
      try {     
            const url='/api/get_detalle';
            var parametros = {"opcion": filename, "key_unica":use_nom};     
            const json_detalle = await $.ajax({
                                  data:  parametros,
                                  url : url,
                                  type: 'GET',
                                  contentType: "application/json",
                                  dataType: "json",
                                  error: function(jqXHR, textStatus, errorThrown) {
                                        console.log('error', errorThrown);
                                  }
                                }); 

            filed_origen=json_detalle;       
            const values_data=(json_detalle.rows_data)[0];
//console.log('values_data',values_data);            
            //const key_fam_ref=(json_detalle.key_ref)[0];
              // Rellenar el formulario  mejorar para buscar dentro de un determinado div
            for (var key in values_data) {                  
                    if (values_data.hasOwnProperty(key)) {
                      var value = values_data[key];
                      // 1. Verificar si el campo es la fecha que quieres formatear (fec_reg)
                      // O podrías verificar si el valor tiene el formato ISO 8601 (contiene 'T')
                        if (( key === 'ultdate' || key === 'fec_reg' ) && typeof value === 'string' && value.includes('T')) {
                            // Si es la fecha y es una cadena ISO 8601, extrae solo la parte de la fecha
                            value = value.substring(0, 10); // Toma los primeros 10 caracteres: "YYYY-MM-DD"
                        }
                      // 2. Asignar el valor (modificado o original) al input
                        $('#' + key).val(value);                    
                    }
            }
            $('#modalDetalleLabel').text('SetUp');            
            $('#text_block').html( (values_data.blocked=='0')? 'Activo':'Bloqueado');
            $('#blocked').prop( 'checked', (values_data.blocked=='0')? false: true); 
            $('#key_mox').val(JSON.stringify(values_data.key_mod));
            this.f_ui_inicializarFormulario();
            //return  {msg_ok:true} 
            return  {ok:true}           
          } catch (error) {
            //return  {msg_ok:false, message:error}
            return  {ok:false, message:error}
          }
   },
  
    //revisar que tabla se obtenga desde _DAO
    ue_Aceptar : async function () {
      try {
          f_ui_inicializar_div_mensaje_modal();
          const data_json_js= await this.f_genera_json_upd('param');
          let data_json= await this.f_genera_json_upd('cab');
          data_json['key_mod'] = data_json_js;

//    console.log('aceptar',data_json_js);
  
          const id_attr= $('#use_nom').attr('id');
          const id_value=$('#use_nom').val(); 
          const sw_y=$('#sw_y').val(); 
          const id={ [id_attr] : id_value }     
          //const id={ id_attr : id_value }  //prueba error    
          const des_ent=$('#use_nom').val();     
          if (des_ent.trim().length==0){
            throw new Error('Registre un Nombre adecuado');
          }
        const parametros={filter_value: id, field_value : data_json, table_name:'dba._sy0a00'}

        let response =null;
        if (sw_y=='M'){
          response = await fetch('/api/put_setfield', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(parametros)
        });
        } else {     
          response = await fetch('/api/add_setfield', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(parametros)
          });        
        }
        const resultado = await response.json();
 
        if (!response.ok) {
          // Extraer mensaje de error según el tipo de respuesta
          const errorMsg = resultado.error || 
                          (resultado.message || 'Error en la solicitud');
          
          throw new Error(errorMsg);
        }
        f_ui_mostrar_div_mensaje_modal(TIPO_MSG_OK, resultado.message);
 
      } catch (error) {             
        let mensajeError = error.message;
        
        // Manejar errores específicos
        if (error.name === 'TypeError' && error.message.includes('JSON')) {
          mensajeError = 'Formato de respuesta inválido del servidor';
        }   
        
        f_ui_mostrar_div_mensaje_modal(TIPO_MSG_ERROR, mensajeError);
        
        // Opcional: mostrar detalles en consola para desarrollo
      //  if (process.env.NODE_ENV === 'development') {
      //    console.error('Error completo:', error);
      //  }

      }
    },     

    f_genera_json_upd : async function (form_id){     
    let data = {};
    // Selecciona el formulario dentro del div "headPTR"
    //const $form = await $('#render_cabecera').find('form');
//    const $form = await $('#render_cab');
//    const $form = await $('#form_param');    
    const $form = (form_id=='param')?  await $('#form_param') : $('#render_cab');    
    
//console.log('f_genera_json_upd sy_w1011 ',$form);     
    $form.find('input[id], select[id], textarea[id], button[id]').each(await function() {
        const $el = $(this);
        const id = $el.attr('id');
        let value;
     if (id !='sw_y' && id !='key_mox' && id !='ultdate' && id !='lastvisitdate' ){
        // Manejo específico para checkboxes y radio buttons
        if ($el.is(':checkbox')) {
            value = $el.is(':checked');
            if (id=='blocked'){value=(!value)? 0:1;}
            if (id.includes('nivel1-')){value=$el.val();}            
            data[id] = value;
        } else if ($el.is(':radio')) {
            // Para radio buttons, solo se considera el marcado
            if ($el.is(':checked')) {
                value = $el.val();
                if (id.includes('ch')){value=id.includes('ch1-')? 'L':'E';}                 
                data[id] = value; 
            }            
        } else {
            // Para el resto (text, number, select, textarea, hidden, etc.)
            value = $el.val();
            if (id=='ultdate' && value.length==0){value=null;}
            if (id=='lastvisitdate' && value.length==0){value=null;} 
            if (id.includes('btn_std')){ value=($el.find('span').hasClass("glyphicon-ok"))? true : false;}            
            data[id] = value;                                  
        }        
     }   
    });

     if (form_id=='param'){data = await this.filtrarYMapear(data)}
    
     return data;
    },
    
    filtrarYMapear : function (obj) {
  const resultado = {};
  Object.keys(obj).forEach((clave) => {
    if (clave.startsWith('bc-') && obj[clave] === true) {
      const match = clave.match(/^bc-(\d+)_(\d+)$/);
      if (match) {
        const n = match[1];
        const m = match[2];

        const fileKey = `file-${n}_${m}`;
        const fileName = obj[fileKey];

        const nivelKey = `nivel1-${n}`;
        const nivel = obj[nivelKey];

        if (fileName && nivel) {
          const ch1Key = `ch1-${n}_${m}`;
          const ch2Key = `ch2-${n}_${m}`;

          const ch1Val = obj[ch1Key] || "";
          const ch2Val = obj[ch2Key] || "";
          const chTmp = (ch1Val.length>0)? ch1Val : ch2Val;

          // Obtener el valor de imp-n_m
          const impKey = `imp-${n}_${m}`;
          const impVal = obj[impKey] || "";
          
          const lista = [chTmp, impVal];

          if (!resultado[nivel]) {
            resultado[nivel] = {};
          }
          resultado[nivel][fileName] = lista;
        }
      }
    }
  });

  return resultado;
    },

    ue_Cancela : function () {
      var $encabez = $('#encabez');    
      if ($encabez.length) { 
            const values_data=(filed_origen.rows_data)[0];
          // const key_fam_ref=(filed_origen.key_ref)[0];    
                for (var key in values_data) {                  
                    if (values_data.hasOwnProperty(key)) {
                      var value = values_data[key];
                        if (key === 'ultdate' && typeof value === 'string' && value.includes('T')) {
                            value = value.substring(0, 10);
                        }
                        $('#' + key).val(value);                    
                    }
                }
            $('#text_block').html( (values_data.blocked=='0')? 'Activo':'Bloqueado');
            $('#blocked').prop( 'checked', (values_data.blocked=='0')? false: true);    
      } 
    },
    getkey_mod : async function (objKey, innerKey) {
      var jsonStr = $('#key_mox').val();
      if(!jsonStr) return null;
      var jsonObj = JSON.parse(jsonStr);
      if(jsonObj[objKey] && jsonObj[objKey][innerKey]) {
        // Retorna array
        return jsonObj[objKey][innerKey];
      }
    return null;
    }     

};
 