"""Punto de entrada. Local: `python app.py`. Render: `gunicorn app:app`."""
from spacetrace import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
