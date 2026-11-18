"""Registro, inicio y cierre de sesión, CSRF y control de acceso por rol."""
import functools
import re
import secrets
from urllib.parse import urlparse

from flask import (Blueprint, abort, current_app, flash, g, redirect,
                   render_template, request, session, url_for)
from werkzeug.security import check_password_hash, generate_password_hash

from .db import ahora, get_db

bp = Blueprint("auth", __name__, template_folder="templates")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ---------------------------------------------------------------- CSRF
def csrf_token():
    if "_csrf" not in session:
        session["_csrf"] = secrets.token_hex(16)
    return session["_csrf"]


def verificar_csrf():
    if not current_app.config.get("CSRF_ENABLED", True):
        return
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        enviado = request.form.get("csrf_token", "")
        esperado = session.get("_csrf", "")
        if not esperado or not secrets.compare_digest(enviado, esperado):
            abort(400, "Token CSRF inválido. Recarga la página e inténtalo de nuevo.")


# ----------------------------------------------------- usuario y decoradores
def cargar_usuario():
    user_id = session.get("user_id")
    g.user = None
    if user_id is not None:
        user = get_db().execute(
            "SELECT id, nombre, email, rol, activo FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        if user and user["activo"]:
            g.user = user
        else:
            session.pop("user_id", None)


def login_required(view):
    @functools.wraps(view)
    def wrapped(**kwargs):
        if g.user is None:
            flash("Inicia sesión para continuar.", "info")
            return redirect(url_for("auth.login", next=request.path))
        return view(**kwargs)
    return wrapped


def roles_required(*roles):
    def decorator(view):
        @functools.wraps(view)
        def wrapped(**kwargs):
            if g.user is None:
                flash("Inicia sesión para continuar.", "info")
                return redirect(url_for("auth.login", next=request.path))
            if g.user["rol"] not in roles:
                abort(403)
            return view(**kwargs)
        return wrapped
    return decorator


def _destino_seguro(destino):
    """Solo se aceptan rutas internas para evitar redirecciones abiertas."""
    if not destino:
        return None
    p = urlparse(destino)
    if p.scheme or p.netloc or not destino.startswith("/") or destino.startswith("//"):
        return None
    return destino


# --------------------------------------------------------------- rutas
@bp.route("/registro", methods=["GET", "POST"])
def registro():
    if g.user:
        return redirect(url_for("equipos.panel"))
    datos = {"nombre": "", "email": ""}
    if request.method == "POST":
        nombre = request.form.get("nombre", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirmar = request.form.get("confirmar", "")
        datos = {"nombre": nombre, "email": email}

        errores = []
        if not 2 <= len(nombre) <= 60:
            errores.append("El nombre debe tener entre 2 y 60 caracteres.")
        if not EMAIL_RE.match(email) or len(email) > 120:
            errores.append("Escribe un correo electrónico válido.")
        if len(password) < 8 or not re.search(r"[A-Za-z]", password) \
                or not re.search(r"\d", password):
            errores.append("La contraseña debe tener al menos 8 caracteres, con letras y números.")
        if password != confirmar:
            errores.append("Las contraseñas no coinciden.")

        db = get_db()
        if not errores and db.execute(
                "SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
            errores.append("Ya existe una cuenta con ese correo.")

        if errores:
            for e in errores:
                flash(e, "error")
        else:
            # Todo registro público es EXPLORADOR; el rol ADMIN solo lo asigna un admin.
            db.execute(
                "INSERT INTO users (nombre, email, password_hash, rol, creado) "
                "VALUES (?,?,?,?,?)",
                (nombre, email, generate_password_hash(password), "EXPLORADOR", ahora()),
            )
            db.commit()
            flash("Cuenta creada. Ya puedes iniciar sesión.", "ok")
            return redirect(url_for("auth.login"))
    return render_template("auth/registro.html", datos=datos)


@bp.route("/login", methods=["GET", "POST"])
def login():
    if g.user:
        return redirect(url_for("equipos.panel"))
    siguiente = request.values.get("next", "")
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = get_db().execute(
            "SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if user is None or not check_password_hash(user["password_hash"], password):
            flash("Correo o contraseña incorrectos.", "error")
        elif not user["activo"]:
            flash("Tu cuenta está desactivada. Contacta al administrador.", "error")
        else:
            session.clear()
            session["user_id"] = user["id"]
            flash(f"Bienvenido/a, {user['nombre']}.", "ok")
            return redirect(_destino_seguro(siguiente) or url_for("equipos.panel"))
    return render_template("auth/login.html", siguiente=siguiente)


@bp.post("/logout")
def logout():
    session.clear()
    flash("Sesión cerrada.", "info")
    return redirect(url_for("home"))
