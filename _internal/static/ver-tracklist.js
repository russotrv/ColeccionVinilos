const URL = "http://127.0.0.1:5000/";
let vinilos = [];
let albumArtista = {};

function cargarFiltros(){
    fetch(URL + 'vinilos')
    .then(function (response) {
        if (response.ok) {return response.json(); }
    })
    .then(function(data) {
        vinilos = data;
        vinilos.forEach(vinilo => {
            const {album, interprete} = vinilo
                // Si el álbum aún no está en el objeto, agrégalo con un array vacío como valor
            if (!albumArtista.hasOwnProperty(album)) {
                albumArtista[album] = [];
        }

        // Agregar el nombre del artista al array correspondiente al álbum
        albumArtista[album].push(interprete);
        });
                
        // Obtener las claves del objeto (nombres de álbum)
        const clavesAlbumes = Object.keys(albumArtista);

        // Ordenar las claves alfabéticamente
        const clavesOrdenadas = clavesAlbumes.sort();
        
        let albumSelect = document.getElementById('nombre-album');
        let optionAlbumPredeterminado = document.createElement('option');
        optionAlbumPredeterminado.text = ''; // Valor nulo
        albumSelect.add(optionAlbumPredeterminado);
        albumSelect.style.textAlign = 'center';
        // Iterar sobre las claves ordenadas del objeto albumArtista
        clavesOrdenadas.forEach(album => {
            // Acceder a los valores asociados a cada clave (nombre del artista)
            const artistas = albumArtista[album];

            // Crear una opción para cada álbum y sus artistas asociados
            let option = document.createElement('option');
            option.text = `${album} : ${artistas.join(', ')}`;
            albumSelect.add(option);
        });        
    })
    .catch(error => console.error('Error:', error))
}

function tablaOculta(){
    let footerBusqueda = document.getElementById("footer-tracklist");
    footerBusqueda.classList.add("tabla-oculta");
    let listaTemas = document.getElementById("lista-temas");
    listaTemas.innerHTML = ''
    listaTemas.style.display = 'none'
}

document.addEventListener('DOMContentLoaded', function () {
    cargarFiltros();
    tablaOculta();
});


function buscarTemas(){
    let tituloAlbum = document.getElementById("titulo-album")
    tituloAlbum.innerHTML = 'Buscando Tracklist ...'
    tablaOculta();
    let listaTemas = document.getElementById("lista-temas");
    const albumSeleccionado = document.getElementById("nombre-album").value;

    // Dividir la cadena en nombre del álbum e intérprete
    const [album, interprete] = albumSeleccionado.split(' : ');
    const apellidoInterprete = interprete.split(' ')[0]
    let urlDisco = 'http://127.0.0.1:5000/tracklist/' + interprete + "/" + album 
    console.log(urlDisco)
    fetch(urlDisco)
        .then(function (response){
            if(response.ok){ return response.json()
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
        })
        .then(function(data){
            if(data){
                tituloAlbum.innerHTML = album + " - " + apellidoInterprete
                data.data.forEach(tema => {
                    let li = document.createElement('li');
                    li.innerHTML = tema.title
                    listaTemas.appendChild(li);
                });
                listaTemas.style.display = 'table'
                let footerBusqueda = document.getElementById("footer-tracklist");
                footerBusqueda.classList.remove("tabla-oculta");
            }
        })
        .catch(function (error) {
            // Código para manejar errores
            let p = document.createElement('p');
            p.innerHTML = "No hay información disponible de " + album +"  en DeezerAPI"
            listaTemas.appendChild(p);
            listaTemas.style.display = 'table'
            console.log("No se encontro " + album + " en Deezer")
            console.log("Error" + error);
        });
}
