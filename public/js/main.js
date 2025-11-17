//Inicializa variables globales
var TIPO_MSG_OK = "OK";
var TIPO_MSG_S  = "S";
var TIPO_MSG_ERROR = "ERROR";
var objGets = {};
let filed_origen={}
//var table_main = null;

$(function() {
  f_getree(); 
 
    ///////////////////////////////////////////////////
              // Evento delegado para todos los dropdown-toggle (presentes y futuros)
              $(document).on('click', '#sidebar-menu .dropdown-toggle', function(e) {
                  e.preventDefault();
                  e.stopPropagation();

                  var $toggle = $(this);
                  var target = $toggle.attr('href');
                  var $target = $(target);

                  // Cerrar otros menús si quieres accordion behavior
                  $toggle.closest('ul').find('.collapse.in').not($target).collapse('hide');

                  // Toggle del menú actual
                  $target.collapse('toggle');

                  // Manejar estado active
                  if ($target.hasClass('in')) {
                      $toggle.closest('li').addClass('active');
                  } else {
                      $toggle.closest('li').removeClass('active');
                  }
                  
                  $('#body_content').attr('file_name','').addClass('hidden');
                  const t_title_module= $(this).html(); 
                  $('#titulo_menu').html(t_title_module + ' »»');
              });

              // Inicializar collapses existentes              
              $('#sidebar-menu .collapse').collapse({
                  toggle: false
              });               
    ///////////////////////////////////////////////////
  // Manejo de clic en barra lateral

  // Inicializar con página home
  $('#sidebar ul li.active').trigger('click');
  f_validsession();             

});

