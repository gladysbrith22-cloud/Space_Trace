from .base import BaseTestCase


class RolesTests(BaseTestCase):
    def test_anonimo_redirigido_al_login(self):
        for ruta in ("/panel", "/archivo/nuevo", "/admin/usuarios"):
            with self.subTest(ruta=ruta):
                r = self.client.get(ruta)
                self.assertEqual(r.status_code, 302)
                self.assertIn("/login", r.headers["Location"])

    def test_explorador_no_puede_gestionar_equipos(self):
        self.login_explorador()
        self.assertEqual(self.client.get("/archivo/nuevo").status_code, 403)
        self.assertEqual(self.client.post("/archivo/nuevo", data=self.datos_equipo()).status_code, 403)
        self.assertEqual(self.client.get("/archivo/1/editar").status_code, 403)
        self.assertEqual(self.client.post("/archivo/1/eliminar").status_code, 403)
        self.assertEqual(len(self.consulta("SELECT 1 FROM equipos")), 5)

    def test_explorador_no_accede_a_admin(self):
        self.login_explorador()
        self.assertEqual(self.client.get("/admin/usuarios").status_code, 403)
        self.assertEqual(self.client.post("/admin/usuarios/1/rol", data={"rol": "ADMIN"}).status_code, 403)

    def test_admin_si_accede(self):
        self.login_admin()
        self.assertEqual(self.client.get("/archivo/nuevo").status_code, 200)
        self.assertEqual(self.client.get("/admin/usuarios").status_code, 200)
