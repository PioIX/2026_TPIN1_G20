//Código de DOM implementado por los docentes.

class UserInterface {
    constructor() {

    }

    /**
     * Obtiene el texto ingresado en el input "Correo electrónico", sección "Login".
     * @returns String que contiene el correo electrónico ingresado por el usuario.
     */
    getEmail() {
        return document.getElementById("email").value;
    }

    /**
     * Obtiene el texto ingresado en el input "Usuario", sección "Login".
     * @returns String que contiene el nombre de usuario.
     */
    getUser() {
        return document.getElementById("username").value;
    }

    /**
     * Modifica el nombre de usuario logueado presentado en pantalla.
     * @param {String} username Nombre del usuario logueado.
     */
    setUser(username) {
        document.getElementById("userLoged").textContent = `¡Bienvenido ${username}!`;
    }

    /**
     * Obtiene el texto ingresado en el input "Contraseña", sección "Login".
     * @returns String que contiene la contraseña ingresada por el usuario.
     */
    getPassword() {
        return document.getElementById("password").value;
    }

    /**
     * Vacía el contenido de los inputs del login / registro.
     */
    clearLoginInputs() {
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("username").value = "";
    }

    /**
     * Si se está mostrando la pantalla de login la oculta y muestra la de notas. Y viceversa.
     */
changeScreen() {
        const notepad = document.getElementById("notepad");
        const loginForm = document.getElementById("loginForm");
        if (notepad.style.display !== "none") {
            notepad.style.display = "none";
            loginForm.style.display = "";
            // Se comentan porque no existen en este archivo y tiran error:
            // this.clearAllNotes();
            // this.clearSelect();
        }
        else {
            notepad.style.display = "";
            loginForm.style.display = "none";
        }
    }

    /**
     * Dibuja una nueva nota en la parte inferior de la pantalla con DOM a partir de los datos ingresados.
     * @param {Number} id ID de la nueva nota.
     * @param {String} title Título de la nueva nota.
     * @param {String} content Contenido de la nueva nota.
     * @param {String} category Categoría de la nueva nota.
     */


    showModal(title, body) {
        document.getElementById("modalTitle").textContent = title;
        document.getElementById("modalBody").textContent = body;

        const modal = new bootstrap.Modal('#modal', {
            keyboard: true,
            focus: true
        });

        modal.show();
    }
}

/**
 * Objeto para manejar la UI en este TP, provisto por los docentes Pablo Morandi y Matias Marchesi.
 */
const ui = new UserInterface();