$(document).ready(function() {
    ui_inicializar_barra_filtro();

    // Manejar logout
    $('#logout').click(function() {
    // Puedes agregar lógica para cerrar sesión en backend si es necesario
    //spinner.hide();
    if (confirm('Está seguro que desea cerrar la sesión?'))  {
       window.location.href = '/auth/logout';
    }
    });     

    $('#set_users').click(function(event) { 
        event.preventDefault();
        const $elementoClickeado = $(this);
        const atributos = this.attributes;
        let infoAtributos = {}; // Objeto para almacenar los atributos
   
        $.each(atributos, function() {
            if (this.specified) {
                const nombreAtributo = this.name;
                const valorAtributo = this.value;
                infoAtributos[nombreAtributo] = valorAtributo;
            }
        });
        const fileName = $elementoClickeado.attr('file_name');               
        var scriptUrl = '/js/' + fileName + '.js'; 
         if ($.fn.dataTable.isDataTable('#table1')) {
                table = $('#table1').DataTable();
                table.destroy();                
         }
  
        if ($('#table1 tbody tr').length > 0) {    
            $('#table1 tbody').empty('');
            $('#table1_filter').remove();
            $('#table1_info').remove();
            $('#table1_paginate').remove();    
        }
        
        if ($('#table1 tfoot')) {    
            $('#table1 tfoot').remove();
        }

        if (!objGets[fileName]) {                   
                // Cargar el script y guardar referencia
                $.getScript(scriptUrl)
                    .done( async function() {
                        objetoRef = window[fileName]; // referencia al objeto definido en el script
//console.log(fileName, scriptUrl, objetoRef );                         
                        if (objetoRef && typeof objetoRef.f_get_head === 'function') {
                            objGets[fileName] = objetoRef;
                            vgetHead =  await objetoRef.f_get_head();                                       
 //console.log('paso 1', fileName, vgetHead.head_t );                            
                            $('#table1 thead').html(vgetHead.head_t);
                        } else {
                            $('#body_content').attr('file_name','').addClass('hidden'); 
                        }
                    })
                    .fail(function() {
                        //console.log('Error cargando ' + scriptUrl);
                        $('#body_content').attr('file_name','').addClass('hidden'); 
                    });
            } else {
               (async () => {
                    // Usar referencia ya cargada
                    objetoRef = await objGets[fileName];            
                    if (typeof objetoRef.f_get_head === 'function') {
                            vgetHead =  await objetoRef.f_get_head();
  //console.log('paso 2c',fileName, vgetHead.head_t);                                     
                            $('#table1 thead').html(vgetHead.head_t);
                    }
               })();  
            }

        $('#body_content').attr('file_name',fileName).removeClass('hidden');
        $('#titulo_opcion').html('setUp Users »»');
 
        $('#modal-body').load('../' + fileName + '.html', function(responseText, textStatus, xhr) {
            if (textStatus === "error") {
                 var msg = "Hubo un error al cargar el archivo: ";                
                 if (xhr.status === 404) {
                     $('#modal-body').html('<p class="alert alert-danger">Error: El archivo que intentas cargar no existe.</p>');
                } else {
                     $('#modal-body').html('<p class="alert alert-danger">Error al cargar el contenido.</p>');
                }                
            } else {
                //console.log("Archivo cargado exitosamente: " + '../' + fileName + '.html');
                // Aquí puedes ejecutar código adicional si la carga fue exitosa                
            }
        });                  
    });

    $('#g_Nuevo').click(async function() {         
        f_ui_inicializar_div_mensaje();         
        const fileName=$('#body_content').attr('file_name'); 
        var objetoRef = await objGets[fileName];
        if (typeof objetoRef.ue_nuevo_ini === 'function') {               
            var msg_ini=await objetoRef.ue_nuevo_ini();             
            if ( msg_ini==TIPO_MSG_OK) {       
                $('#render_form').show();
                $('#modalDetalle').modal('show'); 
            }              
        } else {
            console.error('f_mostrar no está definido en ' + fileName);
        }         
    });     

    $('#g_Most').click( async function() {          
        $('#spinner').show();

        if ($('#table1 tfoot')) {    
            $('#table1 tfoot').remove();
        } 

        const fileName=$('#body_content').attr('file_name'); 
        var objetoRef = await objGets[fileName];
        await f_mostrar();
        $('#spinner').hide(); 

        // if (typeof objetoRef.f_mostrar === 'function') {               
        //     await objetoRef.f_mostrar();
        //     $('#spinner').hide();                  
        // } else {
        //     console.error('f_mostrar no está definido en ' + fileName);
        //     $('#spinner').hide();
        // }

    });
   
  f_ui_inicia_modal();
  f_ui_inicia_modal_ayuda();

    // Limpiar el modal al cerrar (opcional)
    $('#modalDetalle').on('hidden.bs.modal', function (e) {
        var $encabez = $('#encabez');    
        if ($encabez.length) { 
            $encabez[0].reset();       
            // Alternativamente, puedes usar el método .each() para asegurarte
            // de que se llama a reset() en los elementos encontrados:
            // $encabez.each(function() {
            //     this.reset();
            // });        
        } else {
            // El elemento '#encabez' NO existe, no se hace nada
            //console.warn("Advertencia: El elemento '#encabez' no fue encontrado en el DOM.");
        }
    });

///**************************** */
    (async () => {
         const modalContent = await fetch('/api/msg_modal');
         const modalhtml = await modalContent.json();
         $('.modal-msg').html(modalhtml);  
       })(); 
///**************************** */
});

async function f_validsession(){
  try {
    const response = await  fetch('/api/users');
    if (!response.ok) {
      window.location.href = '/auth/logout';
    }
  } catch (error) {
    console.error("Error al validar session:", error);
  }
 }

async function f_getree(){
  try {
    const response = await  fetch('/api/tree');
    if (!response.ok) {      
    }
     const Mmodules = await response.json();     
    f_genera_tree (Mmodules);
    f_asigna_acceso();
  } catch (error) {
    console.error("Error al generar menu:", error);
  }
 }

