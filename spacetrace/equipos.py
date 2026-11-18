"""Módulos funcionales: archivo de equipos (CRUD), historias y panel personal."""
from datetime import datetime

from flask import (Blueprint, abort, flash, g, jsonify, redirect,
                   render_template, request, url_for)

from .auth import login_required, roles_required
from .db import ahora, get_db

bp = Blueprint("equipos", __name__, template_folder="templates")

MUNDOS = ("Luna", "Marte", "Espacio profundo")
ESTADOS = ("Abandonado", "Misión finalizada", "Activo")


# ------------------------------------------------------------ utilidades
def _url_valida(valor):
    return valor == "" or valor.startswith(("http://", "https://"))


def validar_equipo(form):
    """Devuelve (datos_limpios, lista_de_errores)."""
    d = {k: form.get(k, "").strip() for k in (
        "nombre", "mundo", "mision", "anio", "estado", "creador", "rol_creador",
        "historia", "legado", "imagen_url", "credito", "fuente_url")}
    errores = []
    if not 2 <= len(d["nombre"]) <= 120:
        errores.append("El nombre del equipo debe tener entre 2 y 120 caracteres.")
    if d["mundo"] not in MUNDOS:
        errores.append("Elige un lugar válido (Luna, Marte o Espacio profundo).")
    if d["estado"] not in ESTADOS:
        errores.append("Elige un estado válido.")
    if not 2 <= len(d["creador"]) <= 120:
        errores.append("Indica la persona que creó o lideró el equipo.")
    if len(d["historia"]) < 20:
        errores.append("La historia debe tener al menos 20 caracteres.")
    if len(d["historia"]) > 3000 or len(d["legado"]) > 3000:
        errores.append("La historia y el legado no pueden superar 3000 caracteres.")
    if d["anio"]:
        try:
            anio = int(d["anio"])
            if not 1950 <= anio <= datetime.now().year + 1:
                raise ValueError
            d["anio"] = anio
        except ValueError:
            errores.append("El año debe ser un número entre 1950 y el año actual.")
    else:
        d["anio"] = None
    for campo in ("imagen_url", "fuente_url"):
        if not _url_valida(d[campo]):
            errores.append("Los enlaces deben comenzar con http:// o https://.")
            break
    return d, errores


def validar_historia(form):
    titulo = form.get("titulo", "").strip()
    texto = form.get("texto", "").strip()
    errores = []
    if not 3 <= len(titulo) <= 100:
        errores.append("El título debe tener entre 3 y 100 caracteres.")
    if not 10 <= len(texto) <= 1500:
        errores.append("El texto debe tener entre 10 y 1500 caracteres.")
    return {"titulo": titulo, "texto": texto}, errores


def obtener_equipo(equipo_id):
    equipo = get_db().execute(
        "SELECT * FROM equipos WHERE id = ?", (equipo_id,)).fetchone()
    if equipo is None:
        abort(404)
    return equipo


def obtener_historia(historia_id):
    h = get_db().execute(
        "SELECT h.*, u.nombre AS autor FROM historias h "
        "JOIN users u ON u.id = h.user_id WHERE h.id = ?", (historia_id,)).fetchone()
    if h is None:
        abort(404)
    return h


def puede_gestionar(historia):
    return g.user is not None and (
        g.user["rol"] == "ADMIN" or g.user["id"] == historia["user_id"])


# ------------------------------------------------------- READ: listado/detalle
@bp.get("/archivo")
def lista():
    q = request.args.get("q", "").strip()
    mundo = request.args.get("mundo", "")
    estado = request.args.get("estado", "")
    sql = ("SELECT e.*, (SELECT COUNT(*) FROM historias h WHERE h.equipo_id = e.id) "
           "AS n_historias FROM equipos e WHERE 1=1")
    params = []
    if q:
        sql += " AND (e.nombre LIKE ? OR e.creador LIKE ? OR e.mision LIKE ?)"
        params += [f"%{q}%"] * 3
    if mundo in MUNDOS:
        sql += " AND e.mundo = ?"
        params.append(mundo)
    if estado in ESTADOS:
        sql += " AND e.estado = ?"
        params.append(estado)
    sql += " ORDER BY e.mundo, e.anio, e.nombre"
    equipos = get_db().execute(sql, params).fetchall()
    return render_template("archivo/lista.html", equipos=equipos, q=q, mundo=mundo,
                           estado=estado, MUNDOS=MUNDOS, ESTADOS=ESTADOS)


