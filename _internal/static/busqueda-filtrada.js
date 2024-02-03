const URL = "http://127.0.0.1:5000/";
var vinilos = [];

function cargarOpciones(){
    fetch(URL + 'vinilos')
    .then(function (response) {
        if (response.ok) {return response.json(); }
    })
    .then(function(data) {
        vinilos = data;
        // Obtener valores únicos para los selectores
        let interpretesUnicos = [...new Set(vinilos.map(vinilo => vinilo.interprete))];
        let añosUnicos = [...new Set(vinilos.map(vinilo => vinilo.lanzamiento))];

        // Llenar los selectores con valores únicos
        let interpreteSelect = document.getElementById('interpreteSelect');
        let optionInterpretePredeterminado = document.createElement('option');
        optionInterpretePredeterminado.text = ''; // Valor nulo
        interpreteSelect.add(optionInterpretePredeterminado);
        interpreteSelect.style.textAlign = 'center';
        
        let lanzamientoSelect = document.getElementById('lanzamientoSelect');
        let optionLanzamientoPredeterminado = document.createElement('option');
        optionLanzamientoPredeterminado.text = ''; // Valor nulo
        lanzamientoSelect.add(optionLanzamientoPredeterminado);
        lanzamientoSelect.style.textAlign = 'center';

        interpretesUnicos.forEach(interprete => {
            let option = document.createElement('option');
            option.text = interprete;
            interpreteSelect.add(option);
        });
        
        // Ordenar el selector de lanzamiento de menor a mayor
        añosUnicos.sort((a, b) => a - b);
        // Crear opciones por década desde 1920 hasta 2020
        for (let año = 1960; año <= 2020; año += 10) {  
        let option = document.createElement('option');
        option.text = `${año}`;
        lanzamientoSelect.add(option);
        }
    })
    .catch(error => console.error('Error:', error))
}

document.addEventListener('DOMContentLoaded', function () {
    let tablaBusqueda = document.getElementById("tabla-busqueda");
    tablaBusqueda.style.display = "none";
    cargarOpciones();
    tablaOculta();
});

function fadein(){
    let fade = document.getElementById("tabla-busqueda") 
	let opacity = 0; 
	fade.style.opacity = opacity;
    fade.style.display = "table";
	let intervalID = setInterval(function() { 
		if (opacity < 1) { 
			opacity = opacity + 0.75; 
			fade.style.opacity = opacity;
		} else { 
			clearInterval(intervalID);
		} 
	},100);     
}

function fadeout(){
    let fade= document.getElementById("tabla-busqueda"); 
    let intervalID = setInterval(function () { 
        
        if (fade.style.opacity > 0) { 
            fade.style.opacity -= 0.75;
        }else { 
            clearInterval(intervalID); 
        }
        if(opacity >= 1)
            fade.style.display = "none"; 
    },100);    
    
    
}

function tablaVisible(){
    let tablaBusqueda = document.getElementById("tabla-busqueda")
    fadein();
    tablaBusqueda.style.display = 'table'
    let footerBusqueda = document.getElementById("footer-busqueda-filtrada");
    footerBusqueda.classList.remove("tabla-oculta");
}

function tablaOculta(){
    fadeout();
    //tablaBusqueda.style.display = 'none';
    let footerBusqueda = document.getElementById("footer-busqueda-filtrada");
    footerBusqueda.classList.add("tabla-oculta");
}

function filtrarVinilos(){
    let interprete = document.getElementById("interpreteSelect"); 
    let lanzamiento = document.getElementById("lanzamientoSelect"); 
    let tablaBusqueda = document.getElementById("tabla-busqueda");
    //tablaBusqueda.style.display = "block";
    if(interprete.value == '' && lanzamiento.value == ''){
        alert("Elegí un parámetro de búsqueda! \n--Para ver toda la coleccion clickea en 'Coleccion completa'--");
        //tablaBusqueda.style.display = "none";    
        tablaOculta();        
    }else{
        if(interprete.value != '' && lanzamiento.value != ''){
            filtradoDoble(interprete.value, lanzamiento.value);
        }else{
            if(interprete.value == '' ){
                filtrarPorAño(lanzamiento.value);
            }else
                filtrarPorInterprete(interprete.value);
        }
    }
}

function filtradoDoble(interprete, decada){
    //console.log("Acceso al Filtrado Doble: " + interprete + " + " + decada);
    let URLcompleta = URL + 'vinilos/'+ interprete;
    //console.log(URLcompleta) 
    fetch(URLcompleta)
    .then(function (response) {
        if (response.ok) {return response.json(); }
    })
    .then(function(data) {
        //console.log(data)
        cargarFilaDoble(data,decada,interprete);
    })
    .catch(error => console.error('Error:', error))
}