function f_genera_tree (Mmodules){

 const ModuleLink =Mmodules.ModuleLink;
 const ModuleList =Mmodules.ModuleList;
 const tree_modite=Mmodules.tree_modite;

 const sidebarList = document.getElementById('sidebar-menu'); // 1. Contenedor

   ModuleLink.forEach( async function(colIndex,id) {
    let listItem = document.createElement('li');
    if (id==0) {listItem.classList.add('active');}
    let anchor = document.createElement('a');
        anchor.href = "#" +colIndex + "Submenu";
        anchor.textContent = ModuleList[colIndex];
        anchor.setAttribute('data-toggle', 'collapse');
        anchor.setAttribute('aria-expanded', 'false');
        anchor.classList.add('dropdown-toggle');
        listItem.appendChild(anchor);

     let listSubItem = document.createElement('ul');
      listSubItem.classList.add('collapse','list-unstyled');
      listSubItem.setAttribute('id',  colIndex + "Submenu");
      listItem.appendChild(listSubItem);

      let subvalue=tree_modite[colIndex];
      if (subvalue){
          subvalue.forEach(item => {
            let SubItem = document.createElement('li');
            let anchor2 = document.createElement('a');
                anchor2.href = "#"; 
                anchor2.setAttribute('file_name', item.file_name);
                anchor2.textContent =item.des_name;
                SubItem.appendChild(anchor2);
            listSubItem.appendChild(SubItem);
           });
      }
      listItem.appendChild(listSubItem);
    // 5. Insertar
    sidebarList.appendChild(listItem);
  }); 

}

function f_asigna_acceso(){
    let objetoRef = {}
    let vgetHead = '';
 /////////////////////////////////////
    // 1. Seleccionar todos los elementos <a> que tienen el atributo 'file_name'
    // y son descendientes de un <li>.
    const $linksConAtributo = $('li > a[file_name]');

    // 2. Adjuntar el evento 'click' a todos los elementos seleccionados.
    $linksConAtributo.on('click', function(event) {
        // Prevenir la acción por defecto del enlace (navegación)
        event.preventDefault();

        // 'this' hace referencia al elemento DOM subyacente (el <a> clickeado)
        // Usamos $(this) para obtener el objeto jQuery del elemento clickeado
        const $elementoClickeado = $(this);

        // 3. Obtener todos los atributos del elemento.
        // La propiedad 'attributes' del elemento DOM original (this) es la clave.
        const atributos = this.attributes;
        let infoAtributos = {}; // Objeto para almacenar los atributos

       // console.log($elementoClickeado.text()); // Obtener el texto interno ('Prueba')

        // 3.1. Iterar sobre la colección de atributos
        $.each(atributos, function() {
            if (this.specified) {
                const nombreAtributo = this.name;
                const valorAtributo = this.value;
                infoAtributos[nombreAtributo] = valorAtributo;
            }
        });

        // Ejemplo de cómo obtener un atributo específico con el método .attr() de jQuery
        const fileName = $elementoClickeado.attr('file_name');               
        var scriptUrl = '/js/' + fileName + '.js'; // asumiendo que tus archivos están en la misma ruta             

            // Check if a DataTables instance already exists on '#myTable'
            if ($.fn.dataTable.isDataTable('#table1')) {
                // Get the DataTables API instance
                table = $('#table1').DataTable();
                // Destroy the existing instance
                table.destroy();                
            }
  
        if ($('#table1 tbody tr').length > 0) {    
            $('#table1 tbody').empty('');
            $('#table1_filter').remove();
            $('#table1_info').remove();
            $('#table1_paginate').remove();    
        }
        
        if ($('#table1 tfoot')) {    
            $('#table1 tfoot').remove();
        }
              
        if (!objGets[fileName]) {        
                // Cargar el script y guardar referencia
                $.getScript(scriptUrl)
                    .done( async function() {
                        objetoRef = window[fileName]; // referencia al objeto definido en el script
                        if (objetoRef && typeof objetoRef.f_get_head === 'function') {
                            objGets[fileName] = objetoRef;
                            vgetHead =  await objetoRef.f_get_head();                                       
//console.log('paso 1', fileName, vgetHead.head_t, 'fecha', $('#fec_ini').val() ); 
                            $('#table1 thead').html(vgetHead.head_t);
                        } else {
                            $('#body_content').attr('file_name','').addClass('hidden'); 
                        }
                    })
                    .fail(function() {
                        //console.log('Error cargando ' + scriptUrl);
                        $('#body_content').attr('file_name','').addClass('hidden'); 
                    });
            } else {
               (async () => {
                    // Usar referencia ya cargada
                    objetoRef = await objGets[fileName];            
                    if (typeof objetoRef.f_get_head === 'function') {
                            vgetHead =  await objetoRef.f_get_head();
//   console.log('paso 2c',fileName, vgetHead.head_t,'fecha', $('#fec_ini').val());
                            $('#table1 thead').html(vgetHead.head_t);
                    }
               })();  
            }

        $('#body_content').attr('file_name',fileName).removeClass('hidden');
        $('#titulo_opcion').html($elementoClickeado.text() + ' »»');
//console.log('click menu',  'fecha ', $('#fec_ini').val());                 

        $('#modal-body').load('../' + fileName + '.html', function(responseText, textStatus, xhr) {
            if (textStatus === "error") {
                // El archivo NO existe (o hubo otro error de carga)                
                var msg = "Hubo un error al cargar el archivo: ";                
                // El código de estado 404 indica que el recurso no se encontró
                if (xhr.status === 404) {
                   // console.error(msg + "Archivo no encontrado (404) para: " + '../' + fileName + '.html');
                    // Por ejemplo, puedes mostrar un mensaje de error al usuario
                    $('#modal-body').html('<p class="alert alert-danger">Error: El archivo que intentas cargar no existe.</p>');
                } else {
                  //  console.error(msg + xhr.status + " " + xhr.statusText);
                    $('#modal-body').html('<p class="alert alert-danger">Error al cargar el contenido.</p>');
                }                
            } else {
                // El archivo SÍ existe y se ha cargado correctamente
               //console.log("Archivo cargado exitosamente: " + '../' + fileName + '.html');
                // Aquí puedes ejecutar código adicional si la carga fue exitosa
            }
        });

    }); 

}

