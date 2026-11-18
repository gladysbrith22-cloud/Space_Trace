import os
import tempfile
import unittest

from spacetrace import create_app

ADMIN = ("admin@test.com", "Admin12345")


class BaseTestCase(unittest.TestCase):
    """App con base de datos SQLite temporal y CSRF desactivado."""

    def setUp(self):
        fd, self.ruta = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        self.app = create_app({
            "TESTING": True, "DATABASE": self.ruta, "CSRF_ENABLED": False,
            "SECRET_KEY": "test", "ADMIN_EMAIL": ADMIN[0], "ADMIN_PASSWORD": ADMIN[1],
        })
        self.client = self.app.test_client()

    def tearDown(self):
        os.remove(self.ruta)

    def registrar(self, nombre="Ana", email="ana@test.com", password="Clave1234"):
        return self.client.post("/registro", data={
            "nombre": nombre, "email": email, "password": password,
            "confirmar": password}, follow_redirects=True)

    def login(self, email, password):
        return self.client.post("/login", data={"email": email, "password": password},
                                follow_redirects=True)

    def logout(self):
        return self.client.post("/logout", follow_redirects=True)

    def login_admin(self):
        return self.login(*ADMIN)

    def login_explorador(self, email="ana@test.com"):
        self.registrar(email=email)
        return self.login(email, "Clave1234")

    def consulta(self, sql, params=()):
        with self.app.app_context():
            from spacetrace.db import get_db
            return get_db().execute(sql, params).fetchall()

    def datos_equipo(self, **extra):
        d = {"nombre": "Surveyor 3", "mundo": "Luna", "mision": "Surveyor",
             "anio": "1967", "estado": "Abandonado", "creador": "Equipo JPL",
             "rol_creador": "Ingenieros", "historia": "Aterrizó en el Océano de las Tormentas y fue visitada por Apollo 12.",
             "legado": "Partes fueron traídas a la Tierra.", "imagen_url": "https://example.com/a.jpg",
             "credito": "NASA", "fuente_url": "https://example.com"}
        d.update(extra)
        return d
