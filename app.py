#--------------------------------------------------------------------
# Instalar con pip install Flask
from flask import Flask, request, jsonify, render_template
import requests
import webbrowser
import threading

# Instalar con pip install flask-cors
from flask_cors import CORS, cross_origin

# Instalar con pip install mysql-connector-python
import mysql.connector

# Si es necesario, pip install Werkzeug
#from werkzeug.middleware.proxy_fix import ProxyFix

# No es necesario instalar, es parte del sistema standard de Python
import os
#import time
#--------------------------------------------------------------------
#para agregar los productos a la bbdd
import json

app = Flask(__name__, static_folder= 'static')
CORS(app)
#CORS(app, origins = "http://localhost:5500")  # Esto habilitará CORS para todas las rutas

#--------------------------------------------------------------------
class Catalogo:
    # Constructor de la clase
    def __init__(self, host, user, password, database):
        # Primero, establecemos una conexión sin especificar la base de datos
        self.conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            charset='utf8mb4'
        )
        self.cursor = self.conn.cursor()

        # Intentamos seleccionar la base de datos
        try:
            self.cursor.execute(f"USE {database}")
        except mysql.connector.Error as err:
            # Si la base de datos no existe, la creamos
            if err.errno == mysql.connector.errorcode.ER_BAD_DB_ERROR:
                self.cursor.execute(f"CREATE DATABASE {database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                self.conn.database = database
            else:
                raise err

        # Una vez que la base de datos está establecida, creamos la tabla si no existe
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS vinilos (
            codigo INT AUTO_INCREMENT PRIMARY KEY,
            interprete VARCHAR(255) NOT NULL,
            album VARCHAR(255) NOT NULL,
            lanzamiento INT NOT NULL,
            estado VARCHAR(255) NOT NULL,
            comentario VARCHAR(255) NOT NULL,
            UNIQUE (codigo),
            INDEX idx_interprete (interprete)
            )CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci''')
        self.conn.commit()

        # Cerrar el cursor inicial y abrir uno nuevo con el parámetro dictionary=True
        self.cursor.close()
        self.cursor = self.conn.cursor(dictionary=True)

    #----------------------------------------------------------------
    def agregar_vinilo(self, interprete, album, lanzamiento, estado, comentario):
        # Verificamos si ya existe un producto con el mismo nombre, dado que el codigo es auto incremental
        self.cursor.execute("SELECT * FROM vinilos WHERE interprete = %s AND album = %s AND lanzamiento = %s", (interprete, album, lanzamiento))
        producto_existe = self.cursor.fetchone()
        if producto_existe:
            return False

        sql = "INSERT INTO vinilos (interprete, album, lanzamiento, estado, comentario) VALUES (%s, %s, %s, %s, %s)"
        valores = (interprete, album, lanzamiento, estado, comentario)

        self.cursor.execute(sql, valores)        
        self.conn.commit()
        return True

    #----------------------------------------------------------------
    def consultar_vinilo(self, codigo):
        # Consultamos un producto a partir de su código
        self.cursor.execute("SELECT * FROM vinilos WHERE codigo = %s",(codigo,))
        return self.cursor.fetchone()

    #----------------------------------------------------------------
    def modificar_vinilo(self, codigo, interprete, album, lanzamiento, estado, comentario):
        sql = "UPDATE vinilos SET interprete = %s, album = %s, lanzamiento = %s, estado = %s, comentario = %s WHERE codigo = %s"
        valores = (interprete, album, lanzamiento, estado, comentario, codigo)
        self.cursor.execute(sql, valores)
        self.conn.commit()
        return self.cursor.rowcount > 0

    #----------------------------------------------------------------
    def listar_vinilos(self):
        self.cursor.execute("SELECT * FROM vinilos ORDER BY interprete;")
        vinilos = self.cursor.fetchall()
        return vinilos
    
    #----------------------------------------------------------------
    def listar_vinilos_interprete(self, interprete):
        try:
            self.cursor.execute("SELECT * FROM vinilos WHERE interprete = %s ORDER BY interprete", (interprete,))
            vinilos = self.cursor.fetchall()
            return vinilos
        except Exception as e:
            print(f"Error al ejecutar la consulta: {e}")
            return None

    #----------------------------------------------------------------
    def consultar_album(self, album):
        try:
            self.cursor.execute("SELECT * FROM vinilos WHERE album = %s", (album,))
            vinilo = self.cursor.fetchall()
            return vinilo
        except Exception as e:
            print(f"Error al ejecutar la consulta: {e}")
            return None

    #----------------------------------------------------------------
    def eliminar_vinilo(self, codigo):
        try:
            if not self.conn.is_connected():
                self.conn.connect()
            # Eliminamos un producto de la tabla a partir de su código
            self.cursor.execute("DELETE FROM vinilos WHERE codigo = %s", (codigo,))
            self.conn.commit()

            return self.cursor.rowcount > 0
        except Exception as e:
            print("Error al eliminar el vinilo:", e)
            # Manejar otros errores según sea necesario
            return False

#--------------------------------------------------------------------
# Cuerpo del programa
#--------------------------------------------------------------------


@app.route("/vinilos", methods=["GET"])
@cross_origin(origin="http://localhost:5000")
def listar_vinilos():
    vinilos = catalogo.listar_vinilos()
    return jsonify(vinilos)


#--------------------------------------------------------------------
@app.route("/vinilos/<int:codigo>", methods=["GET"])
@cross_origin(origin="http://localhost:5000")
def mostrar_vinilo(codigo):
    vinilo = catalogo.consultar_vinilo(codigo)
    if vinilo:
        return jsonify(vinilo), 201
    else:
        return "Vinilo no encontrado", 404

#--------------------------------------------------------------------
@app.route("/vinilos/<string:interprete>", methods=["GET"])
@cross_origin(origin="http://localhost:5000")
def lista_vinilos_interprete(interprete):
    try:
        vinilos = catalogo.listar_vinilos_interprete(interprete)
        return jsonify(vinilos)
    except Exception as e:
        return jsonify({'error': str(e)})


#--------------------------------------------------------------------
#@app.route("/vinilos/<string:album>", methods=["GET"])
#@cross_origin(origin="http://localhost:5000")
#def consultar_album(album):
#    try:
#        vinilo = catalogo.consultar_album(album)
#        return jsonify(vinilo)
#    except Exception as e:
#        return jsonify({'error': str(e)})


#--------------------------------------------------------------------
@app.route("/vinilos", methods=["POST"])
@cross_origin(origin="http://localhost:5000")
def agregar_vinilo():
    #Recojo los datos del form
    interprete = request.form['interprete']
    album = request.form['album']
    lanzamiento = request.form['lanzamiento']
    estado = request.form['estado']
    comentario = request.form['comentario']

    if catalogo.agregar_vinilo(interprete, album, lanzamiento, estado, comentario):
        #imagen.save(os.path.join(RUTA_DESTINO, nombre_imagen))
        return jsonify({"mensaje": "Vinilo agregado"}), 201
    else:
        return jsonify({"mensaje": "Vinilo ya existente"}), 400

#--------------------------------------------------------------------
@app.route("/vinilos/<int:codigo>", methods=["PUT"])
@cross_origin(origin="http://localhost:5000")
def modificar_vinilo(codigo):
    #Recojo los datos del form
    nuevo_interprete = request.form.get("interprete")
    nuevo_album = request.form.get("album")
    nuevo_lanzamiento = request.form.get("lanzamiento")
    nuevo_estado = request.form.get("estado")
    nuevo_comentario = request.form.get("comentario")
    
    if catalogo.modificar_vinilo(codigo, nuevo_interprete, nuevo_album, nuevo_lanzamiento, nuevo_estado, nuevo_comentario):
        return jsonify({"mensaje": "Vinilo modificado"}), 200
    else:
        return jsonify({"mensaje": "Vinilo no encontrado"}), 403


#--------------------------------------------------------------------
@app.route("/vinilos/<int:codigo>", methods=["DELETE"])
@cross_origin(origin="http://localhost:5000")
def eliminar_vinilo(codigo):

    if catalogo.eliminar_vinilo(codigo):
        return jsonify({"mensaje": "Vinilo eliminado"}), 200
    else:
        return jsonify({"mensaje": "Error al eliminar el vinilo"}), 500
    

#--------------------------------------------------------------------

@app.route("/tracklist/<artist_name>/<album_name>")
@cross_origin(origin="http://localhost:5000")
def get_tracklist(artist_name, album_name):
        artist = artist_name.lower()
        album = album_name.lower()
        query = f"{artist} {album}"
        url = f"https://api.deezer.com/search?q={query}"
        print(url)
        try:
        # Realizar la solicitud a Deezer
            response = requests.get(url)
            response.raise_for_status()

            # Obtener los resultados de la búsqueda
            results = response.json()

            # Verificar si hay resultados y procesar el tracklist
            if 'data' in results and len(results['data']) > 0:
                # Tomar el primer resultado (podrías extender esto para manejar múltiples resultados)
                #first_result = results['data'][0]
                
                # Verificar si el resultado contiene información del álbum
                for result in results['data']:
                    #if 'album' in result:
                        album_info = result['album']
                        # Verificar si el álbum tiene un tracklist
                        if 'tracklist' in album_info:
                            tracklist_url = album_info['tracklist']

                            # Realizar una solicitud al tracklist
                            tracklist_response = requests.get(tracklist_url)
                            tracklist_response.raise_for_status()
                            if len(tracklist_response.json()) > 1:
                                # Devolver el tracklist como JSON
                                return jsonify(tracklist_response.json())

        # Si no se encuentra el álbum, devolver un mensaje de error
            return jsonify({'error': 'Álbum no encontrado en Deezer'}), 404

        except requests.exceptions.RequestException as e:
            print(f"Error al buscar en Deezer: {e}")
            return jsonify({'error': 'Error al comunicarse con Deezer'}), 500


#--------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/index.html")
def index_template():
    return render_template("index.html")

@app.route("/agregar-vinilo.html")
def agregar_vinilo_template():
    return render_template("agregar-vinilo.html")

@app.route("/busqueda-filtrada.html")
def busqueda_filtrada_template():
    return render_template("busqueda-filtrada.html")

@app.route("/eliminar-vinilo.html")
def eliminar_vinilo_template():
    return render_template("eliminar-vinilo.html")

@app.route("/modificar-vinilo.html")
def modificar_vinilo_template():
    return render_template("modificar-vinilo.html")

@app.route("/mostrar-coleccion.html")
def mostrar_coleccion_template():
    return render_template("mostrar-coleccion.html")

@app.route("/ver-tracklist.html")
def ver_tracklist_template():
    return render_template("ver-tracklist.html")

#--------------------------------------------------------------------
# Maneja solicitudes OPTIONS
@app.route("/vinilos/<int:codigo>", methods=["OPTIONS"])
def handle_options(codigo):
    response = app.make_default_options_response()
    response.headers["Access-Control-Allow-Methods"] = "DELETE"
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5500"
    return response

#--------------------------------------------------------------------
def abrir_navegador():
    webbrowser.open("http://localhost:5000")
#--------------------------------------------------------------------

if __name__ == "__main__":
    try:
        catalogo = Catalogo(host='localhost', user='root', password='', database='miapp')

        with open('coleccion.json', 'r', encoding='utf-8') as file:
            vinilos = json.load(file)

        for vinilo in vinilos:
            catalogo.agregar_vinilo(  vinilo["INTERPRETE"], 
                                        vinilo["ALBUM"], 
                                        vinilo["AÑO"], 
                                        vinilo["ESTADO"], 
                                        vinilo["Comentario"] 
                                    )
        threading.Thread(target=abrir_navegador).start()

        app.run(host='127.0.0.1', port=5000, debug=True, use_reloader=False)
        
    except Exception as e:
        print(f"Error: {e}")
        input("Presiona Enter para salir...")