// Función para cargar tabla con datos del servidor
function loadUsersTable() {
    $('#render_data').html('<table id="usersTable" class="display" style="width:100%"></table>');
    $('#usersTable').DataTable({
      ajax: {
        url: '/api/users',
        dataSrc: ''
      },
      columns: [
        { title: "ID", data: 'id' },
        { title: "Nombre", data: 'nombre' },
        { title: "Email", data: 'email' }
      ],
      destroy: true // permite reinicializar DataTable si ya existe
    });
}

function obtenerIdUlPadre(fileName) {
  // 1. Localiza el elemento <a> con el atributo file_name igual al valor pasado.
  //    (Utiliza un selector de atributo: [file_name="valor"])
  var $enlace = $(`a[file_name="${fileName}"]`);

  // 2. Verifica si el enlace fue encontrado.
  if ($enlace.length === 0) {
    //console.log(`No se encontró un enlace con file_name="${fileName}"`);
    return null; // Retorna null si no se encuentra
  }

  // 3. Usa .closest() para encontrar el ancestro <ul> más cercano.
  var $ulPadre = $enlace.closest('ul');

  // 4. Retorna el atributo 'id' de ese elemento <ul>.
  var patter= $ulPadre.attr('id');   patter= patter.replace('Submenu','');
  return patter;
}

