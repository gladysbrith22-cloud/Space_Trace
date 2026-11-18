import unittest

from app import app


class FlaskRoutesTestCase(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()

    def get_response(self, path, method="GET"):
        response = self.client.open(path, method=method)
        self.addCleanup(response.close)
        return response

    def test_main_page_and_static_stylesheet(self):
        response = self.get_response("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Space Trace", response.data)

        stylesheet = self.get_response("/static/css/estilos.css")
        self.assertEqual(stylesheet.status_code, 200)

        for path in (
            "/static/img/Logo/Logo.png",
            "/static/Fondo/EspacioExterior.jpg",
            "/static/Fondo/SonidoEspacial.mp3",
        ):
            with self.subTest(asset=path):
                asset = self.get_response(path, method="HEAD")
                self.assertEqual(asset.status_code, 200)

    def test_embedded_game_pages(self):
        game_pages = (
            ("/mision-luna", "Misión Luna 3D: ¡Mide antes del queso!"),
            ("/cohete-luna", "Misión Tierra → Luna"),
        )
        for path, title in game_pages:
            with self.subTest(path=path):
                response = self.get_response(path)
                self.assertEqual(response.status_code, 200)
                self.assertIn(f"<title>{title}</title>".encode(), response.data)
                self.assertIn(b'id="go"', response.data)

    def test_game_scripts_point_to_flask_routes(self):
        response = self.get_response("/static/js/juego-main.js")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'mountEmbed("/mision-luna")', response.data)
        self.assertIn(b'mountEmbed("/cohete-luna")', response.data)


if __name__ == "__main__":
    unittest.main()
