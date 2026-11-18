from .base import BaseTestCase

HIST = {"titulo": "Mi primera visita", "texto": "Me encantó conocer esta máquina."}


class HistoriasTests(BaseTestCase):
    def test_publicar_requiere_login(self):
        r = self.client.post("/archivo/1/historias", data=HIST)
        self.assertEqual(r.status_code, 302)
        self.assertEqual(len(self.consulta("SELECT 1 FROM historias")), 0)

    def test_crear_editar_eliminar_propia(self):
        self.login_explorador()
        r = self.client.post("/archivo/1/historias", data=HIST, follow_redirects=True)
        self.assertIn(b"Mi primera visita", r.data)
        hid = self.consulta("SELECT id FROM historias")[0]["id"]
        r = self.client.post(f"/historias/{hid}/editar",
                             data={"titulo": "Título nuevo", "texto": "Texto actualizado ok."},
                             follow_redirects=True)
        self.assertIn("Título nuevo".encode(), r.data)
        self.client.post(f"/historias/{hid}/eliminar")
        self.assertEqual(len(self.consulta("SELECT 1 FROM historias")), 0)

    def test_validacion_historia(self):
        self.login_explorador()
        r = self.client.post("/archivo/1/historias", data={"titulo": "a", "texto": "b"},
                             follow_redirects=True)
        self.assertIn(b"El t", r.data)
        self.assertEqual(len(self.consulta("SELECT 1 FROM historias")), 0)

    def test_no_se_toca_historia_ajena(self):
        self.login_explorador("ana@test.com")
        self.client.post("/archivo/1/historias", data=HIST)
        hid = self.consulta("SELECT id FROM historias")[0]["id"]
        self.logout()
        self.login_explorador("luis@test.com")
        self.assertEqual(self.client.get(f"/historias/{hid}/editar").status_code, 403)
        self.assertEqual(self.client.post(f"/historias/{hid}/eliminar").status_code, 403)
        self.assertEqual(len(self.consulta("SELECT 1 FROM historias")), 1)

    def test_admin_puede_moderar(self):
        self.login_explorador()
        self.client.post("/archivo/1/historias", data=HIST)
        hid = self.consulta("SELECT id FROM historias")[0]["id"]
        self.logout()
        self.login_admin()
        self.client.post(f"/historias/{hid}/eliminar")
        self.assertEqual(len(self.consulta("SELECT 1 FROM historias")), 0)

    def test_panel_lista_mis_historias(self):
        self.login_explorador()
        self.client.post("/archivo/2/historias", data=HIST)
        self.assertIn(b"Mi primera visita", self.client.get("/panel").data)


class AdminUsuariosTests(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.registrar()
        self.uid = self.consulta("SELECT id FROM users WHERE email='ana@test.com'")[0]["id"]
        self.login_admin()

    def test_listar(self):
        self.assertIn(b"ana@test.com", self.client.get("/admin/usuarios").data)

    def test_cambiar_rol(self):
        self.client.post(f"/admin/usuarios/{self.uid}/rol", data={"rol": "ADMIN"})
        self.assertEqual(self.consulta("SELECT rol FROM users WHERE id=?", (self.uid,))[0]["rol"], "ADMIN")

    def test_rol_invalido(self):
        self.assertEqual(self.client.post(f"/admin/usuarios/{self.uid}/rol", data={"rol": "ROOT"}).status_code, 400)

    def test_eliminar_usuario(self):
        self.client.post(f"/admin/usuarios/{self.uid}/eliminar")
        self.assertEqual(len(self.consulta("SELECT 1 FROM users WHERE id=?", (self.uid,))), 0)

    def test_no_se_elimina_ni_desactiva_el_ultimo_admin(self):
        aid = self.consulta("SELECT id FROM users WHERE rol='ADMIN'")[0]["id"]
        self.client.post(f"/admin/usuarios/{aid}/eliminar")
        self.client.post(f"/admin/usuarios/{aid}/estado")
        self.client.post(f"/admin/usuarios/{aid}/rol", data={"rol": "EXPLORADOR"})
        r = self.consulta("SELECT rol, activo FROM users WHERE id=?", (aid,))[0]
        self.assertEqual((r["rol"], r["activo"]), ("ADMIN", 1))