async function f_genera_filtro() {
    f_ui_inicializar_div_mensaje();          
    const param_file= await $('#body_content').attr('file_name'); 
  if (param_file !== undefined ){ 
    try {
        const param_mod = await obtenerIdUlPadre(param_file);
        const url = `/api/render_filtro?param_mod=${param_mod}&param_file=${param_file}`; 
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error("Error al generar filtro ");  
        }
        const MmodFilters = await response.json();
        const default_value=MmodFilters.default_value
    
        $('#param_anio').html(MmodFilters.param_anio);
        const cadena_meses=f_ui_generar_cadena_select(MmodFilters.param_mess, default_value.param_mess);
        $('#param_mess').html(cadena_meses);
        $('#fec_ini').val( ($('#fec_ini').attr('type')=='text')? '' : MmodFilters.fec_ini); 
        $('#fec_ini').on('keypress', function(event) {
            if (event.key === 'Enter' || event.which === 13) {
            event.preventDefault();
            $('#g_Most').trigger('click');
            event.target.blur();
            }
        });   

    if (MmodFilters.serlca === undefined && param_mod!='CA') {
      throw { type: 'NO_RECORD',   message: 'Asignar una Sigla y Serie para esta Ventana, Comunicar al Administrador del Sistema'};
    }        
    
     let cadena_serlca='';
    if ( param_mod!='CA') {
       cadena_serlca=await f_ui_generar_cadena_select(MmodFilters.serlca, '');
    }    
        $('#serlca').html(cadena_serlca);
    } catch (error) {
       // console.error("Error:", error);
        f_ui_mostrar_div_mensaje(TIPO_MSG_ERROR, error.message);
    }                       
  }            
}

function f_ui_generar_cadena_select(obj_valor, valor_defecto){
    let cadena='';    
    Object.entries(obj_valor).forEach(([key, value]) =>  {
          let opt_selected = ( key == valor_defecto )? 'selected ': '';
          cadena += '<option '  + opt_selected + 'value="' + key +'">' + value + '</option>';
    });
    return cadena;
}

function f_ui_showLoading(){
    $(".mask").show();
    $("#loader").show();
}
function f_ui_hideLoading(){
    $(".mask").hide();
    $("#loader").hide();
}

function f_ui_inicia_ayuda() {
    $("#iframe_ayuda").contents().find("body").html('');
    $('.modal-dialog-ayuda').draggable();
    $('#modal_ayuda .modal-dialog-ayuda .modal-content .modal-header .modal-title').html('Ayuda');
    $('#modal_ayuda .modal-dialog-ayuda .modal-content .modal-header').css('cursor','move');
    $('#modal_ayuda .modal-dialog-ayuda').css('width','635px');
    $('#iframe_ayuda').css('height','350px');
    if (screen.width < 1024) {  $('#modal_ayuda .modal-dialog-ayuda').css('width','100%'); }
}

function f_ui_inicia_modal() {
    $('#modalDetalle .modal-dialog').css( {'width':'1135px','margin-left':'230px'});
}
function f_ui_inicia_modal_ayuda() {
    //$("#iframe_ayuda").contents().find("body").html('');
    //$('.modal-dialog-ayuda').draggable();
    //$('#modal_ayuda .modal-dialog-ayuda .modal-content .modal-header .modal-title').html('Ayuda');
    //$('#modal_ayuda .modal-dialog-ayuda .modal-content .modal-header').css('cursor','move');
    $('#modal_ayuda .modal-dialog-ayuda').css( {'width':'45%','margin-left':'308px'});
    //$('#iframe_ayuda').css('height','450px');
    //if (screen.width < 1024) {  $('#modal_ayuda .modal-dialog-ayuda').css('width','100%'); }
}

