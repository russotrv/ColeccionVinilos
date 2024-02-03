const URL = "http://127.0.0.1:5000/"

document.addEventListener('DOMContentLoaded', function () {
    var interprete = document.getElementById("interprete")
    var album = document.getElementById("album")
    var lanzamiento = document.getElementById("lanzamiento")
    var estado = document.getElementById("estado")
    var comentario = document.getElementById("comentario")

    function agregarVinilo(e){
        e.preventDefault();   

        let interpreteValor = interprete.value;
        let albumValor = album.value;
        let lanzamientoValor = lanzamiento.value;
        let estadoValor = estado.value;
        let comentarioValor = comentario.value;

        if(interpreteValor == '' || albumValor == '' || lanzamientoValor == ''){
            alert("Datos incompletos!");
        }else{
            var formData = new FormData();
            formData.append('interprete', interpreteValor);
            formData.append('album', albumValor);
            formData.append('lanzamiento', lanzamientoValor);
            formData.append('estado', estadoValor);
            formData.append('comentario', comentarioValor);

            fetch(URL + 'vinilos', {
                method: 'POST',
                body: formData // Aquí enviamos formData en lugar de JSON
            })
            .then(function (response) {
                if (response.ok) { return response.json(); }
            })
            .then(function (data) {
                alert('Vinilo agregado correctamente.');
                // Limpiar el formulario para el proximo producto
                limpiarCampos()
            })
            .catch(function (error) {
                // Mostramos el error, y no limpiamos el form.
                alert('Error al agregar el producto.' + error);
            });
        }
    }

    function limpiarCampos(){
        album.value = '';
        lanzamiento.value = '';
        interprete.value = '';
        estado.value = '';
        comentario.value = ''; 
    }

    let btnEnviar = document.getElementById("btnEnviar");
    btnEnviar.addEventListener("click", agregarVinilo);

    let btnCancelar = document.getElementById("btnCancelar");
    btnCancelar.addEventListener("click", limpiarCampos)

});