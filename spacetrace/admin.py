"""Administración de usuarios (solo rol ADMIN)."""
from flask import Blueprint, abort, flash, g, redirect, render_template, request, url_for

from .auth import roles_required
from .db import get_db

bp = Blueprint("admin", __name__, url_prefix="/admin", template_folder="templates")


def _usuario(user_id):
    u = get_db().execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if u is None:
        abort(404)
    return u


def _es_ultimo_admin_activo(user):
    if user["rol"] != "ADMIN" or not user["activo"]:
        return False
    n = get_db().execute(
        "SELECT COUNT(*) FROM users WHERE rol = 'ADMIN' AND activo = 1").fetchone()[0]
    return n <= 1


@bp.get("/usuarios")
@roles_required("ADMIN")
def usuarios():
    filas = get_db().execute(
        "SELECT u.*, (SELECT COUNT(*) FROM historias h WHERE h.user_id = u.id) "
        "AS n_historias FROM users u ORDER BY u.id").fetchall()
    return render_template("admin/usuarios.html", usuarios=filas)


@bp.post("/usuarios/<int:user_id>/rol")
@roles_required("ADMIN")
def cambiar_rol(user_id):
    u = _usuario(user_id)
    rol = request.form.get("rol", "")
    if rol not in ("ADMIN", "EXPLORADOR"):
        abort(400)
    if rol != u["rol"] and _es_ultimo_admin_activo(u):
        flash("No puedes quitar el rol al último administrador activo.", "error")
        return redirect(url_for("admin.usuarios"))
    db = get_db()
    db.execute("UPDATE users SET rol = ? WHERE id = ?", (rol, user_id))
    db.commit()
    flash(f"Rol de {u['nombre']} actualizado a {rol}.", "ok")
    return redirect(url_for("admin.usuarios"))


@bp.post("/usuarios/<int:user_id>/estado")
@roles_required("ADMIN")
def cambiar_estado(user_id):
    u = _usuario(user_id)
    if _es_ultimo_admin_activo(u):
        flash("No puedes desactivar al último administrador activo.", "error")
        return redirect(url_for("admin.usuarios"))
    nuevo = 0 if u["activo"] else 1
    db = get_db()
    db.execute("UPDATE users SET activo = ? WHERE id = ?", (nuevo, user_id))
    db.commit()
    flash(f"Cuenta de {u['nombre']} {'activada' if nuevo else 'desactivada'}.", "ok")
    return redirect(url_for("admin.usuarios"))


@bp.post("/usuarios/<int:user_id>/eliminar")
@roles_required("ADMIN")
def eliminar_usuario(user_id):
    u = _usuario(user_id)
    if u["id"] == g.user["id"]:
        flash("No puedes eliminar tu propia cuenta desde aquí.", "error")
    elif _es_ultimo_admin_activo(u):
        flash("No puedes eliminar al último administrador activo.", "error")
    else:
        db = get_db()
        db.execute("DELETE FROM users WHERE id = ?", (user_id,))
        db.commit()
        flash(f"Usuario {u['nombre']} eliminado.", "info")
    return redirect(url_for("admin.usuarios"))
