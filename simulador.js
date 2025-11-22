document.addEventListener('DOMContentLoaded', () => {
    console.log("Simulador.js cargado en modo interactivo.");

    const juegoSelector = document.getElementById('juego-selector');
    const matrizContainer = document.getElementById('matriz-container');
    const explicacionContainer = document.getElementById('explicacion-container');
    const defaultExplicacion = '<p>Pasa el ratón sobre una casilla de la matriz para analizarla.</p>';

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
            nombre: 'Guerra de Formatos (Blu-ray vs HD-DVD)',
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
            nombre: 'Pares o Nones',
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

    // --- FUNCIONES ---

    function poblarSelector() {
        juegoSelector.innerHTML = ''; // Limpiamos opciones existentes
        for (const key in juegos) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = juegos[key].nombre;
            juegoSelector.appendChild(option);
        }
    }

    function analizarCelda(juego, fila, col) {
        const [p1, p2] = juego.jugadores;
        const pagoActual = juego.pagos[fila][col];
        let explicacion = `<h3>Análisis: (${juego.estrategias[fila]}, ${juego.estrategias[col]})</h3>`;
        explicacion += `<p><b>Pagos:</b> ${p1} recibe ${pagoActual[0]}, ${p2} recibe ${pagoActual[1]}.</p>`;
        explicacion += `<h4>Análisis de Incentivos:</h4><ul>`;

        const otroFila = 1 - fila;
        const pagoAlternativoP1 = juego.pagos[otroFila][col];
        let incentivoP1 = false;
        if (pagoAlternativoP1[0] > pagoActual[0]) {
            incentivoP1 = true;
            explicacion += `<li>A ${p1} <b>le conviene cambiar</b> a '${juego.estrategias[otroFila]}' (pago cambiaría de ${pagoActual[0]} a ${pagoAlternativoP1[0]}).</li>`;
        } else {
            explicacion += `<li>A ${p1} <b>no le conviene cambiar</b> de estrategia.</li>`;
        }

        const otroCol = 1 - col;
        const pagoAlternativoP2 = juego.pagos[fila][otroCol];
        let incentivoP2 = false;
        if (pagoAlternativoP2[1] > pagoActual[1]) {
            incentivoP2 = true;
            explicacion += `<li>A ${p2} <b>le conviene cambiar</b> a '${juego.estrategias[otroCol]}' (pago cambiaría de ${pagoActual[1]} a ${pagoAlternativoP2[1]}).</li>`;
        } else {
            explicacion += `<li>A ${p2} <b>no le conviene cambiar</b> de estrategia.</li>`;
        }

        explicacion += `</ul><hr>`;

        if (!incentivoP1 && !incentivoP2) {
            explicacion += `<p class="conclusion-nash"><b>Conclusión:</b> ¡Es un <strong>Equilibrio de Nash!</strong> Ningún jugador puede mejorar su pago cambiando unilateralmente.</p>`;
        } else {
            explicacion += `<p class="conclusion-no-nash"><b>Conclusión:</b> <strong>NO es un Equilibrio de Nash</strong>, ya que al menos un jugador tiene incentivo para cambiar.</p>`;
        }

        explicacionContainer.innerHTML = explicacion;
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
        
        const celdas = matrizContainer.querySelectorAll('td');
        celdas.forEach(celda => {
            celda.addEventListener('mouseover', () => {
                const fila = celda.getAttribute('data-fila');
                const col = celda.getAttribute('data-col');
                analizarCelda(juego, parseInt(fila), parseInt(col));
                
                const esNash = !tieneIncentivo(juego, parseInt(fila), parseInt(col));
                if (esNash) {
                    celda.classList.add('nash-equilibrium');
                }
            });
            celda.addEventListener('mouseout', () => {
                celda.classList.remove('nash-equilibrium');
            });
        });

        matrizContainer.querySelector('table').addEventListener('mouseout', () => {
            explicacionContainer.innerHTML = defaultExplicacion;
        });
    }
    
    function tieneIncentivo(juego, fila, col) {
        const pagoActual = juego.pagos[fila][col];
        const pagoAlternativoP1 = juego.pagos[1 - fila][col];
        if (pagoAlternativoP1[0] > pagoActual[0]) return true;
        const pagoAlternativoP2 = juego.pagos[fila][1 - col];
        if (pagoAlternativoP2[1] > pagoActual[1]) return true;
        return false;
    }

    // --- INICIALIZACIÓN ---
    poblarSelector();
    explicacionContainer.innerHTML = defaultExplicacion;
    generarMatriz(juegoSelector.value);

    juegoSelector.addEventListener('change', (e) => {
        generarMatriz(e.target.value);
        explicacionContainer.innerHTML = defaultExplicacion;
        // Mostrar/Ocultar el juego interactivo de Pares y Nones
        const juegoInteractivo = document.getElementById('juego-interactivo-container');
        if (e.target.value === 'pares-nones') {
            juegoInteractivo.style.display = 'block';
        } else {
            juegoInteractivo.style.display = 'none';
        }
    });

    // --- LÓGICA DEL JUEGO INTERACTIVO DE PARES Y NONES ---
    const controlesParesNones = document.getElementById('controles-pares-nones');
    const resultadoParesNones = document.getElementById('resultado-pares-nones');
    const notaAlgoritmo = document.getElementById('nota-algoritmo');
    let prediccionJugador = null;

    controlesParesNones.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') return;

        if (e.target.dataset.prediccion) {
            prediccionJugador = e.target.dataset.prediccion;
            // Resaltar selección
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
            const dedosJugador = parseInt(e.target.dataset.dedos);
            jugarParesNones(prediccionJugador, dedosJugador);
        }
    });

    function jugarParesNones(prediccion, dedosJ1) {
        let dedosJ2;

        // --- ALGORITMO ALTERADO ---
        // Si el jugador 1 elige "Pares", la IA hará trampa el 90% de las veces para que la suma sea par.
        if (prediccion === 'pares') {
            const random = Math.random(); // Un número entre 0 y 1
            if (random < 0.90) { // 90% de probabilidad de forzar la victoria del Jugador 1
                // La IA elige un número que haga la suma par
                dedosJ2 = (dedosJ1 % 2 === 1) ? 1 : 2;
                notaAlgoritmo.innerHTML = "<p>(Nota: El algoritmo del Jugador 2 ha sido alterado para que el Jugador 1 gane el 90% de las veces al elegir 'Pares'.)</p>";
            } else { // 10% de probabilidad de un resultado "justo" (que en este caso, fuerza la pérdida)
                // La IA elige un número que haga la suma impar
                dedosJ2 = (dedosJ1 % 2 === 1) ? 2 : 1;
                notaAlgoritmo.innerHTML = "<p>(Nota: El algoritmo del Jugador 2 ha sido alterado... pero esta vez tuviste mala suerte.)</p>";
            }
        } else {
            // Si el jugador elige "Nones", la IA juega de forma aleatoria normal.
            dedosJ2 = Math.random() < 0.5 ? 1 : 2;
            notaAlgoritmo.innerHTML = ""; // Sin nota si el juego es justo
        }

        const suma = dedosJ1 + dedosJ2;
        const esPar = suma % 2 === 0;
        let resultadoTexto = '';

        if ((esPar && prediccion === 'pares') || (!esPar && prediccion === 'nones')) {
            resultadoTexto = `<strong style="color: green;">¡GANASTE!</strong> Elegiste ${prediccion.toUpperCase()} y la suma fue ${suma}.`;
        } else {
            resultadoTexto = `<strong style="color: red;">PERDISTE.</strong> Elegiste ${prediccion.toUpperCase()} y la suma fue ${suma}.`;
        }

        resultadoParesNones.innerHTML = `
            <p>Tú mostraste <strong>${dedosJ1}</strong> dedo(s). El Jugador 2 mostró <strong>${dedosJ2}</strong> dedo(s).</p>
            <p>La suma es <strong>${suma}</strong>.</p>
            <p>${resultadoTexto}</p>
        `;
        
        // Resetear predicción para la siguiente ronda
        prediccionJugador = null;
        controlesParesNones.querySelectorAll('[data-prediccion]').forEach(btn => btn.classList.remove('seleccionado'));
    }

    // Disparar el evento change al inicio para configurar la visibilidad
    juegoSelector.dispatchEvent(new Event('change'));
});