document.addEventListener('DOMContentLoaded', () => {
    const arbolContainer = document.getElementById('arbol-container');
    const explicacionContainer = document.getElementById('explicacion-container');
    const juegoSelector = document.getElementById('juego-selector');
    const analizarBtn = document.getElementById('analizar-btn');

    // --- DATOS DE LOS JUEGOS ---
    const juegos = {
        'disuasion-entrada': {
            nombre: 'Disuasión de Entrada',
            estructura: {
                id: 'n1',
                jugador: 'Empresa<br>Nueva',
                pos: { top: 150, left: 50 },
                acciones: {
                    'Entrar': {
                        idRama: 'r1',
                        siguienteNodo: {
                            id: 'n2',
                            jugador: 'Empresa<br>Establecida',
                            pos: { top: 150, left: 400 },
                            acciones: {
                                'Luchar': { idRama: 'r2', pagos: { id: 'p1', pos: { top: 50, left: 750 }, valores: [-10, -10] } },
                                'Acomodarse': { idRama: 'r3', pagos: { id: 'p2', pos: { top: 250, left: 750 }, valores: [10, 10] } }
                            }
                        }
                    },
                    'No Entrar': {
                        idRama: 'r4',
                        pagos: { id: 'p3', pos: { top: 300, left: 400 }, valores: [0, 50] }
                    }
                }
            }
        }
        // Aquí se pueden añadir más juegos dinámicos
    };

    // --- FUNCIONES ---

    function poblarSelector() {
        for (const key in juegos) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = juegos[key].nombre;
            juegoSelector.appendChild(option);
        }
    }

    function generarArbol(juegoId) {
        arbolContainer.innerHTML = ''; // Limpiar el contenedor
        const juego = juegos[juegoId];
        if (!juego) return;

        // Dibujar el primer nodo
        const nodo1 = crearElemento('div', 'nodo', juego.estructura.id, `<strong>${juego.estructura.jugador}</strong>`);
        nodo1.style.top = `${juego.estructura.pos.top}px`;
        nodo1.style.left = `${juego.estructura.pos.left}px`;
        arbolContainer.appendChild(nodo1);

        // Acción "No Entrar" y su pago
        const pagoNoEntrar = juego.estructura.acciones['No Entrar'].pagos;
        const elemPago3 = crearElemento('div', 'pagos', pagoNoEntrar.id, `(${pagoNoEntrar.valores[0]}, ${pagoNoEntrar.valores[1]})`);
        elemPago3.style.top = `${pagoNoEntrar.pos.top}px`;
        elemPago3.style.left = `${pagoNoEntrar.pos.left}px`;
        arbolContainer.appendChild(elemPago3);
        crearRama('r4', juego.estructura.pos, pagoNoEntrar.pos, 'No Entrar');

        // Acción "Entrar" y el segundo nodo
        const nodo2Info = juego.estructura.acciones['Entrar'].siguienteNodo;
        const nodo2 = crearElemento('div', 'nodo', nodo2Info.id, `<strong>${nodo2Info.jugador}</strong>`);
        nodo2.style.top = `${nodo2Info.pos.top}px`;
        nodo2.style.left = `${nodo2Info.pos.left}px`;
        arbolContainer.appendChild(nodo2);
        crearRama('r1', juego.estructura.pos, nodo2Info.pos, 'Entrar');

        // Acciones y pagos del segundo nodo
        const pagoLuchar = nodo2Info.acciones['Luchar'].pagos;
        const elempago1 = crearElemento('div', 'pagos', pagoLuchar.id, `(${pagoLuchar.valores[0]}, ${pagoLuchar.valores[1]})`);
        elempago1.style.top = `${pagoLuchar.pos.top}px`;
        elempago1.style.left = `${pagoLuchar.pos.left}px`;
        arbolContainer.appendChild(elempago1);
        crearRama('r2', nodo2Info.pos, pagoLuchar.pos, 'Luchar');

        const pagoAcomodarse = nodo2Info.acciones['Acomodarse'].pagos;
        const elempago2 = crearElemento('div', 'pagos', pagoAcomodarse.id, `(${pagoAcomodarse.valores[0]}, ${pagoAcomodarse.valores[1]})`);
        elempago2.style.top = `${pagoAcomodarse.pos.top}px`;
        elempago2.style.left = `${pagoAcomodarse.pos.left}px`;
        arbolContainer.appendChild(elempago2);
        crearRama('r3', nodo2Info.pos, pagoAcomodarse.pos, 'Acomodarse');
    }

    function crearElemento(tag, clase, id, contenido) {
        const elemento = document.createElement(tag);
        elemento.className = clase;
        elemento.id = id;
        elemento.innerHTML = contenido;
        return elemento;
    }

    function crearRama(id, pos1, pos2, etiqueta) {
        const rama = document.createElement('div');
        rama.id = id;
        rama.className = 'rama';
        const dx = pos2.left - pos1.left;
        const dy = pos2.top - pos1.top;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        rama.style.width = `${length}px`;
        rama.style.top = `${pos1.top + 30}px`;
        rama.style.left = `${pos1.left + 30}px`;
        rama.style.transform = `rotate(${angle}deg)`;
        arbolContainer.appendChild(rama);

        const etiquetaElem = document.createElement('div');
        etiquetaElem.className = 'etiqueta-rama';
        etiquetaElem.textContent = etiqueta;
        etiquetaElem.style.top = `${pos1.top + dy / 2 - 10}px`;
        etiquetaElem.style.left = `${pos1.left + dx / 2 + 20}px`;
        arbolContainer.appendChild(etiquetaElem);
    }

    function analizarJuego(juegoId) {
        const juego = juegos[juegoId];
        if (!juego) return;

        // Reset visual
        document.querySelectorAll('.rama, .pagos, .nodo').forEach(el => {
            el.classList.remove('pruned', 'highlight-path');
        });

        const explicaciones = [];
        const elementosAfectados = [];

        // Paso 1: Decisión de la Empresa Establecida
        const pLuchar = juego.estructura.acciones['Entrar'].siguienteNodo.acciones['Luchar'].pagos.valores[1]; // -10
        const pAcomodarse = juego.estructura.acciones['Entrar'].siguienteNodo.acciones['Acomodarse'].pagos.valores[1]; // 10
        
        explicaciones.push(`<strong>Paso 1: Analizamos la decisión final de la ${juego.estructura.acciones['Entrar'].siguienteNodo.jugador}.</strong><br>Si elige 'Luchar', su pago es ${pLuchar}. Si elige 'Acomodarse', su pago es ${pAcomodarse}.`);

        if (pAcomodarse > pLuchar) {
            explicaciones.push(`Como ${pAcomodarse} > ${pLuchar}, la empresa establecida elegirá <strong>'Acomodarse'</strong>. La amenaza de 'Luchar' no es creíble.`);
            elementosAfectados.push({ id: 'r2', clase: 'pruned' });
            elementosAfectados.push({ id: 'p1', clase: 'pruned' });
            elementosAfectados.push({ id: 'r3', clase: 'highlight-path' });
        } else {
            // Lógica para el caso contrario
        }

        // Paso 2: Decisión de la Empresa Nueva
        const pagoSiEntra = juego.estructura.acciones['Entrar'].siguienteNodo.acciones['Acomodarse'].pagos.valores[0]; // 10
        const pagoSiNoEntra = juego.estructura.acciones['No Entrar'].pagos.valores[0]; // 0

        explicaciones.push(`<strong>Paso 2: Analizamos la decisión inicial de la ${juego.estructura.jugador}.</strong><br>Anticipando que la establecida se 'Acomodará', sabe que si 'Entra' su pago será ${pagoSiEntra}. Si 'No Entra', su pago es ${pagoSiNoEntra}.`);

        if (pagoSiEntra > pagoSiNoEntra) {
            explicaciones.push(`Como ${pagoSiEntra} > ${pagoSiNoEntra}, la empresa nueva elegirá <strong>'Entrar'</strong>.`);
            elementosAfectados.push({ id: 'r4', clase: 'pruned' });
            elementosAfectados.push({ id: 'p3', clase: 'pruned' });
            elementosAfectados.push({ id: 'r1', clase: 'highlight-path' });
            elementosAfectados.push({ id: 'n1', clase: 'highlight-path' });
            elementosAfectados.push({ id: 'n2', clase: 'highlight-path' });
            elementosAfectados.push({ id: 'p2', clase: 'highlight-path' });
        } else {
            // Lógica para el caso contrario
        }
        
        explicaciones.push(`<strong>Resultado (Equilibrio Perfecto en Subjuegos):</strong> La Empresa Nueva <strong>Entra</strong> y la Empresa Establecida <strong>se Acomoda</strong>, resultando en pagos de (10, 10).`);

        // Mostrar explicaciones y animaciones secuencialmente
        let i = 0;
        explicacionContainer.innerHTML = '';
        function mostrarSiguiente() {
            if (i < explicaciones.length) {
                explicacionContainer.innerHTML += `<p>${explicaciones[i]}</p>`;
                // Aplicar clases CSS correspondientes a este paso
                elementosAfectados.filter(e => e.step === i).forEach(el => {
                    document.getElementById(el.id).classList.add(el.clase);
                });
                i++;
                setTimeout(mostrarSiguiente, 2000); // 2 segundos entre pasos
            } else {
                // Aplicar todas las clases al final para asegurar el estado final
                elementosAfectados.forEach(el => {
                    const elem = document.getElementById(el.id);
                    if(elem) elem.classList.add(el.clase);
                });
            }
        }
        mostrarSiguiente();
    }

    // --- INICIALIZACIÓN ---
    poblarSelector();
    generarArbol(juegoSelector.value);

    juegoSelector.addEventListener('change', (e) => {
        generarArbol(e.target.value);
        explicacionContainer.innerHTML = '<p>Presiona el botón "Analizar" para ver la explicación del proceso de Inducción hacia Atrás.</p>';
    });

    analizarBtn.addEventListener('click', () => {
        analizarJuego(juegoSelector.value);
    });
});