function f_fechaNow(){
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');  
    const dia = String(fecha.getDate()).padStart(2, '0');
    const fechaFormateada = `${año}-${mes}-${dia}`;
    return fechaFormateada;    
}
function f_horaNow(){
    var now     = new Date();
    var hora    = String(now.getHours()).padStart(2, '0');
    var minu    = String(now.getMinutes()).padStart(2, '0'); 
    var segu    = String(now.getSeconds()).padStart(2, '0'); 
    var horaformateada =  `${hora}:${minu}:${segu}`;
    return horaformateada; 
}
/************************************************************************/
/***** Muestra Registro Unico seleccionado de Grilla Principal ************/
/************************************************************************/
async function f_mostrar () {
      f_ui_inicializar_div_mensaje();
      let msg=''; let sw_1=0;
      const filename= $('#body_content').attr('file_name');
      
      const param_anio=$('#param_anio').val();
      const param_mess=$('#param_mess').val();
      let serlca    =$('#serlca').val();      serlca=(serlca==null)? '||' : serlca;
      const param_find=$('#fec_ini').val();

      if (filename.length==0){sw_1++; msg='Se ha producido un erro de asignación, consultar al proveedor del sistema';}
      if (param_anio.length==0 || param_mess.length==0){sw_1++; msg='Escojer un Año y Mes a Buscar';}
      if (sw_1>0){
        f_ui_mostrar_div_mensaje(TIPO_MSG_ERROR, msg);
        f_ui_hideLoading();
        return false;
      } else {             
          const url='/api/select_gGeneral';
          var parametros = {"opcion": filename, "param_find" : param_anio + '|' +  param_mess + '|' + serlca+ '|' + param_find} ;    
//console.log('parametros',parametros );
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
                const objetoRef = await objGets[filename];            
                if (typeof objetoRef.f_retrieve === 'function') {                                            
                    const response= await objetoRef.f_retrieve(dataJSON);   
                } 
                f_ui_hideLoading();  
       }
}

async function get_values () {
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
}

async function f_genera_headers () {
      try {        
          array_field=  await get_values();

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
        const retorno_var={result_colname : result_colname, result_headwid:result_headwid, result_colsus:result_colsus, result_format:result_format, head_t:head_t}
        return retorno_var; 
      } catch (error) {
        console.error("Error f_genera_headers:", error);
      }  
    }

async function ret_detalle(xthis) {
 try {
    f_ui_inicializar_div_mensaje();
    const fileName  = await $('#body_content').attr('file_name');                                              
    const objetoRef = await objGets[fileName];            
    if (typeof objetoRef.ret_detalle_ini === 'function') {                                            
        const response= await objetoRef.ret_detalle_ini(xthis);  
        if ( !response.ok) {    
            throw new Error('A ocurrido un error al mostrar el registro :' + response.message);        
        }
        ret_registro(response.key_find, objetoRef, fileName);
    } else {
      throw new Error('No esta definida la función ret_detalle_ini');        
    }   
  } catch (error) {
    console.error("Error al mostrar el registro", error);
  }
}
async function ret_registro(key_unica, objetoRef, filename){
   try { 
        const response= await objetoRef.f_setvalues_head(key_unica, filename);         
        if ( !response.ok) {    
            throw new Error('Error :' + response.message);        
        }
          $('#sw_y').val('M');
          $('#render_form').show();
          $('#modalDetalle').modal('show'); 
        if (typeof objetoRef.f_genera_headers_list === 'function') {            
          const response_list= await objetoRef.f_genera_headers_list(key_unica, filename);          
        }
    } catch (error) {
        console.error("Error", error);
    }
}

async function f_Aceptar() {
    
    const fileName= await $('#body_content').attr('file_name');                                              
    const objetoRef = await objGets[fileName];            
    if (typeof objetoRef.ue_Aceptar === 'function') {                                            
        objetoRef.ue_Aceptar();  
    }
}

async function f_Cancela() {    
    const fileName= await $('#body_content').attr('file_name');                                              
    const objetoRef = await objGets[fileName];            
    if (typeof objetoRef.ue_Cancela === 'function') {                                            
        objetoRef.ue_Cancela();  
    }
}

