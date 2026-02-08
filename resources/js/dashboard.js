// ===============================
//          MENU HAMBURGUESA
// ===============================
const dropdown = document.getElementById("dropdown");
const hamburger = document.querySelector(".hamburger");

if (hamburger && dropdown) {
  hamburger.addEventListener("click", () => {
    dropdown.classList.toggle("show");
  });

  dropdown.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      dropdown.classList.remove("show");
    });
  });
}

// ===============================
//          CODEMIRROR SAFE
// ===============================
let editorHTML, editorCSS, editorJS, editorSQL, editorPHP;

const htmlTA = document.getElementById("code-editor");
if (htmlTA) {
  editorHTML = CodeMirror.fromTextArea(htmlTA, {
    mode: "xml",
    lineNumbers: true,
    autoCloseTags: true,
    autoCloseBrackets: true,
  });
}

const cssTA = document.getElementById("code-editor-css");
if (cssTA) {
  editorCSS = CodeMirror.fromTextArea(cssTA, {
    mode: "css",
    lineNumbers: true,
    autoCloseBrackets: true,
  });
}

const jsTA = document.getElementById("code-editor-js");
if (jsTA) {
  editorJS = CodeMirror.fromTextArea(jsTA, {
    mode: "javascript",
    lineNumbers: true,
    autoCloseBrackets: true,
  });
}

const sqlTA = document.getElementById("code-editor-sql");
if (sqlTA) {
  editorSQL = CodeMirror.fromTextArea(sqlTA, {
    mode: "text/x-sql",
    lineNumbers: true,
    autoCloseBrackets: true,
  });
}

const phpTA = document.getElementById("code-editor-php");
if (phpTA) {
  editorPHP = CodeMirror.fromTextArea(phpTA, {
    mode: "application/x-httpd-php",
    lineNumbers: true,
    autoCloseBrackets: true,
  });
}

// ===============================
//        BOTONES
// ===============================
document.getElementById("btn-html")?.addEventListener("click", ejecutarHTML);
document.getElementById("btn-css")?.addEventListener("click", ejecutarCSS);
document.getElementById("btn-js")?.addEventListener("click", ejecutarJS);
document.getElementById("btn-sql")?.addEventListener("click", ejecutarSQL);
document.getElementById("btn-php")?.addEventListener("click", ejecutarPHP);

// ===============================
//        EJECUCIONES
// ===============================

// ---------- HTML ----------
function ejecutarHTML() {
  if (!editorHTML) return;

  const iframe = document.getElementById("preview");
  if (!iframe) return;

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(editorHTML.getValue());
  doc.close();
}

// ---------- CSS ----------
function ejecutarCSS() {
  const code = editorCSS.getValue();
  const iframe = document.getElementById("preview-css");
  if (!iframe) return;

  iframe.srcdoc = `
    <html>
      <head>
        <style>${code}</style>
      </head>
      <body>
        <h1>Vista previa CSS</h1>
        <p>Escribe tu código CSS en el editor para ver los cambios aquí.</p>
      </body>
    </html>
  `;
}


// ---------- JS ----------
function ejecutarJS() {
  const code = editorJS.getValue();
  const iframe = document.getElementById("preview-js");
  if (!iframe) return;

  iframe.srcdoc = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .notice { color: darkgreen; font-weight: bold; margin-top: 10px; }
        </style>
      </head>
      <body>
        <h1>JS Output</h1>
        <p>Tu código JS se ejecuta aquí:</p>
        <div class="notice">
          Los console.log se ven en la <strong>Consola del navegador</strong> (F12 → Consola)
        </div>
        <script>
          try {
            ${code}
          } catch(e) {
            console.error(e);
          }
        </script>
      </body>
    </html>
  `;
}


// ---------- SQL ----------
const customers = [
  {
    id: 1,
    name: "Ana",
    lastname: "Trujillo",
    country: "México",
    email: "ana@correo.com",
  },
  {
    id: 2,
    name: "Antonio",
    lastname: "Moreno",
    country: "España",
    email: "antonio@correo.com",
  },
  {
    id: 3,
    name: "Francisco",
    lastname: "Chang",
    country: "México",
    email: "francisco@correo.com",
  },
  {
    id: 4,
    name: "Guillermo",
    lastname: "Fernández",
    country: "Argentina",
    email: "guillermo@correo.com",
  },
  {
    id: 5,
    name: "Sofía",
    lastname: "López",
    country: "Colombia",
    email: "sofia@correo.com",
  },
  {
    id: 6,
    name: "Carlos",
    lastname: "Hernández",
    country: "España",
    email: "carlos@correo.com",
  },
];

function generarTabla(data, columnas) {
  if (!data.length)
    return "<p style='color:red'>⚠️ No se encontraron resultados</p>";

  let table = `<table border="1" style="border-collapse: collapse; width: 100%; text-align: left;">
    <thead><tr>`;

  columnas.forEach((col) => {
    table += `<th style="padding: 6px; background:#f0f0f0;">${col}</th>`;
  });
  table += "</tr></thead><tbody>";

  data.forEach((row) => {
    table += "<tr>";
    columnas.forEach((col) => {
      table += `<td style="padding: 6px;">${row[col]}</td>`;
    });
    table += "</tr>";
  });

  table += "</tbody></table>";
  return table;
}

function ejecutarSQL() {
  const preview = document.getElementById("preview-sql");
  if (!preview) return;

  const query = editorSQL.getValue().toUpperCase();

  if (query.includes("SELECT") && query.includes("CUSTOMERS")) {
    preview.innerHTML = generarTabla(customers, [
      "id",
      "name",
      "lastname",
      "country",
      "email",
    ]);
  } else {
    preview.innerHTML =
      "<p style='color:red'>❌ Consulta SQL no soportada</p>";
  }
}



// ---------- PHP ----------
function ejecutarPHP() {
  if (!editorPHP) return;

  const preview = document.getElementById("preview-php");
  if (!preview) return;

  const code = editorPHP.getValue();
  let salida = "";

  if (code.includes("Hola")) salida += "Hola, Mundo desde PHP!<br>";

  const nombre = code.match(/\$nombre\s*=\s*["'](.+?)["']/);
  if (nombre) salida += `Hola, ${nombre[1]}<br>`;

  const a = code.match(/\$a\s*=\s*(\d+)/);
  const b = code.match(/\$b\s*=\s*(\d+)/);
  if (a && b) salida += `La suma es: ${+a[1] + +b[1]}`;

  preview.innerHTML =
    salida || "<span style='color:red'>Código PHP no soportado</span>";
}
