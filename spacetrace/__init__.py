"""Space Trace · aplicación Flask con SQLite (NASA Space Apps Challenge 2026)."""
import os

from flask import Flask, g, render_template, send_from_directory

from . import admin, auth, db, equipos, reportes

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def create_app(config=None):
    app = Flask(
        __name__,
        static_folder=os.path.join(RAIZ, "static"),
        template_folder=os.path.join(RAIZ, "templates"),
        instance_path=os.path.join(RAIZ, "instance"),
    )
    en_render = bool(os.environ.get("RENDER"))
    secret = os.environ.get("SECRET_KEY")
    if en_render and not secret:
        raise RuntimeError("Define la variable de entorno SECRET_KEY en Render.")

    app.config.update(
        SECRET_KEY=secret or "clave-solo-para-desarrollo",
        DATABASE=os.environ.get(
            "DATABASE_PATH", os.path.join(RAIZ, "database", "spacetrace.db")),
        ADMIN_EMAIL=os.environ.get("ADMIN_EMAIL", "admin@spacetrace.test"),
        ADMIN_PASSWORD=os.environ.get("ADMIN_PASSWORD", "Admin12345"),
        ADMIN_PASSWORD_FROM_ENV="ADMIN_PASSWORD" in os.environ,
        CSRF_ENABLED=True,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=en_render,
    )
    if config:
        app.config.update(config)

    os.makedirs(os.path.dirname(app.config["DATABASE"]), exist_ok=True)

    db.init_app(app)
    app.register_blueprint(auth.bp)
    app.register_blueprint(equipos.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(reportes.bp)

    app.before_request(auth.cargar_usuario)
    app.before_request(auth.verificar_csrf)
    app.jinja_env.globals["csrf_token"] = auth.csrf_token

    @app.context_processor
    def inyectar_usuario():
        return {"usuario": g.get("user")}

    # ---- rutas originales del prototipo ----
    @app.get("/")
    def home():
        u = g.get("user")
        resumen = {"nombre": u["nombre"], "rol": u["rol"]} if u else None
        return render_template("index.html", st_user=resumen)

    @app.get("/mision-luna")
    def mision_luna():
        return send_from_directory(app.static_folder, "pages/misionluna.html")

    @app.get("/cohete-luna")
    def cohete_luna():
        return send_from_directory(app.static_folder, "pages/cohete-luna.html")

    @app.get("/reto")
    def reto():
        return render_template("reto.html")

    @app.errorhandler(403)
    def prohibido(_e):
        return render_template("error.html", codigo=403,
                               mensaje="No tienes permiso para ver esta página."), 403

    @app.errorhandler(404)
    def no_encontrado(_e):
        return render_template("error.html", codigo=404,
                               mensaje="No encontramos lo que buscabas."), 404

    @app.errorhandler(400)
    def solicitud_invalida(e):
        return render_template("error.html", codigo=400,
                               mensaje=getattr(e, "description", "Solicitud inválida.")), 400

    return app
