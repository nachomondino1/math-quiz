# Quizzes de repaso

Sitio estático (sin build). El motor está en `quiz.html` + `quiz.js` y cada clase es un JSON en `quizzes/`.

## Estructura de carpetas
Los quizzes se agrupan por tema: `quizzes/<carpeta>/<id>.json` (por ejemplo `quizzes/funcion-lineal/funcion-lineal.json`). Las carpetas y los quizzes se declaran en `quizzes/manifest.json`.

## Agregar un quiz nuevo
1. Copiá un JSON de la carpeta del tema (o creá la carpeta nueva) y editá las preguntas. El `titulo` va corto: los temas que toca.
2. En `quizzes/manifest.json`, agregá una entrada en `quizzes` con `id` (nombre del archivo sin `.json`), `carpeta`, `titulo`, `fecha` y `descripcion`.
3. Si es un tema nuevo, agregá la carpeta en `carpetas` (`id`, `titulo`, `descripcion`). Una carpeta sin quizzes se muestra como "Próximamente".
4. `git push`. Queda en `https://<usuario>.github.io/<repo>/quiz.html?q=<id>`.

## Formato del JSON
- `graficos`: gráficos reutilizables (`pts` = vértices; `cross: true` = ejes cruzados en 0; `mk` = puntos en los extremos, `"c"` lleno / `"o"` círculo vacío; `xfmt: "hora"` = eje x como 8:00).
- `preguntas[]`: `tema`, `texto`, `opciones[]`, `correcta` (índice desde 0; las opciones se mezclan solas), `explicacion`, y opcionales `grafico` (clave de `graficos`) y `resaltar` (`pts`, `dom: [a,b]`, `img: [c,d]`, `guides: false`), que se dibuja después de responder.
- `consejos`: un texto por tema, se muestra al final para los temas con errores.

## Publicar
Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
Ojo: en el plan Free, Pages solo funciona con repos públicos, así que no pongas datos de la alumna en el contenido.

## Probar local
`python -m http.server 8000` y abrir http://localhost:8000 (con doble clic en el archivo no funciona: el navegador bloquea `fetch` en `file://`).

## Si cambiás `quiz.js` o `style.css`
El celular puede tener esos dos archivos guardados en caché de una visita anterior. Subí el número `?v=2` a `?v=3` (hay una referencia en `quiz.html` e `index.html`) para que el navegador baje la versión nueva. Los JSON de `quizzes/` no necesitan esto: ya se piden siempre sin caché.
