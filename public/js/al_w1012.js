var al_w1012 = {  
    f_get_head : async function() {  
      await ui_inicializar_barra_filtro();
      //this.f_modifica_filtro();     
      const array_headers= await f_genera_headers();
      return array_headers; 
    },
    ue_nuevo_ini : async function () {
      f_ui_inicializar_div_mensaje_modal();
      filed_origen={}
        $('#num_ruc').val('');  
        $('#fec_reg').val(f_fechaNow());
        $('#hor_reg').val(f_horaNow());
        $('#sw_y').val('N');  
        this.f_ui_inicializarFormulario();
      return TIPO_MSG_OK;
    },

    f_retrieve : async function (dataJSON) {    
        const array_headers= await f_genera_headers(); 
        
        let result_colname= array_headers.result_colname;
        //let result_head   = array_headers.result_head;
        let result_headwid= array_headers.result_headwid;
        let result_colsus = array_headers.result_colsus;
        let result_format = array_headers.result_format;

        const cols_sumary   =[];
        const sumas_col = [];

        cols_sumary.map( item => {  sumas_col.push(result_colname.indexOf(item));   });

        let btn_retrieve='1';
        let btn_ok=(typeof btn_retrieve=== 'undefined' || btn_retrieve[0]=='0')? '0' :'1';
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
            "destroy"   : true ,
            "data"      : dataJSON,
            "columns"   :  xaoColumnDefs ,
            "language"  : {"paginate": {"previous": "<<","next": ">>"}},
        
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
            
        });
     
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
      
    },
 
    f_genera_headers_list : async function(key_detail, filename) {
      try {        
          const array1 =['doc_ing','ser_ing','nro_ing'];
          const array2 = key_detail.split('-');      
          
          let filter_value=await generarCadenaParametroDetalle(array1, array2);
 
          var parametros_list = {"opcion": filename} 
          const param_result = await $.ajax({
                              data: JSON.stringify(parametros_list),
                              url : '/api/genera_field_list',
                              method: 'POST',
                              contentType: "application/json",
                              dataType: "json",
                              error: function(jqXHR, textStatus, errorThrown) {
                                    console.log('error', errorThrown);
                              }
                            });

          const url='/api/post_select';
          var parametros = {"filter_value": filter_value, 
                            "field_value":param_result.column, 
                            "table_name":param_result.table_name,
                            "sort_id":param_result.sort_id
                           } 

          const response_det = await $.ajax({
                              data: JSON.stringify(parametros),
                              url : url,
                              method: 'POST',
                              contentType: "application/json",
                              dataType: "json",
                              error: function(jqXHR, textStatus, errorThrown) {
                                    console.log('error', errorThrown);
                              }
                            });
                                                                                     
          if (!response_det.ok) {
            // Extraer mensaje de error según el tipo de respuesta
            const errorMsg = response_det.error ||  (response_det.message || 'Error en la solicitud del detalle');   
            throw new Error(errorMsg);
          }
          //f_ui_mostrar_div_mensaje_modal(TIPO_MSG_OK, response_det.message);
            const dataJson_det= await response_det.data;
            // cargar datatable detalle_list
            this.f_retrieve_list(param_result.array_header, dataJson_det);
      } catch (error) {
        console.error("Error f_genera_headers_list:", error);
      }  
    },

    f_ui_inicializarFormulario : function () {     

    },
        
    f_modifica_filtro : function(){  

      $('.container_p div').each(function(key, value) {         
        if (key<2 || key==3){ $(this).addClass('hidden');}    
        if (key==2){ 
              $(this).removeClass('col-md-2').addClass('col-md-8').attr('style','');  
              $(this).find('span').html('Buscar por RUC o Razón Social :');
         }  
      });
      $('#ch_0').hide(); 
      $('#fec_ini').attr('type','text').attr("onkeyup","this.value=this.value.toUpperCase()").val(''); 
      console.log('f_modifica_filtro',   $('#fec_ini').val() );
    },
    
    ret_detalle_ini : async function  (xthis) {   
      f_ui_inicializar_div_mensaje_modal();   
      try {
            var row_id  = await $(xthis).closest('tr');
            var tabla   = await  $('#table1').DataTable();
            var set_row = await  tabla.row(row_id).data();    
            var key_ing = await  set_row.key_ing; 
            if ( key_ing.length==0 || key_ing.indexOf('-') < 0) {    
                throw new Error('La clave de busqueda no exite o no esta definida');        
            }            
            return  {ok:true, key_find:key_ing}
          } catch (error) {
            console.error("Error", error);
            return  {ok:false, message:error}
          }        
    },

    f_setvalues_head : async function  (key_ing, filename){
      try {     
            const url='/api/get_detalle';
            var parametros = {"opcion": filename, "key_unica":key_ing};     
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
            const key_ent=json_detalle.key_ref; 
              // Rellenar el formulario  mejorar para buscar dentro de un determinado div
            for (var key in values_data) {                  
                    if (values_data.hasOwnProperty(key)) {
                      var value = values_data[key];
                      // 1. Verificar si el campo es la fecha que quieres formatear (fec_reg)
                      // O podrías verificar si el valor tiene el formato ISO 8601 (contiene 'T')
                        if (( key === 'fec_ing' || key === 'fec_reg' ) && typeof value === 'string' && value.includes('T')) {
                            // Si es la fecha y es una cadena ISO 8601, extrae solo la parte de la fecha
                            value = value.substring(0, 10); // Toma los primeros 10 caracteres: "YYYY-MM-DD"
                        }
                      // 2. Asignar el valor (modificado o original) al input
                        $('#' + key).val(value);                    
                    }
            }
            $('#modalDetalleLabel').text('Guías de Recepción');
            $('#key_ing').val(key_ing);
            $('#key_ent').val(key_ent);
            this.f_ui_inicializarFormulario();
            //return  {msg_ok:true} 
            return  {ok:true}           
          } catch (error) {
            //return  {msg_ok:false, message:error}
            return  {ok:false, message:error}
          }
   },
          
    f_retrieve_list : async function (param_det, dataJSON_det) {        
       try {  
            let result_colname_d= param_det.colname;
            let result_head_d   = param_det.headers;
            let result_headwid_d= param_det.headwid;
            let result_colsus_d = param_det.colsus;
            let result_format_d = param_det.colpat;

            const cols_sumary   =[];
            const sumas_col = [3,5,6,7];
            cols_sumary.map( item => {  sumas_col.push(result_colname_d.indexOf(item));   });
            let btn_retrieve='1';
            let btn_ok=(typeof btn_retrieve=== 'undefined' || btn_retrieve[0]=='0')? '0' :'1';
            let pageTotal =0;
 
            let head_t='<tr role="row">'; 
              result_headwid_d.forEach(function (valuey, k , array) {       
                head_t +='<th class="ali_' + result_colsus_d[k] + '">' + result_head_d[k] + '</th>';    
              });
              head_t +='</tr>';
              $('#table1_a thead').html(head_t);
 
            var xaoColumnDefs=[]
            result_headwid_d.forEach(function (valuey, k , array) {            
              switch (k) {
                  default: valox = { "data": null,  "mRender":   (data, type, value) => {
                                  if (btn_ok=='1' && k==(result_headwid_d.length - 1)){
                         data_result='<div class="d-flex"><button type="Button" class="btn btn-link btn-sm" onclick="ue_delete_li(this);"><span class="glyphicon glyphicon-trash"></span></button><button type="Button" class="btn btn-link btn-sm" onclick="ue_modifica_li(this);"><span class="glyphicon glyphicon-check"></span></button></div>';                        
                                    } else {
                                      data_result=value[result_colname_d[k]];
                                      for_m=result_format_d[k];
                                      data_result=f_patterm(data_result, for_m);
                                    }
                                    return data_result;
                                  },  "class":'ali_' + result_colsus_d[k], "sWidth": result_headwid_d[k]};
                }
                xaoColumnDefs.push(valox);
            });

            if ($('#table1_a tfoot')) {    
                $('#table1_a tfoot').remove();
            }

            $("#table1_a").append( $('<tfoot/>').append( $("#table1_a thead tr").clone() ) );
            $('#table1_a tfoot tr:first').each(function () {
                $(this).find("th").each(function (j, val_j) {
                    $(val_j).html('');
                });
            });

            $('#table1_a').DataTable({
                "dom"       : "lrtip",
                "paging"    : false,
                "info"      : false,
                "autoWidth" : false,
                "destroy"   : true ,
                "data"      : dataJSON_det,
                "columns"   :  xaoColumnDefs ,
                "language"  : {"paginate": {"previous": "<<","next": ">>"}},

                "footerCallback": function ( row, data, start, end, display ) {
                    if (end > 0) {
                      var api = this.api();

                      sumas_col.forEach(function (col_n, ind_n, array) {
                        col_name=result_colname_d[col_n];
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
            }); 
 
       } catch (error) {
             console.error("Error f_genera_headers_list:", error);
       }           
    },  

/// nuevos
    ue_Aceptar : async function () {
  try {
    f_ui_inicializar_div_mensaje_modal();
    const data_json= await this.f_genera_json_upd ();
    const id_attr= $('#num_ruc').attr('id');
    const id_value=$('#num_ruc').val(); 
    const sw_y=$('#sw_y').val(); 
    const id={ [id_attr] : id_value }     
    //const id={ id_attr : id_value }  //prueba error
    
    const des_ent=$('#des_ent').val(); 
    
    if (des_ent.trim().length==0){
      throw new Error('Registre una Razón Social adecuada');
    }
    const parametros={filter_value: id, field_value : data_json, table_name:'dba.ct3a03'}
console.log('al_w1012.js  ue_Aceptar previo ',sw_y , parametros);    
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
console.log('al_w1012.js  ue_Aceptar result ',resultado);
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

    f_genera_json_upd : async function (){     
    let data = {};
    // Selecciona el formulario dentro del div "headPTR"
    //const $form = await $('#render_cabecera').find('form');
    const $form = await $('#render_cabecera');
console.log('f_genera_json_upd al_w1012 ',$form);  
    // Selecciona todos los elementos de entrada (input, select, textarea) con un id dentro del formulario
    $form.find('input[id], select[id], textarea[id]').each(await function() {
        const $el = $(this);
        const id = $el.attr('id');
        let value;
     if (id !='sw_y'  ){
        // Manejo específico para checkboxes y radio buttons
        if ($el.is(':checkbox')) {
            // Para checkboxes, el valor es true o false si está marcado o no.
            // Si necesitas el valor 'value' del atributo si está marcado, usa: $el.val()
            // Si el checkbox está desmarcado, no lo incluimos, a menos que quieras explícitamente 'false'.
            // Aquí lo incluiremos como true/false
            value = $el.is(':checked');
            data[id] = value;

        } else if ($el.is(':radio')) {
            // Para radio buttons, solo se considera el marcado
            if ($el.is(':checked')) {
                value = $el.val();
                data[id] = value;
                // NOTA: Si múltiples radio buttons tienen el mismo id (lo cual no es estándar)
                // este código los sobrescribiría. Asumiremos ids únicos por elemento.
            }
        } else {
            // Para el resto (text, number, select, textarea, hidden, etc.)
            value = $el.val();
            data[id] = value;
        }
     }   
    });

    return data;

    },

    ue_Cancela : function () {
      var $encabez = $('#encabez');    
      if ($encabez.length) { 
            const values_data=(filed_origen.rows_data)[0];
          // const key_fam_ref=(filed_origen.key_ref)[0];    
                for (var key in values_data) {                  
                    if (values_data.hasOwnProperty(key)) {
                      var value = values_data[key];
                        if (key === 'fec_reg' && typeof value === 'string' && value.includes('T')) {
                            value = value.substring(0, 10);
                        }
                        $('#' + key).val(value);                    
                    }
                }
              //$('#key_fam_ref').html( $('#key_fam').val() + ' | ' + key_fam_ref.des_fam);     
      } 
    }
    
}; 