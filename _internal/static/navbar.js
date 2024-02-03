document.addEventListener('DOMContentLoaded', function () {
    const menuHamburguesa = document.querySelector('.menu-hamburguesa');
    const menuDesplegable = document.querySelector('.menu-desplegable');
    const barra = document.querySelectorAll('.barra')
    let menuAbierto = false;

    menuHamburguesa.addEventListener('click', function () {
    menuAbierto = !menuAbierto;
    if (menuAbierto) {
        menuDesplegable.style.left = '0';
        menuHamburguesa.classList.add("barra-activa")

    } else {
        menuDesplegable.style.left = '-250px';
        menuHamburguesa.classList.remove("barra-activa")
    }
    });

    // Cerrar el menú si se hace clic fuera de él
    document.addEventListener('click', function (event) {
    const estaDentroDelMenu = menuHamburguesa.contains(event.target) || menuDesplegable.contains(event.target);

    if (!estaDentroDelMenu && menuAbierto) {
        menuAbierto = false;
        menuDesplegable.style.left = '-250px';
    }
    });
});