/**********************************************************************/
/***** funciones para el tratamiento de errores   *********************/
/**********************************************************************/
function f_ui_inicializar_div_mensaje(){
    $('#render_body').animate({scrollTop: 0},'fast');       //mandar al top la pantalla

    $("#mensaje").hide();
    $("#mensaje .alert.alert-success").hide();
    $("#mensaje .alert.alert-info").hide();
    $("#mensaje .alert.alert-warning").hide();
    $("#mensaje .alert.alert-danger").hide();

    $("#mensaje .alert .titulo").html('');
    $("#mensaje .alert .mensaje").html('');
    $("#mensaje .alert .detalle").html('');
}

function f_ui_inicializar_div_mensaje_modal(){
    $('#render_body').animate({scrollTop: 0},'fast');       //mandar al top la pantalla

    $("#mensaje_modal").hide();
    $("#mensaje_modal .alert.alert-success").hide();
    $("#mensaje_modal .alert.alert-info").hide();
    $("#mensaje_modal .alert.alert-warning").hide();
    $("#mensaje_modal .alert.alert-danger").hide();

    $("#mensaje_modal .alert .titulo").html('');
    $("#mensaje_modal .alert .mensaje").html('');
    $("#mensaje_modal .alert .detalle").html('');
}

function f_ui_inicializar_div_mensaje_busqueda(){
    $('#render_body').animate({scrollTop: 0},'fast');       //mandar al top la pantalla

    $("#mensaje_busqueda").hide();
    $("#mensaje_busqueda .alert.alert-success").hide();
    $("#mensaje_busqueda .alert.alert-info").hide();
    $("#mensaje_busqueda .alert.alert-warning").hide();
    $("#mensaje_busqueda .alert.alert-danger").hide();

    $("#mensaje_busqueda .alert .titulo").html('');
    $("#mensaje_busqueda .alert .mensaje").html('');
    $("#mensaje_busqueda .alert .detalle").html('');
}
function f_ui_mostrar_div_mensaje(tipo, mensaje ,detalle){
    var id = "#mensaje";
    f_ui_mostrar_div_mensaje_generico(id, tipo, mensaje, detalle);
}
function f_ui_mostrar_div_mensaje_modal(tipo,mensaje,detalle){
    var id = "#mensaje_modal";
    f_ui_mostrar_div_mensaje_generico(id, tipo, mensaje, detalle);
}
function f_ui_mostrar_div_mensaje_busqueda(tipo,mensaje,detalle){
    var id = "#mensaje_busqueda";
    f_ui_mostrar_div_mensaje_generico(id, tipo, mensaje, detalle);
}

function f_ui_mostrar_div_mensaje_generico(id, tipo, mensaje, detalle){
    var titulo = '';
    var clase = '';

    $(id).show();
    if(tipo==TIPO_MSG_ERROR){
        titulo = 'Ocurrió un error';
        clase = ' .alert.alert-danger';
    }
    if(tipo==TIPO_MSG_OK){
        titulo = 'Éxito';
        clase = ' .alert.alert-success';
    }

    $(id + clase + " .mensaje").hide();
    $(id + clase + " .detalle").hide();

    $(id + clase).show();
    $(id + clase + " .titulo").html(titulo);

    if(mensaje != undefined && mensaje != ''){
        $(id + clase + " .mensaje").show();                         
        $(id + clase + " .mensaje").html(mensaje);
    }
    if(detalle != undefined && detalle != ''){
        $(id + clase + " .detalle").show();
        detalle = detalle.replace(/&lt;br \/&gt;/g, '<br />');
        $(id + clase + " .detalle").html(detalle);
    }
    $(".titulo").hide();
    $('#render_body').animate({scrollTop: 0},'fast');
}
function f_ui_manejar_mensaje(responseJSON){
    if(responseJSON !== undefined){
        var tipo = responseJSON.TIPO;
        var mensaje = responseJSON.MENSAJE;
        var detalle = responseJSON.DETALLE_MENSAJE;

        f_ui_inicializar_div_mensaje();
        f_ui_mostrar_div_mensaje(tipo, mensaje, detalle);
    }
}
function f_ui_manejar_mensaje_modal(responseJSON){
    if(responseJSON !== undefined && responseJSON!= null){
        var tipo = responseJSON.TIPO;
        var mensaje = responseJSON.MENSAJE;
        var detalle = responseJSON.DETALLE_MENSAJE;

        f_ui_inicializar_div_mensaje_modal();
        f_ui_mostrar_div_mensaje_modal(tipo, mensaje, detalle);
    }
}
function f_ui_manejar_mensaje_busqueda(responseJSON){
    if(responseJSON !== undefined && responseJSON!= null){
        var tipo = responseJSON.TIPO;
        var mensaje = responseJSON.MENSAJE;
        var detalle = responseJSON.DETALLE_MENSAJE;

        f_ui_inicializar_div_mensaje_modal();
        f_ui_mostrar_div_mensaje_busqueda(tipo, mensaje, detalle);
    }
}

