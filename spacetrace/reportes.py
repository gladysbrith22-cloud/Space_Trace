"""Comentarios y reportes sobre el sistema interactivo (requiere login)."""
from flask import (Blueprint, abort, flash, g, redirect, render_template,
                   request, url_for)

from .auth import login_required, roles_required
from .db import ahora, get_db

bp = Blueprint("reportes", __name__, template_folder="templates")

TIPOS = ("Comentario", "Error", "Sugerencia")
SECCIONES = ("Héroes", "Tiempo", "Ciencia", "Medios", "Juegos", "Archivo", "Otro")
ESTADOS = ("Pendiente", "En revisión", "Resuelto")


def validar_reporte(form):
    d = {"tipo": form.get("tipo", ""), "seccion": form.get("seccion", ""),
         "mensaje": form.get("mensaje", "").strip(),
         "calificacion": form.get("calificacion", "").strip()}
    errores = []
    if d["tipo"] not in TIPOS:
        errores.append("Elige un tipo válido (Comentario, Error o Sugerencia).")
    if d["seccion"] not in SECCIONES:
        errores.append("Elige la sección del sistema a la que se refiere.")
    if not 10 <= len(d["mensaje"]) <= 1000:
        errores.append("El mensaje debe tener entre 10 y 1000 caracteres.")
    if d["calificacion"]:
        if d["calificacion"] not in ("1", "2", "3", "4", "5"):
            errores.append("La calificación debe ser un número del 1 al 5.")
        else:
            d["calificacion"] = int(d["calificacion"])
    else:
        d["calificacion"] = None
    return d, errores


def obtener_reporte(reporte_id):
    r = get_db().execute(
        "SELECT r.*, u.nombre AS autor FROM reportes r "
        "JOIN users u ON u.id = r.user_id WHERE r.id = ?", (reporte_id,)).fetchone()
    if r is None:
        abort(404)
    return r


def _puede_ver(r):
    return g.user["rol"] == "ADMIN" or r["user_id"] == g.user["id"]


@bp.get("/reportes")
@login_required
def lista():
    es_admin = g.user["rol"] == "ADMIN"
    tipo = request.args.get("tipo", "")
    estado = request.args.get("estado", "")
    sql = ("SELECT r.*, u.nombre AS autor FROM reportes r "
           "JOIN users u ON u.id = r.user_id WHERE 1=1")
    params = []
    if not es_admin:
        sql += " AND r.user_id = ?"
        params.append(g.user["id"])
    if tipo in TIPOS:
        sql += " AND r.tipo = ?"
        params.append(tipo)
    if estado in ESTADOS:
        sql += " AND r.estado = ?"
        params.append(estado)
    sql += " ORDER BY r.creado DESC, r.id DESC"
    filas = get_db().execute(sql, params).fetchall()
    return render_template("reportes/lista.html", reportes=filas, es_admin=es_admin,
                           tipo=tipo, estado=estado, TIPOS=TIPOS, ESTADOS=ESTADOS,
                           SECCIONES=SECCIONES)


@bp.post("/reportes")
@login_required
def crear():
    d, errores = validar_reporte(request.form)
    if errores:
        for e in errores:
            flash(e, "error")
    else:
        t = ahora()
        db = get_db()
        db.execute(
            "INSERT INTO reportes (user_id, tipo, seccion, mensaje, calificacion, creado, actualizado) "
            "VALUES (?,?,?,?,?,?,?)",
            (g.user["id"], d["tipo"], d["seccion"], d["mensaje"], d["calificacion"], t, t))
        db.commit()
        flash("Gracias, tu reporte fue registrado.", "ok")
    return redirect(url_for("reportes.lista"))


@bp.route("/reportes/<int:reporte_id>/editar", methods=["GET", "POST"])
@login_required
def editar(reporte_id):
    r = obtener_reporte(reporte_id)
    if r["user_id"] != g.user["id"]:
        abort(403)
    if r["estado"] != "Pendiente":
        flash("Solo puedes editar reportes que siguen pendientes.", "error")
        return redirect(url_for("reportes.lista"))
    if request.method == "POST":
        d, errores = validar_reporte(request.form)
        if errores:
            for e in errores:
                flash(e, "error")
            r = {**dict(r), **d}
        else:
            db = get_db()
            db.execute(
                "UPDATE reportes SET tipo=?, seccion=?, mensaje=?, calificacion=?, actualizado=? WHERE id=?",
                (d["tipo"], d["seccion"], d["mensaje"], d["calificacion"], ahora(), reporte_id))
            db.commit()
            flash("Reporte actualizado.", "ok")
            return redirect(url_for("reportes.lista"))
    return render_template("reportes/editar.html", r=r, TIPOS=TIPOS, SECCIONES=SECCIONES)


@bp.post("/reportes/<int:reporte_id>/eliminar")
@login_required
def eliminar(reporte_id):
    r = obtener_reporte(reporte_id)
    if not _puede_ver(r):
        abort(403)
    db = get_db()
    db.execute("DELETE FROM reportes WHERE id = ?", (reporte_id,))
    db.commit()
    flash("Reporte eliminado.", "info")
    return redirect(url_for("reportes.lista"))


@bp.post("/reportes/<int:reporte_id>/responder")
@roles_required("ADMIN")
def responder(reporte_id):
    obtener_reporte(reporte_id)
    estado = request.form.get("estado", "")
    respuesta = request.form.get("respuesta", "").strip()
    if estado not in ESTADOS or len(respuesta) > 500:
        abort(400)
    db = get_db()
    db.execute("UPDATE reportes SET estado=?, respuesta=?, actualizado=? WHERE id=?",
               (estado, respuesta, ahora(), reporte_id))
    db.commit()
    flash("Reporte actualizado.", "ok")
    return redirect(url_for("reportes.lista"))
