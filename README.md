# Quizzes de repaso

Sitio estático (sin build). El motor está en `quiz.html` + `quiz.js` y cada clase es un JSON en `quizzes/`.

## Agregar el quiz de una clase nueva
1. Copiá `quizzes/clase-01.json` a `quizzes/clase-02.json` y editá las preguntas.
2. Agregá una entrada arriba de todo en `quizzes/manifest.json` (`id` = nombre del archivo sin `.json`).
3. `git push`. En un minuto está online en `https://<usuario>.github.io/<repo>/quiz.html?q=clase-02`.

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