function filtrarPorAño(decada){
    //console.log("Acceso a Filtrar Por Década " + decada);
    let tablaVinilos = document.getElementById("tablaFiltrada");
    tablaVinilos.innerHTML = ''
    let decadaInicio = parseInt(decada,10);
    let sigDecada = decadaInicio + 10;
    let cantidad = 0;
    let cantidadFiltrada = document.getElementById("cantidad-filtrada");

    for(let vinilo of vinilos){
    //console.log("Desde cargar fila doble: " +vinilo.lanzamiento);
        if((vinilo.lanzamiento >= decadaInicio) && (vinilo.lanzamiento < sigDecada)){
            cantidad += 1; 
            let fila = crearFila(vinilo);
            //console.log("Fila: " +fila);
            tablaVinilos.appendChild(fila);
        }
    }
    if(cantidad > 0){
        if(cantidad == 1){
            cantidadFiltrada.innerHTML = 'Hay <strong>' + cantidad + '</strong> vinilo de la decada <strong>' + decada + '</strong> en la colección'
        }else
            cantidadFiltrada.innerHTML = 'Hay <strong>' + cantidad + '</strong> vinilos de la decada <strong>' + decada + '</strong> en la colección'
        tablaVisible();
    }else{
        tablaOculta();
        cantidadFiltrada.innerHTML = 'No hay vinilos de la decada de ' + decada + ' en la coleccion';
    }
}

function filtrarPorInterprete(interprete){
    console.log("Acceso a Filtrar Por Interprete " + interprete);
    const URLcompleta = URL + 'vinilos/' + encodeURIComponent(interprete);
    //console.log(URLcompleta);
    let tablaVinilos = document.getElementById("tablaFiltrada");
    tablaVinilos.innerHTML = '';
    fetch(URLcompleta)
    .then(function (response) {
            if (response.ok) {return response.json(); }
    })
    .then(function(data){
        console.log(data.length);
        cargarFila(data,interprete);
    })
    .catch(error => console.error('Error:', error, " - Detalle: "))
}


function cargarFilaDoble(data, decada,interprete){
    let tablaVinilos = document.getElementById("tablaFiltrada");
    tablaVinilos.innerHTML = '';
    let decadaInicio = parseInt(decada,10);
    let sigDecada = decadaInicio + 10;
    cantidad = 0;
    for(let vinilo of data){
        //console.log("Desde cargar fila doble: " +vinilo.lanzamiento);
        if((vinilo.lanzamiento >= decadaInicio) && (vinilo.lanzamiento < sigDecada)){
            cantidad += 1;
            let fila = crearFila(vinilo);
            //console.log("Fila: " +fila);
            tablaVinilos.appendChild(fila);
        }
    }
    let cantidadFiltrada = document.getElementById("cantidad-filtrada");
    if(cantidad>0){
        if(cantidad == 1){
            cantidadFiltrada.innerHTML = 'Hay <strong>' + cantidad + '</strong> vinilo de <strong>' + interprete + ' </strong> de la decada <strong>' + decada + '</strong> en la colección'
        }else
            cantidadFiltrada.innerHTML = 'Hay <strong>' + cantidad + '</strong> vinilos de <strong>' + interprete + ' </strong> de la decada <strong>' + decada + '</strong> en la colección'
        tablaVisible();
    }else{
        tablaOculta();
        cantidadFiltrada.innerHTML = 'No hay vinilos de <strong>' + interprete + ' </strong> de la decada <strong>' + decada + '</strong> en la colección'
    }
}

function cargarFila(data,interprete){
    let tablaVinilos = document.getElementById("tablaFiltrada");
    tablaVinilos.innerHTML = '';
    for(let vinilo of data){
        let fila = crearFila(vinilo);
        tablaVinilos.appendChild(fila);
    }
    let cantidadFiltrada = document.getElementById("cantidad-filtrada");
    if(data.length == 1){
        cantidadFiltrada.innerHTML = 'Hay <strong>' + data.length + '</strong> vinilo de <strong>' + interprete + '</strong> en la colección';
    }else
        cantidadFiltrada.innerHTML = 'Hay <strong>' + data.length + '</strong> vinilos de <strong>' + interprete + '</strong> en la colección';
    tablaVisible();
}

function crearFila(vinilo){
    let fila = document.createElement('tr');
    fila.innerHTML = 
                '<td align="center">' + vinilo.codigo + '</td>'+
                '<td align="center">' + vinilo.interprete + '</td>' +
                '<td align="center">' + vinilo.album + '</td>' +
                '<td align="center">' + vinilo.lanzamiento + '</td>' +
                '<td align="center">' + vinilo.estado + '</td>' +
                '<td align="center">' + vinilo.codigo + '</td>' +
                '<td align="center">' + vinilo.comentario + '</td>';
    return fila;
}
