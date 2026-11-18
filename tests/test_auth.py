from .base import BaseTestCase, ADMIN


class AuthTests(BaseTestCase):
    def test_registro_crea_explorador(self):
        r = self.registrar()
        self.assertIn("Cuenta creada".encode(), r.data)
        u = self.consulta("SELECT rol, password_hash FROM users WHERE email='ana@test.com'")[0]
        self.assertEqual(u["rol"], "EXPLORADOR")
        self.assertNotIn("Clave1234", u["password_hash"])

    def test_registro_no_permite_elegir_rol_admin(self):
        self.client.post("/registro", data={
            "nombre": "Mal", "email": "mal@test.com", "password": "Clave1234",
            "confirmar": "Clave1234", "rol": "ADMIN"})
        self.assertEqual(self.consulta("SELECT rol FROM users WHERE email='mal@test.com'")[0]["rol"],
                         "EXPLORADOR")

    def test_registro_valida_datos(self):
        casos = [
            ({"password": "corta1", "confirmar": "corta1"}, b"al menos 8"),
            ({"password": "sololetras", "confirmar": "sololetras"}, b"al menos 8"),
            ({"password": "Clave1234", "confirmar": "Otra12345"}, b"no coinciden"),
            ({"email": "no-es-correo"}, "correo electrónico válido".encode()),
        ]
        for extra, texto in casos:
            with self.subTest(extra=extra):
                datos = {"nombre": "Ana", "email": "ana@test.com",
                         "password": "Clave1234", "confirmar": "Clave1234"}
                datos.update(extra)
                self.assertIn(texto, self.client.post("/registro", data=datos).data)

    def test_correo_duplicado(self):
        self.registrar()
        r = self.registrar()
        self.assertIn(b"Ya existe una cuenta", r.data)

    def test_login_correcto_y_logout(self):
        self.registrar()
        r = self.login("ana@test.com", "Clave1234")
        self.assertIn(b"Mi panel", r.data)
        r = self.logout()
        self.assertIn(b"window.ST_USER = null", r.data)
        self.assertEqual(self.client.get("/panel").status_code, 302)

    def test_login_incorrecto(self):
        self.registrar()
        r = self.login("ana@test.com", "MalaClave1")
        self.assertIn(b"incorrectos", r.data)
        self.assertEqual(self.client.get("/panel").status_code, 302)

    def test_cuenta_desactivada_no_entra(self):
        self.registrar()
        self.login_admin()
        uid = self.consulta("SELECT id FROM users WHERE email='ana@test.com'")[0]["id"]
        self.client.post(f"/admin/usuarios/{uid}/estado")
        self.logout()
        self.assertIn("desactivada".encode(), self.login("ana@test.com", "Clave1234").data)

    def test_redireccion_next_solo_interna(self):
        self.registrar()
        r = self.client.post("/login?next=//evil.com", data={
            "email": "ana@test.com", "password": "Clave1234", "next": "//evil.com"})
        self.assertTrue(r.headers["Location"].endswith("/panel"))

    def test_admin_inicial_existe(self):
        self.assertIn(b"Mi panel", self.login_admin().data)

    def test_csrf_bloquea_post_sin_token(self):
        self.app.config["CSRF_ENABLED"] = True
        r = self.client.post("/login", data={"email": ADMIN[0], "password": ADMIN[1]})
        self.assertEqual(r.status_code, 400)
