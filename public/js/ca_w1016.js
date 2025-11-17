var ca_w1016 = {
    f_get_head : async function() {
        await ui_inicializar_barra_filtro();           
        await this.f_modifica_filtro();       
        const array_headers= await f_genera_headers();      
        return array_headers; 
    },

    ue_nuevo_ini : async function () {
      f_ui_inicializar_div_mensaje_modal();
      filed_origen={}

      const filename= $('#body_content').attr('file_name');
      const url='/api/last_row';
      var parametros = {"opcion": filename};    
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
      const values_data= await json_detalle[0];
    
        $('#cod_art').val(values_data.n_row);  
        $('#cod_bar').val(values_data.n_row);
        $('#key_fam_ref').html('');
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
  //var pageTotal =0;

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
   //     "lengthMenu": [ page_ln ],
        "destroy"   : true ,
        "data"      : dataJSON,
        "columns"   :  xaoColumnDefs ,
        "language"  : {"paginate": {"previous": "<<","next": ">>"}},
      ///////////////////////////////////////////////////////////////////////////////////////////////////
/*
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
*/
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
          $(xpo).find('input').attr('size','20').css('margin-left','6px');
          $(xpo).attr('id','f_find');          
          xpo.appendTo(this)
          }
     });   
  
     $('#f_find label').contents().filter(function() {
        return this.nodeType === 3; // Nodo de texto
     }).first().replaceWith('Filtro:');
   
////////////////////////////////////////////////////////////////////////////////
    },

    f_ui_inicializarFormulario : function () {     
    },
    
    f_modifica_filtro : function(){  
      /*
<div class="col-xs-12 cl_online col-md-4">
<span class="texto_formulario" id="ruc_txt" style="padding-left: 25px; color: rgb(1, 99, 172);">Carga Tipo de Cambio</span>
<button type="button" id="btnBuscarENT" size="6" class="btn btn-link btn-sm" title=""><span class="glyphicon glyphicon-cog"></span></button><button type="button" id="btnSUNAT" size="6" class="btn btn-link btn-sm" title="" style="padding-left: 30px;"><img src="includes/template/img/sunat.png" width="80" height="25"></button>
</div>      
      */
      $('.container_p div').each(function(key, value) {         
        //if (key==2 || key==3){ $(this).addClass('hidden');}  
      });
    },

    ret_detalle_ini : async function  (xthis) {   
      f_ui_inicializar_div_mensaje_modal();   
      try {
            var row_id  = await $(xthis).closest('tr');
            var tabla   = await  $('#table1').DataTable();
            var set_row = await  tabla.row(row_id).data();    
            var cod_art = await  set_row.cod_art; 
            if ( cod_art.length==0 || parseInt(cod_art) == 0) {    
                throw new Error('La clave de busqueda no exite o no esta definida');        
            }            
            return  {ok:true, key_find:cod_art}
          } catch (error) {
            console.error("Error", error);
            return  {ok:false, message:error}
          }        
    },
    f_setvalues_head : async function  (cod_art, filename){
      try {     
            const url='/api/get_detalle';
            var parametros = {"opcion": filename, "key_unica":cod_art};     
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
            const key_fam_ref=(json_detalle.key_ref)[0];
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
            $('#modalDetalleLabel').text('Artículos y Servicios');
            $('#key_fam_ref').html( $('#key_fam').val() + ' | ' + key_fam_ref.des_fam);
            this.f_ui_inicializarFormulario();
            //return  {msg_ok:true} 
            return  {ok:true}           
          } catch (error) {
            //return  {msg_ok:false, message:error}
            return  {ok:false, message:error}
          }
    },

    ue_Aceptar : async function () {
      try {                             
        f_ui_inicializar_div_mensaje_modal();
        const data_json= await this.f_genera_json_upd ();
        const id_attr= $('#cod_art').attr('id');
        const id_value=$('#cod_art').val(); 
        const sw_y=$('#sw_y').val(); 
        const id={ [id_attr] : id_value }     
        //const id={ id_attr : id_value }  //prueba error
        
        const des_art=$('#des_art').val(); 
        const key_fam=$('#key_fam').val(); 

        if (des_art.trim().length==0){
          throw new Error('Registre una Descripción adecuada');
        }
        const parametros={filter_value: id, field_value : data_json, table_name:'dba.ct3a02'}
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

    f_genera_json_upd :async function  (){     
    let data = {};
    // Selecciona el formulario dentro del div "headPTR"
    //const $form = await $('#render_cabecera').find('form');
    const $form = await $('#render_cabecera');
console.log('f_genera_json_upd ca_w1016 ',$form);  
    // Selecciona todos los elementos de entrada (input, select, textarea) con un id dentro del formulario
    $form.find('input[id], select[id], textarea[id]').each(await function() {
        const $el = $(this);
        const id = $el.attr('id');
        let value;
     if (id !='sw_y' && id !='key_fam_ref' && id !='hor_reg'  ){
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
            const key_fam_ref=(filed_origen.key_ref)[0];    
                for (var key in values_data) {                  
                    if (values_data.hasOwnProperty(key)) {
                      var value = values_data[key];
                        if (key === 'fec_reg' && typeof value === 'string' && value.includes('T')) {
                            value = value.substring(0, 10);
                        }
                        $('#' + key).val(value);                    
                    }
                }
              $('#key_fam_ref').html( $('#key_fam').val() + ' | ' + key_fam_ref.des_fam);     
      } 
    }
    
};
