from .base import BaseTestCase

REP = {"tipo": "Error", "seccion": "Juegos", "mensaje": "El juego del rover se queda congelado al terminar.", "calificacion": "3"}


class ReportesTests(BaseTestCase):
    def test_requiere_login(self):
        r = self.client.get("/reportes")
        self.assertEqual(r.status_code, 302)
        self.assertIn("/login", r.headers["Location"])
        self.assertEqual(self.client.post("/reportes", data=REP).status_code, 302)
        self.assertEqual(len(self.consulta("SELECT 1 FROM reportes")), 0)

    def test_crear_y_listar_propio(self):
        self.login_explorador()
        r = self.client.post("/reportes", data=REP, follow_redirects=True)
        self.assertIn(b"El juego del rover", r.data)
        self.assertEqual(self.consulta("SELECT calificacion, estado FROM reportes")[0]["estado"], "Pendiente")

    def test_validaciones(self):
        self.login_explorador()
        for extra in ({"tipo": "Otro"}, {"seccion": "Nada"}, {"mensaje": "corto"}, {"calificacion": "9"}):
            with self.subTest(extra=extra):
                self.client.post("/reportes", data={**REP, **extra})
        self.assertEqual(len(self.consulta("SELECT 1 FROM reportes")), 0)

    def test_editar_propio_pendiente(self):
        self.login_explorador()
        self.client.post("/reportes", data=REP)
        rid = self.consulta("SELECT id FROM reportes")[0]["id"]
        self.client.post(f"/reportes/{rid}/editar", data={**REP, "mensaje": "Mensaje corregido y más claro."})
        self.assertEqual(self.consulta("SELECT mensaje FROM reportes")[0]["mensaje"], "Mensaje corregido y más claro.")

    def test_explorador_solo_ve_los_suyos(self):
        self.login_explorador("ana@test.com")
        self.client.post("/reportes", data=REP)
        self.logout()
        self.login_explorador("luis@test.com")
        self.assertNotIn(b"El juego del rover", self.client.get("/reportes").data)
        rid = self.consulta("SELECT id FROM reportes")[0]["id"]
        self.assertEqual(self.client.get(f"/reportes/{rid}/editar").status_code, 403)
        self.assertEqual(self.client.post(f"/reportes/{rid}/eliminar").status_code, 403)
        self.assertEqual(len(self.consulta("SELECT 1 FROM reportes")), 1)

    def test_admin_ve_todos_responde_y_elimina(self):
        self.login_explorador()
        self.client.post("/reportes", data=REP)
        rid = self.consulta("SELECT id FROM reportes")[0]["id"]
        self.logout()
        self.login_admin()
        self.assertIn(b"El juego del rover", self.client.get("/reportes").data)
        self.client.post(f"/reportes/{rid}/responder", data={"estado": "Resuelto", "respuesta": "Corregido."})
        f = self.consulta("SELECT estado, respuesta FROM reportes")[0]
        self.assertEqual((f["estado"], f["respuesta"]), ("Resuelto", "Corregido."))
        self.client.post(f"/reportes/{rid}/eliminar")
        self.assertEqual(len(self.consulta("SELECT 1 FROM reportes")), 0)

    def test_explorador_no_puede_responder(self):
        self.login_explorador()
        self.client.post("/reportes", data=REP)
        rid = self.consulta("SELECT id FROM reportes")[0]["id"]
        self.assertEqual(self.client.post(f"/reportes/{rid}/responder", data={"estado": "Resuelto"}).status_code, 403)

    def test_no_edita_si_ya_no_esta_pendiente(self):
        self.login_explorador()
        self.client.post("/reportes", data=REP)
        rid = self.consulta("SELECT id FROM reportes")[0]["id"]
        self.logout(); self.login_admin()
        self.client.post(f"/reportes/{rid}/responder", data={"estado": "En revisión", "respuesta": ""})
        self.logout(); self.login("ana@test.com", "Clave1234")
        self.assertEqual(self.client.get(f"/reportes/{rid}/editar").status_code, 302)