@bp.get("/archivo/<int:equipo_id>")
def detalle(equipo_id):
    equipo = obtener_equipo(equipo_id)
    historias = get_db().execute(
        "SELECT h.*, u.nombre AS autor FROM historias h "
        "JOIN users u ON u.id = h.user_id WHERE h.equipo_id = ? "
        "ORDER BY h.creado DESC, h.id DESC", (equipo_id,)).fetchall()
    return render_template("archivo/detalle.html", equipo=equipo, historias=historias,
                           puede_gestionar=puede_gestionar)


@bp.get("/api/equipos")
def api_equipos():
    filas = get_db().execute(
        "SELECT id, nombre, mundo, mision, anio, estado, creador FROM equipos "
        "ORDER BY id").fetchall()
    return jsonify([dict(f) for f in filas])


# --------------------------------------------------------- CREATE (ADMIN)
@bp.route("/archivo/nuevo", methods=["GET", "POST"])
@roles_required("ADMIN")
def nuevo():
    datos = {"mundo": "Luna", "estado": "Abandonado"}
    if request.method == "POST":
        datos, errores = validar_equipo(request.form)
        if not errores:
            db = get_db()
            if db.execute("SELECT 1 FROM equipos WHERE nombre = ?",
                          (datos["nombre"],)).fetchone():
                errores.append("Ya existe un equipo con ese nombre.")
        if errores:
            for e in errores:
                flash(e, "error")
        else:
            t = ahora()
            cur = db.execute(
                """INSERT INTO equipos (nombre, mundo, mision, anio, estado, creador,
                   rol_creador, historia, legado, imagen_url, credito, fuente_url,
                   creado_por, creado, actualizado)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (datos["nombre"], datos["mundo"], datos["mision"], datos["anio"],
                 datos["estado"], datos["creador"], datos["rol_creador"],
                 datos["historia"], datos["legado"], datos["imagen_url"],
                 datos["credito"], datos["fuente_url"], g.user["id"], t, t))
            db.commit()
            flash("Equipo agregado al archivo.", "ok")
            return redirect(url_for("equipos.detalle", equipo_id=cur.lastrowid))
    return render_template("archivo/form.html", equipo=datos, modo="nuevo",
                           MUNDOS=MUNDOS, ESTADOS=ESTADOS)


# --------------------------------------------------------- UPDATE (ADMIN)
@bp.route("/archivo/<int:equipo_id>/editar", methods=["GET", "POST"])
@roles_required("ADMIN")
def editar(equipo_id):
    equipo = obtener_equipo(equipo_id)
    if request.method == "POST":
        datos, errores = validar_equipo(request.form)
        db = get_db()
        if not errores and db.execute(
                "SELECT 1 FROM equipos WHERE nombre = ? AND id != ?",
                (datos["nombre"], equipo_id)).fetchone():
            errores.append("Ya existe otro equipo con ese nombre.")
        if errores:
            for e in errores:
                flash(e, "error")
            equipo = {**dict(equipo), **datos}
        else:
            db.execute(
                """UPDATE equipos SET nombre=?, mundo=?, mision=?, anio=?, estado=?,
                   creador=?, rol_creador=?, historia=?, legado=?, imagen_url=?,
                   credito=?, fuente_url=?, actualizado=? WHERE id=?""",
                (datos["nombre"], datos["mundo"], datos["mision"], datos["anio"],
                 datos["estado"], datos["creador"], datos["rol_creador"],
                 datos["historia"], datos["legado"], datos["imagen_url"],
                 datos["credito"], datos["fuente_url"], ahora(), equipo_id))
            db.commit()
            flash("Equipo actualizado.", "ok")
            return redirect(url_for("equipos.detalle", equipo_id=equipo_id))
    return render_template("archivo/form.html", equipo=equipo, modo="editar",
                           MUNDOS=MUNDOS, ESTADOS=ESTADOS)


# --------------------------------------------------------- DELETE (ADMIN)
@bp.post("/archivo/<int:equipo_id>/eliminar")
@roles_required("ADMIN")
def eliminar(equipo_id):
    equipo = obtener_equipo(equipo_id)
    db = get_db()
    db.execute("DELETE FROM equipos WHERE id = ?", (equipo_id,))
    db.commit()
    flash(f"Equipo «{equipo['nombre']}» eliminado.", "info")
    return redirect(url_for("equipos.lista"))


# ------------------------------------------- Historias de la comunidad (CRUD)
@bp.post("/archivo/<int:equipo_id>/historias")
@login_required
def crear_historia(equipo_id):
    obtener_equipo(equipo_id)
    datos, errores = validar_historia(request.form)
    if errores:
        for e in errores:
            flash(e, "error")
    else:
        t = ahora()
        db = get_db()
        db.execute(
            "INSERT INTO historias (equipo_id, user_id, titulo, texto, creado, actualizado) "
            "VALUES (?,?,?,?,?,?)",
            (equipo_id, g.user["id"], datos["titulo"], datos["texto"], t, t))
        db.commit()
        flash("Tu historia fue publicada.", "ok")
    return redirect(url_for("equipos.detalle", equipo_id=equipo_id) + "#historias")


@bp.route("/historias/<int:historia_id>/editar", methods=["GET", "POST"])
@login_required
def editar_historia(historia_id):
    h = obtener_historia(historia_id)
    if not puede_gestionar(h):
        abort(403)
    if request.method == "POST":
        datos, errores = validar_historia(request.form)
        if errores:
            for e in errores:
                flash(e, "error")
            h = {**dict(h), **datos}
        else:
            db = get_db()
            db.execute("UPDATE historias SET titulo=?, texto=?, actualizado=? WHERE id=?",
                       (datos["titulo"], datos["texto"], ahora(), historia_id))
            db.commit()
            flash("Historia actualizada.", "ok")
            return redirect(url_for("equipos.detalle", equipo_id=h["equipo_id"]) + "#historias")
    equipo = obtener_equipo(h["equipo_id"])
    return render_template("archivo/historia_form.html", historia=h, equipo=equipo)


@bp.post("/historias/<int:historia_id>/eliminar")
@login_required
def eliminar_historia(historia_id):
    h = obtener_historia(historia_id)
    if not puede_gestionar(h):
        abort(403)
    db = get_db()
    db.execute("DELETE FROM historias WHERE id = ?", (historia_id,))
    db.commit()
    flash("Historia eliminada.", "info")
    destino = request.form.get("volver") or ""
    if destino == "panel":
        return redirect(url_for("equipos.panel"))
    return redirect(url_for("equipos.detalle", equipo_id=h["equipo_id"]) + "#historias")


# ------------------------------------------------------------------ panel
@bp.get("/panel")
@login_required
def panel():
    db = get_db()
    mias = db.execute(
        "SELECT h.*, e.nombre AS equipo FROM historias h "
        "JOIN equipos e ON e.id = h.equipo_id WHERE h.user_id = ? "
        "ORDER BY h.creado DESC, h.id DESC", (g.user["id"],)).fetchall()
    stats = None
    if g.user["rol"] == "ADMIN":
        stats = {
            "equipos": db.execute("SELECT COUNT(*) FROM equipos").fetchone()[0],
            "historias": db.execute("SELECT COUNT(*) FROM historias").fetchone()[0],
            "usuarios": db.execute("SELECT COUNT(*) FROM users").fetchone()[0],
        }
    return render_template("archivo/panel.html", historias=mias, stats=stats)
