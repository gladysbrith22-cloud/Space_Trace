# Space Trace · NASA Space Apps Challenge 2026

## 1. Desafío seleccionado
**Reto:** *NASA's Discarded Equipment Storytelling* (Abandonados, pero no olvidados), del NASA Space Apps Challenge 2026
(<https://www.spaceappschallenge.org/2026/challenges/>).

**Problema:** en la Luna, en Marte y en el espacio profundo hay equipos que la NASA dejó atrás (módulos de aterrizaje,
rovers, helicópteros y sondas). Casi nadie conoce su historia, a las personas que los crearon ni lo que lograron antes de
quedar inactivos o abandonados.

**Solución propuesta (Space Trace):** una aplicación web que cuenta la historia de cada equipo junto con su creador.
Combina una experiencia interactiva (héroes, línea de tiempo, ciencia, medios y 5 minijuegos) con un archivo en base de datos
que los administradores mantienen, historias que publica la comunidad y un módulo de comentarios y reportes sobre el sistema.

## Cumplimiento de los criterios
| # | Criterio | Dónde está |
|---|---|---|
| 1 | Desafío, problema y solución | Esta sección y la ruta `/reto` |
| 2 | Aplicación Flask en módulos | `spacetrace/` (blueprints `auth`, `equipos`, `admin`, `reportes`), plantillas en `spacetrace/templates/` |
| 3 | SQLite con CRUD | `database/spacetrace.db`, `spacetrace/db.py`; CRUD en `equipos.py` (equipos e historias) y `reportes.py` |
| 4 | Registro, login, logout y roles | `spacetrace/auth.py` (decoradores `login_required` y `roles_required`), `spacetrace/admin.py`; roles ADMIN y EXPLORADOR |
| 5 | Pruebas automatizadas | `tests/` y `test_app.py`: 43 pruebas (`python -m unittest discover -v`) |

Aplicación web con **Python Flask + SQLite** para el reto *NASA's Discarded Equipment Storytelling*
(equipos que la NASA dejó atrás en la Luna, Marte y el espacio profundo).

## Módulos
| Módulo | Ruta | Acceso |
|---|---|---|
| Experiencia interactiva (héroes, tiempo, ciencia, medios, 5 juegos) | `/` | Público |
| El reto y la solución | `/reto` | Público |
| Archivo de equipos (listar, buscar, ver) | `/archivo` | Público |
| Crear / editar / eliminar equipos (CRUD) | `/archivo/nuevo`, `/archivo/<id>/editar` | ADMIN |
| Historias de la comunidad (CRUD propio) | `/archivo/<id>` | Usuario registrado |
| Comentarios y reportes del sistema interactivo (CRUD) | `/reportes` | Usuario registrado (propios) / ADMIN (todos, responde) |
| Registro, login, logout | `/registro`, `/login`, `/logout` | Público / sesión |
| Mi panel | `/panel` | Usuario registrado |
| Gestión de usuarios (rol, activar, eliminar) | `/admin/usuarios` | ADMIN |

Roles: **ADMIN** (gestiona el archivo y los usuarios) y **EXPLORADOR** (publica y gestiona sus historias).
Todo registro público crea un EXPLORADOR.

## Base de datos (SQLite)
Incluida en el proyecto: `database/spacetrace.db`. Tablas `users`, `equipos`, `historias` y `reportes` (con claves foráneas).
Si falta alguna tabla o el archivo, se crean solas al iniciar (5 equipos iniciales + 1 administrador).

Cuentas de demostración incluidas en la base:
- ADMIN: `admin@spacetrace.test` / `Admin12345`
- EXPLORADOR: `explorador@spacetrace.test` / `Explora123` (con 3 reportes de ejemplo) Contraseñas con hash (Werkzeug), protección CSRF en formularios.

## Ejecutar en local (Windows)
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```
Abre <http://127.0.0.1:5000>. Administrador local por defecto: `admin@spacetrace.test` / `Admin12345`
(cámbialo con las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD`).

## Pruebas automatizadas
```powershell
python -m unittest discover -v
```
43 pruebas: registro/login/logout, CRUD de equipos, historias, reportes, permisos por rol, administración de usuarios y CSRF.

## Despliegue en Render
1. Sube el proyecto a GitHub.
2. En Render: **New → Blueprint** (usa `render.yaml`) o **New → Web Service** con
   Build `pip install -r requirements.txt` y Start `gunicorn app:app`.
3. Variables de entorno: `SECRET_KEY` (aleatoria), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

> En el plan gratuito de Render el disco es temporal: los datos nuevos se pierden en cada despliegue y
> vuelve la base incluida en el repositorio. Si defines `ADMIN_PASSWORD`, esa contraseña reemplaza la del administrador.

Créditos de imágenes y datos: NASA.
