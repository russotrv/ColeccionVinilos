const URL = "http://127.0.0.1:5000/";
document.addEventListener('DOMContentLoaded', function() {
    // Tu código aquí se ejecutará cuando el DOM esté completamente construido, antes de cargar imágenes y otros recursos
    fetch(URL + 'vinilos')
            .then(function (response) {
                if (response.ok) {return response.json(); }
            })
            .then(function (data) {
                let tablaVinilos = document.getElementById('listaVinilos');
                let id = 1;
                for(let vinilo of data){
                    let fila = document.createElement('tr');
                    fila.innerHTML = 
                    '<td align="center">' + id + '</td>'+
                    '<td align="center">' + vinilo.interprete + '</td>' +
                    '<td align="center">' + vinilo.album + '</td>' +
                    '<td align="center">' + vinilo.lanzamiento + '</td>' +
                    '<td align="center">' + vinilo.estado + '</td>' +
                    '<td align="center">' + vinilo.codigo + '</td>' +
                    '<td align="center">' + vinilo.comentario + '</td>' ;
                    tablaVinilos.appendChild(fila);
                    id +=1;
                }
            })
            .catch(function (error) {
                // Código para manejar errores
                alert('Error al obtener los productos.');
            });
});

