document.addEventListener('DOMContentLoaded', () => {
    console.log("Simulador.js cargado y corregido.");

    const juegoSelector = document.getElementById('juego-selector');
    const matrizContainer = document.getElementById('matriz-container');
    const explicacionContainer = document.getElementById('explicacion-container');
    const defaultExplicacion = '<p>Pasa el ratón sobre cualquier celda de la matriz para un análisis detallado de los incentivos.</p>';

    // --- DATOS DE LOS JUEGOS ---
    const juegos = {
        'dilema-prisionero': {
            nombre: 'Dilema del Prisionero (Clásico)',
            jugadores: ['Prisionero 1', 'Prisionero 2'],
            estrategias: ['Confesar', 'No Confesar'],
            pagos: [
                [[-5, -5], [0, -10]],
                [[-10, 0], [-1, -1]]
            ]
        },
        'competencia-precios': {
            nombre: 'Competencia de Precios (Duopolio)',
            jugadores: ['Coca-Cola', 'Pepsi'],
            estrategias: ['Precio Bajo', 'Precio Alto'],
            pagos: [
                [[100, 100], [300, 50]],
                [[50, 300], [200, 200]]
            ]
        },
        'gasto-campana': {
            nombre: 'Gasto de Campaña (Dilema del Prisionero)',
            jugadores: ['Partido Azul', 'Partido Rojo'],
            estrategias: ['Alto Gasto', 'Bajo Gasto'],
            pagos: [
                [[-5, -5], [10, -10]],
                [[-10, 10], [5, 5]]
            ]
        },
        'guerra-formatos': {
            nombre: 'Guerra de Formatos (Juego de Coordinación)',
            jugadores: ['Sony (Blu-ray)', 'Toshiba (HD-DVD)'],
            estrategias: ['Lanz. Agresivo', 'Lanz. Limitado'],
            pagos: [
                [[20, 20], [80, 10]],
                [[10, 80], [40, 40]]
            ]
        },
        'competencia-publicidad': {
            nombre: 'Competencia con Publicidad',
            jugadores: ['Empresa A', 'Empresa B'],
            estrategias: ['Publicitar', 'No Publicitar'],
            pagos: [
                [[5, 5], [10, 0]],
                [[0, 10], [2, 2]]
            ]
        },
        'pares-nones': {
            nombre: 'Pares o Nones (Suma Cero)',
            jugadores: ['Jugador 1', 'Jugador 2'],
            estrategias: ['1 Dedo', '2 Dedos'],
            pagos: [
                [[1, -1], [-1, 1]],
                [[-1, 1], [1, -1]]
            ]
        },
        'bien-publico': {
            nombre: 'Provisión de Bien Público (Free-Rider)',
            jugadores: ['Vecino 1', 'Vecino 2'],
            estrategias: ['Contribuir', 'No Contribuir'],
            pagos: [
                [[4, 4], [-2, 10]],
                [[10, -2], [0, 0]]
            ]
        }
    };

    // --- FUNCIONES REFACTORIZADAS ---

    function poblarSelector() {
        juegoSelector.innerHTML = '';
        for (const key in juegos) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = juegos[key].nombre;
            juegoSelector.appendChild(option);
        }
    }

    function esNash(juego, fila, col) {
        const pagoActual = juego.pagos[fila][col];
        const pagoAlternativoP1 = juego.pagos[1 - fila][col];
        if (pagoAlternativoP1[0] > pagoActual[0]) return false;
        const pagoAlternativoP2 = juego.pagos[fila][1 - col];
        if (pagoAlternativoP2[1] > pagoActual[1]) return false;
        return true;
    }

    function analizarCelda(juego, fila, col) {
        const [p1, p2] = juego.jugadores;
        const pagoActual = juego.pagos[fila][col];
        let explicacion = `<h3>Análisis de la casilla: (${juego.estrategias[fila]}, ${juego.estrategias[col]})</h3>`;
        explicacion += `<p><b>Pagos:</b> ${p1} recibe ${pagoActual[0]}, ${p2} recibe ${pagoActual[1]}.</p><h4>Análisis de Incentivos:</h4><ul>`;

        const pagoAlternativoP1 = juego.pagos[1 - fila][col];
        if (pagoAlternativoP1[0] > pagoActual[0]) {
            explicacion += `<li>A ${p1} <b>le conviene cambiar</b> a '${juego.estrategias[1 - fila]}' (ganaría ${pagoAlternativoP1[0]} en vez de ${pagoActual[0]}).</li>`;
        } else {
            explicacion += `<li>A ${p1} <b>no le conviene cambiar</b>.</li>`;
        }

        const pagoAlternativoP2 = juego.pagos[fila][1 - col];
        if (pagoAlternativoP2[1] > pagoActual[1]) {
            explicacion += `<li>A ${p2} <b>le conviene cambiar</b> a '${juego.estrategias[1 - col]}' (ganaría ${pagoAlternativoP2[1]} en vez de ${pagoActual[1]}).</li>`;
        } else {
            explicacion += `<li>A ${p2} <b>no le conviene cambiar</b>.</li>`;
        }
        
        explicacion += `</ul><hr>`;
        if (esNash(juego, fila, col)) {
            explicacion += `<p class="conclusion-nash"><b>Conclusión:</b> ¡Es un <strong>Equilibrio de Nash!</strong></p>`;
        } else {
            explicacion += `<p class="conclusion-no-nash"><b>Conclusión:</b> <strong>NO es un Equilibrio de Nash.</strong></p>`;
        }
        explicacionContainer.innerHTML = explicacion;
    }

    function analizarJuegoCompleto(juego) {
        const equilibrios = [];
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                if (esNash(juego, i, j)) {
                    equilibrios.push(`(${juego.estrategias[i]}, ${juego.estrategias[j]})`);
                    const celda = matrizContainer.querySelector(`[data-fila="${i}"][data-col="${j}"]`);
                    if(celda) celda.classList.add('nash-equilibrium');
                }
            }
        }

        let explicacionFinal = `<h3>Análisis General: ${juego.nombre}</h3>`;
        if (equilibrios.length > 0) {
            explicacionFinal += `<p class="conclusion-nash">Se encontró ${equilibrios.length} Equilibrio(s) de Nash en: <strong>${equilibrios.join(', ')}</strong>.</p>`;
        } else {
            explicacionFinal += `<p class="conclusion-no-nash">No se encontraron Equilibrios de Nash en estrategias puras. El equilibrio podría existir en estrategias mixtas.</p>`;
        }
        explicacionFinal += defaultExplicacion;
        explicacionContainer.innerHTML = explicacionFinal;
    }

    function generarMatriz(juegoId) {
        const juego = juegos[juegoId];
        if (!juego) return;

        let html = '<table>';
        html += `<thead><tr><th></th><th>${juego.jugadores[1]}<br>(${juego.estrategias[0]})</th><th>${juego.jugadores[1]}<br>(${juego.estrategias[1]})</th></tr></thead>`;
        html += '<tbody>';
        juego.estrategias.forEach((estP1, i) => {
            html += `<tr><th>${juego.jugadores[0]}<br>(${estP1})</th>`;
            juego.estrategias.forEach((estP2, j) => {
                const pago = juego.pagos[i][j];
                html += `<td data-fila="${i}" data-col="${j}">${pago[0]}, ${pago[1]}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        matrizContainer.innerHTML = html;
        
        matrizContainer.querySelectorAll('td').forEach(celda => {
            celda.addEventListener('mouseover', () => {
                const fila = parseInt(celda.dataset.fila);
                const col = parseInt(celda.dataset.col);
                analizarCelda(juego, fila, col);
            });
        });

        matrizContainer.querySelector('table').addEventListener('mouseout', () => {
            analizarJuegoCompleto(juego);
        });

        analizarJuegoCompleto(juego);
    }

    // --- INICIALIZACIÓN ---
    poblarSelector();
    
    juegoSelector.addEventListener('change', (e) => {
        generarMatriz(e.target.value);
        const juegoInteractivo = document.getElementById('juego-interactivo-container');
        juegoInteractivo.style.display = e.target.value === 'pares-nones' ? 'block' : 'none';
    });

    generarMatriz(juegoSelector.value);
    document.getElementById('juego-interactivo-container').style.display = 'none';

    // --- LÓGICA DEL JUEGO INTERACTIVO DE PARES Y NONES ---
    const controlesParesNones = document.getElementById('controles-pares-nones');
    const resultadoParesNones = document.getElementById('resultado-pares-nones');
    const notaAlgoritmo = document.getElementById('nota-algoritmo');
    let prediccionJugador = null;

    if (controlesParesNones) {
        controlesParesNones.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') return;

            if (e.target.dataset.prediccion) {
                prediccionJugador = e.target.dataset.prediccion;
                controlesParesNones.querySelectorAll('[data-prediccion]').forEach(btn => btn.classList.remove('seleccionado'));
                e.target.classList.add('seleccionado');
                resultadoParesNones.innerHTML = `<p>Has elegido <strong>${prediccionJugador.toUpperCase()}</strong>. Ahora muestra tus dedos.</p>`;
                return;
            }

            if (e.target.dataset.dedos) {
                if (!prediccionJugador) {
                    resultadoParesNones.innerHTML = `<p style="color: red;">Por favor, primero elige tu predicción (Pares o Nones).</p>`;
                    return;
                }
                jugarParesNones(prediccionJugador, parseInt(e.target.dataset.dedos));
            }
        });
    }

    function jugarParesNones(prediccion, dedosJ1) {
        let dedosJ2;
        if (prediccion === 'pares') {
            dedosJ2 = (dedosJ1 % 2 === 1) ? 1 : 2;
            notaAlgoritmo.innerHTML = Math.random() < 0.9 ? "<p>(Nota: El algoritmo del Jugador 2 ha sido alterado para que el Jugador 1 gane el 90% de las veces al elegir 'Pares'.)</p>" : "<p>(Nota: El algoritmo del Jugador 2 ha sido alterado... pero esta vez tuviste mala suerte.)</p>";
        } else {
            dedosJ2 = Math.random() < 0.5 ? 1 : 2;
            notaAlgoritmo.innerHTML = "";
        }

        const suma = dedosJ1 + dedosJ2;
        const esPar = suma % 2 === 0;
        let resultadoTexto = ((esPar && prediccion === 'pares') || (!esPar && prediccion === 'nones')) 
            ? `<strong style="color: green;">¡GANASTE!</strong>` 
            : `<strong style="color: red;">PERDISTE.</strong>`;

        resultadoParesNones.innerHTML = `
            <p>Tú mostraste <strong>${dedosJ1}</strong> dedo(s). El Jugador 2 mostró <strong>${dedosJ2}</strong> dedo(s).</p>
            <p>La suma es <strong>${suma}</strong>. ${resultadoTexto}</p>`;
        
        prediccionJugador = null;
        controlesParesNones.querySelectorAll('[data-prediccion]').forEach(btn => btn.classList.remove('seleccionado'));
    }
    
    const style = document.createElement('style');
    style.innerHTML = `.sim-btn.seleccionado { background-color: #007bff; color: white; border: 2px solid #0056b3; transform: scale(1.05); }`;
    document.head.appendChild(style);
});