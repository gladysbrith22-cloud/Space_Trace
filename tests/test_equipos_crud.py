from .base import BaseTestCase


class EquiposCrudTests(BaseTestCase):
    def test_datos_iniciales_y_listado_publico(self):
        r = self.client.get("/archivo")
        self.assertEqual(r.status_code, 200)
        self.assertIn(b"Voyager 1", r.data)
        self.assertEqual(len(self.client.get("/api/equipos").get_json()), 5)

    def test_filtros_de_busqueda(self):
        r = self.client.get("/archivo?mundo=Marte")
        self.assertIn(b"Opportunity", r.data)
        self.assertNotIn(b"Voyager 1<", r.data)
        self.assertIn(b"Squyres", self.client.get("/archivo?q=Squyres").data)

    def test_crear_equipo(self):
        self.login_admin()
        r = self.client.post("/archivo/nuevo", data=self.datos_equipo(), follow_redirects=True)
        self.assertIn(b"Surveyor 3", r.data)
        self.assertEqual(len(self.consulta("SELECT 1 FROM equipos WHERE nombre='Surveyor 3'")), 1)

    def test_crear_valida_campos(self):
        self.login_admin()
        casos = [
            ({"mundo": "Venus"}, b"lugar v"),
            ({"anio": "abc"}, "número entre 1950".encode()),
            ({"historia": "corta"}, b"al menos 20"),
            ({"imagen_url": "javascript:alert(1)"}, b"http://"),
            ({"nombre": "Voyager 1"}, b"Ya existe"),
        ]
        for extra, texto in casos:
            with self.subTest(extra=extra):
                r = self.client.post("/archivo/nuevo", data=self.datos_equipo(**extra))
                self.assertIn(texto, r.data)
        self.assertEqual(len(self.consulta("SELECT 1 FROM equipos")), 5)

    def test_detalle_y_404(self):
        self.assertEqual(self.client.get("/archivo/1").status_code, 200)
        self.assertEqual(self.client.get("/archivo/9999").status_code, 404)

    def test_editar_equipo(self):
        self.login_admin()
        r = self.client.post("/archivo/1/editar", data=self.datos_equipo(nombre="Eagle editado"),
                             follow_redirects=True)
        self.assertIn(b"Eagle editado", r.data)
        self.assertEqual(self.consulta("SELECT nombre FROM equipos WHERE id=1")[0]["nombre"],
                         "Eagle editado")

    def test_eliminar_equipo_borra_historias(self):
        self.login_admin()
        self.client.post("/archivo/1/historias", data={"titulo": "Hola", "texto": "Texto de prueba largo"})
        self.assertEqual(len(self.consulta("SELECT 1 FROM historias")), 1)
        self.client.post("/archivo/1/eliminar")
        self.assertEqual(len(self.consulta("SELECT 1 FROM equipos WHERE id=1")), 0)
        self.assertEqual(len(self.consulta("SELECT 1 FROM historias")), 0)