function f_ui_manejar_mensaje_data(data){
    var op = 'C';
    if(op == 'C'){
        console.log(data);
    }else{
        $("#render_body").html(data);
    }
}

function f_ui_manejar_mensaje_error_jqgrid(jqXHR, textStatus, errorThrown){
    console.log("error");
    var op = 'C';
    if(op == 'C'){
        console.log('HTTP status code: ' + jqXHR.status + '\n' +
                'textStatus: ' + textStatus + '\n' +
                'errorThrown: ' + errorThrown);
        console.log('HTTP message body (jqXHR.responseText): ' + '\n' + jqXHR.responseText);
    }
}

function f_patterm(tvalue, for_m){
                switch (for_m.substring(0,1)) {
                    case 'f':  nr=for_m.substring(1,2); tvalue= tvalue.toString().padStart(nr, "0");       break;
                    case 'n':  nr=for_m.substring(1,2); tvalue=numberFormatter(tvalue, nr);     break;
                    case 't':                           tvalue=tvalue;                          break;
					default:                            tvalue=tvalue;   					    break;
                }
   return tvalue;
}

function numberFormatter(value, mdigit) {
  ceros='';
  for (var i=0; i<mdigit; i++){ ceros +='0'; }
  var currencyString = numeral (value).format('0,0.'+ceros);
  return currencyString;
}  

function ui_inicializar_barra_filtro(){
   let str_barra_filtro   ='<div class="col-md-2 col-xs-6" style="max-width: 11.66667%;">';   
        str_barra_filtro +='<span class="texto_formulario">Año:</span><select id="param_anio" class="form-control_t"></select></div>';
        str_barra_filtro +='<div class="col-md-2 col-xs-6" style="max-width: 14.66667%;">';
        str_barra_filtro +='<span class="texto_formulario">Mes:</span><select id="param_mess" class="form-control_t"></select></div>';
        str_barra_filtro +='<div class="col-md-2 col-xs-12" style="max-width: 18.66667%;">';
        str_barra_filtro +='<span class="texto_formulario">Fecha:</span>';
        str_barra_filtro +='<input type="checkbox" id="ch_0" onclick="ue_chet();" value="">';
        str_barra_filtro +='<input value="" type="date" class="form-control_t" id="fec_ini" style="width:118px;margin-left: 10px;"></div>';
        str_barra_filtro +='<div class="col-md-4 col-xs-12" style="max-width: 33.33332%;">';
        str_barra_filtro +='<select class="form-control_t" id="serlca" style="width: 330px;"></select></div>';
        str_barra_filtro +='<div class="col-md-2 col-xs-12" style="max-width: 21.66667%;"></div></div>';
   
  $('.container_p').html(str_barra_filtro);     
  f_genera_filtro();
} 

function generarCadenaParametroDetalle(array1, array2) {
    //const array1 = ['a', 'b', 'c'];
    //const array2 = ['agua', 'boca', 'casa'];
    const arrayCombine = Object.fromEntries(
      array1.map((key, index) => [key, array2[index]])
    );
    return arrayCombine;
}