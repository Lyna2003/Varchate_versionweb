const dropdown = document.getElementById("dropdown");
const hamburger = document.querySelector(".hamburger");

hamburger.addEventListener("click", () => {
  dropdown.classList.toggle("show");
});

// Cerrar al hacer clic en un link
dropdown.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    dropdown.classList.remove("show");
  });
});

// ===============================
//           CODEMIRROR EDITORS
// ===============================

// ---------- Editor HTML ----------
const editorHTML = CodeMirror.fromTextArea(
  document.getElementById("code-editor"),
  {
    mode: "xml",
    theme: "default",
    lineNumbers: true,
    tabSize: 2,
    autoCloseTags: true,
    autoCloseBrackets: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
  }
);

// Autocompletado automático para HTML
editorHTML.on("inputRead", function (cm, change) {
  if (change.text[0] === "<") {
    CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
  }
});

// ---------- Editor CSS ----------
const editorCSS = CodeMirror.fromTextArea(
  document.getElementById("code-editor-css"),
  {
    mode: "css",
    theme: "default",
    lineNumbers: true,
    autoCloseBrackets: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
  }
);

// Autocompletado automático para CSS
editorCSS.on("inputRead", function (cm, change) {
  if (/[a-zA-Z]/.test(change.text[0])) {
    CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
  }
});

// Auto-actualización CSS en tiempo real
editorCSS.on("change", ejecutarCodigoCSS);

// ---------- Editor JS (opcional) ----------
const editorJS = CodeMirror.fromTextArea(
  document.getElementById("code-editor-js"),
  {
    mode: "javascript",
    theme: "default",
    lineNumbers: true,
    autoCloseBrackets: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
  }
);

// Autocompletado automático para JS
editorJS.on("inputRead", function (cm, change) {
  if (/[a-zA-Z]/.test(change.text[0])) {
    CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
  }
});

// ---------- Editor SQL ----------
const editorSQL = CodeMirror.fromTextArea(
  document.getElementById("code-editor-sql"),
  {
    mode: "text/x-sql",
    theme: "default",
    lineNumbers: true,
    tabSize: 2,
    autoCloseBrackets: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
  }
);

// Autocompletado automático para SQL
editorSQL.on("inputRead", function (cm, change) {
  if (/[a-zA-Z]/.test(change.text[0])) {
    CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
  }
});

// ===============================
//         FUNCIONES DE EJECUCIÓN
// ===============================

// Ejecutar HTML
function ejecutarCodigo() {
  const code = editorHTML.getValue();
  const previewFrame = document.getElementById("preview");
  const preview =
    previewFrame.contentDocument || previewFrame.contentWindow.document;

  preview.open();
  preview.write(code);
  preview.close();
}

// Ejecutar CSS
function ejecutarCodigoCSS() {
  const code = editorCSS.getValue();
  const iframe = document.getElementById("preview-css");

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

function ejecutarCodigoJS() {
  const code = editorJS.getValue();
  const iframe = document.getElementById("preview-js");

  // Construir el contenido del iframe
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

// ===============================
//     EJECUCIÓN DE CONSULTAS SQL
// ===============================

// Datos de ejemplo (tabla Customers)
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

// Función para generar tablas en HTML
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

// Función principal para ejecutar SQL simulado
function ejecutarCodigoSQL() {
  const consulta = editorSQL.getValue().trim();
  const preview = document.getElementById("preview-sql");

  let resultado = "";

  // Normalizamos la consulta a mayúsculas para analizar
  const consultaUpper = consulta.toUpperCase();

  // Caso 1: SELECT * FROM Customers
  if (
    consultaUpper === "SELECT * FROM CUSTOMERS;" ||
    consultaUpper === "SELECT * FROM CUSTOMERS"
  ) {
    resultado = generarTabla(customers, [
      "id",
      "name",
      "lastname",
      "country",
      "email",
    ]);
  }

  // Caso 2: SELECT name, email FROM Customers
  else if (consultaUpper.includes("SELECT NAME, EMAIL FROM CUSTOMERS")) {
    const data = customers.map((c) => ({ name: c.name, email: c.email }));
    resultado = generarTabla(data, ["name", "email"]);
  }

  // Caso 3: SELECT * FROM Customers WHERE country = 'México'
  else if (consultaUpper.includes("WHERE COUNTRY = 'MÉXICO'")) {
    const data = customers.filter((c) => c.country === "México");
    resultado = generarTabla(data, [
      "id",
      "name",
      "lastname",
      "country",
      "email",
    ]);
  }

  // Caso 4: SELECT * FROM Customers ORDER BY name
  else if (consultaUpper.includes("ORDER BY NAME")) {
    const data = [...customers].sort((a, b) => a.name.localeCompare(b.name));
    resultado = generarTabla(data, [
      "id",
      "name",
      "lastname",
      "country",
      "email",
    ]);
  }

  // Consulta no soportada
  else {
    resultado = `<p style="color:red; font-weight:bold;">❌ Consulta no soportada en la demo.<br>
      Prueba con:<br>
      1️⃣ SELECT * FROM Customers;<br>
      2️⃣ SELECT name, email FROM Customers;<br>
      3️⃣ SELECT * FROM Customers WHERE country = 'México';<br>
      4️⃣ SELECT * FROM Customers ORDER BY name;
    </p>`;
  }

  preview.innerHTML = resultado;
}

const editorPHP = CodeMirror.fromTextArea(
  document.getElementById("code-editor-php"),
  {
    mode: "application/x-httpd-php", // modo correcto para PHP
    theme: "darcula", // tema que resalte colores
    lineNumbers: true,
    tabSize: 2,
    autoCloseTags: true,
    autoCloseBrackets: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
  }
);

function ejecutarCodigoPHP() {
  const code = editorPHP.getValue().trim();
  const preview = document.getElementById("preview-php");

  let output = "";

  // Ejemplo 1: Mostrar mensaje
  if (/echo\s*["']Hola, Mundo desde PHP!["']/.test(code)) {
    output += "Hola, Mundo desde PHP!<br>";
  }

  // Ejemplo 2: Crear variable y mostrarla
  const nombreMatch = code.match(/\$nombre\s*=\s*["'](.+?)["'];/);
  if (nombreMatch && code.includes("echo") && code.includes("$nombre")) {
    output += `Hola, ${nombreMatch[1]}<br>`;
  }

  // Ejemplo 3: Sumar dos números
  const aMatch = code.match(/\$a\s*=\s*(\d+);/);
  const bMatch = code.match(/\$b\s*=\s*(\d+);/);
  if (aMatch && bMatch && code.includes("echo") && code.includes("$suma")) {
    const suma = parseInt(aMatch[1]) + parseInt(bMatch[1]);
    output += `La suma de ${aMatch[1]} y ${bMatch[1]} es: ${suma}<br>`;
  }

  // Si no coincide con ningún ejemplo
  if (!output) {
    output =
      '<span style="color:red;">❌ Código PHP no soportado en la demo</span>';
  }

  preview.innerHTML = output;
}
