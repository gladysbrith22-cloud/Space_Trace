"""Acceso a SQLite: conexión por petición, esquema y datos iniciales."""
import sqlite3
from datetime import datetime, timezone

import click
from flask import current_app, g
from werkzeug.security import generate_password_hash

from .seed_data import EQUIPOS_INICIALES

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre        TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol           TEXT NOT NULL DEFAULT 'EXPLORADOR'
                  CHECK (rol IN ('ADMIN', 'EXPLORADOR')),
    activo        INTEGER NOT NULL DEFAULT 1,
    creado        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS equipos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT NOT NULL UNIQUE,
    mundo       TEXT NOT NULL CHECK (mundo IN ('Luna', 'Marte', 'Espacio profundo')),
    mision      TEXT NOT NULL DEFAULT '',
    anio        INTEGER,
    estado      TEXT NOT NULL DEFAULT 'Abandonado'
                CHECK (estado IN ('Abandonado', 'Misión finalizada', 'Activo')),
    creador     TEXT NOT NULL,
    rol_creador TEXT NOT NULL DEFAULT '',
    historia    TEXT NOT NULL,
    legado      TEXT NOT NULL DEFAULT '',
    imagen_url  TEXT NOT NULL DEFAULT '',
    credito     TEXT NOT NULL DEFAULT '',
    fuente_url  TEXT NOT NULL DEFAULT '',
    creado_por  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    creado      TEXT NOT NULL,
    actualizado TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS historias (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    equipo_id   INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo      TEXT NOT NULL,
    texto       TEXT NOT NULL,
    creado      TEXT NOT NULL,
    actualizado TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reportes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipo        TEXT NOT NULL CHECK (tipo IN ('Comentario', 'Error', 'Sugerencia')),
    seccion     TEXT NOT NULL,
    mensaje     TEXT NOT NULL,
    calificacion INTEGER CHECK (calificacion IS NULL OR calificacion BETWEEN 1 AND 5),
    estado      TEXT NOT NULL DEFAULT 'Pendiente'
                CHECK (estado IN ('Pendiente', 'En revisión', 'Resuelto')),
    respuesta   TEXT NOT NULL DEFAULT '',
    creado      TEXT NOT NULL,
    actualizado TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reportes_user ON reportes(user_id);
CREATE INDEX IF NOT EXISTS idx_historias_equipo ON historias(equipo_id);
CREATE INDEX IF NOT EXISTS idx_historias_user ON historias(user_id);
"""


def ahora():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Crea las tablas si no existen y carga los datos iniciales."""
    db = get_db()
    db.executescript(SCHEMA)
    _seed_equipos(db)
    _seed_admin(db)
    db.commit()


def _seed_equipos(db):
    if db.execute("SELECT COUNT(*) FROM equipos").fetchone()[0]:
        return
    t = ahora()
    for e in EQUIPOS_INICIALES:
        db.execute(
            """INSERT OR IGNORE INTO equipos
               (nombre, mundo, mision, anio, estado, creador, rol_creador, historia,
                legado, imagen_url, credito, fuente_url, creado, actualizado)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (e["nombre"], e["mundo"], e["mision"], e["anio"], e["estado"],
             e["creador"], e["rol_creador"], e["historia"], e["legado"],
             e["imagen_url"], e["credito"], e["fuente_url"], t, t),
        )


def _seed_admin(db):
    email = current_app.config["ADMIN_EMAIL"].strip().lower()
    if current_app.config.get("ADMIN_PASSWORD_FROM_ENV"):
        # En despliegue, la contraseña definida en el entorno manda sobre la de la BD.
        db.execute("UPDATE users SET password_hash = ? WHERE email = ? AND rol = 'ADMIN'",
                   (generate_password_hash(current_app.config["ADMIN_PASSWORD"]), email))
    if db.execute("SELECT 1 FROM users WHERE rol = 'ADMIN'").fetchone():
        return
    db.execute(
        "INSERT OR IGNORE INTO users (nombre, email, password_hash, rol, creado) "
        "VALUES (?,?,?,?,?)",
        ("Administrador", email,
         generate_password_hash(current_app.config["ADMIN_PASSWORD"]),
         "ADMIN", ahora()),
    )


@click.command("init-db")
def init_db_command():
    """Comando: flask --app app init-db"""
    init_db()
    click.echo("Base de datos lista.")


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
    with app.app_context():
        init_db()
