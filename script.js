import * as THREE from 'three';

import { OrbitControls } from
    'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from
    'three/addons/loaders/GLTFLoader.js';

import { RoomEnvironment } from
    'three/addons/environments/RoomEnvironment.js';

import { Reflector } from
    'three/addons/objects/Reflector.js';


// ========================================
// 1. SCENA
// ========================================

const container = document.getElementById('scene');

const scene = new THREE.Scene();

scene.background = new THREE.Color('#0b101a');


// ========================================
// 2. TELECAMERA
// ========================================

/* ========================================
   CAMERA RESPONSIVE
======================================== */

const isMobile = window.matchMedia(
    "(max-width: 767px)"
).matches;

const camera = new THREE.PerspectiveCamera(
    isMobile ? 68 : 40,
    container.clientWidth / container.clientHeight,
    0.1,
    100
);

camera.position.set(6, 3.2, 8.5);


// ========================================
// 3. RENDERER
// ========================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.25;

container.appendChild(renderer.domElement);

// Il canvas apparirà dopo il caricamento.

renderer.domElement.style.opacity = '0';


// ========================================
// 4. RIFLESSI AMBIENTALI
// ========================================

const pmremGenerator = new THREE.PMREMGenerator(renderer);

const room = new RoomEnvironment();

const environment = pmremGenerator.fromScene(room);

scene.environment = environment.texture;

room.dispose();

pmremGenerator.dispose();


// ========================================
// 5. ILLUMINAZIONE
// ========================================

// ========================================
// 5. CINEMATIC STUDIO LIGHTING
// ========================================


// LUCE AMBIENTALE

const ambientLight = new THREE.HemisphereLight(
    0xe1efff,
    0x1b2334,
    1.5
);

scene.add(ambientLight);


// LUCE PRINCIPALE BIANCA

const mainLight = new THREE.DirectionalLight(
    0xffffff,
    3.5
);

mainLight.position.set(5, 8, 6);

mainLight.castShadow = true;

mainLight.shadow.mapSize.set(2048, 2048);

mainLight.shadow.camera.left = -8;
mainLight.shadow.camera.right = 8;

mainLight.shadow.camera.top = 8;
mainLight.shadow.camera.bottom = -8;

mainLight.shadow.bias = -0.0001;

scene.add(mainLight);


// LUCE BLU POSTERIORE

const blueLight = new THREE.DirectionalLight(
    0x3f84ff,
    3.2
);

blueLight.position.set(-5, 3.5, -4);

scene.add(blueLight);


// LUCE LATERALE FREDDA

const sideLight = new THREE.PointLight(
    0x8abaff,
    55,
    14
);

sideLight.position.set(3, 2.5, -4);

scene.add(sideLight);


// FARETTO DA SHOWROOM

const studioSpotlight = new THREE.SpotLight(
    0xe6f1ff,
    100,
    22,
    Math.PI / 6,
    0.65,
    1.5
);

studioSpotlight.position.set(5, 6, 4);

studioSpotlight.target.position.set(0, 0.8, 0);

scene.add(studioSpotlight);

scene.add(studioSpotlight.target);

// ========================================
// 6. CINEMATIC REFLECTIVE FLOOR
// ========================================


// ========================================
// SUPERFICIE RIFLETTENTE
// ========================================

const floorMirror = new Reflector(

    new THREE.PlaneGeometry(200, 200),

    {

        clipBias: 0.003,

        textureWidth: 768,

        textureHeight: 768,

        color: 0x303b50,

        multisample: 0

    }

);


// Disponiamo lo specchio orizzontalmente

floorMirror.rotation.x = -Math.PI / 2;


// Posizioniamo il pavimento
// leggermente sotto l'automobile

floorMirror.position.y = -0.06;


// Aggiungiamo il riflesso alla scena

scene.add(floorMirror);


// ========================================
// OMBRE DI CONTATTO
// ========================================

// Creiamo un piano trasparente
// che riceve le ombre dell'automobile.

const shadowCatcher = new THREE.Mesh(

    new THREE.PlaneGeometry(200, 200),

    new THREE.ShadowMaterial({

        color: 0x000000,

        opacity: 0.35

    })

);


// Posizioniamo le ombre
// appena sopra il pavimento riflettente.

shadowCatcher.rotation.x = -Math.PI / 2;

shadowCatcher.position.y = -0.055;

shadowCatcher.receiveShadow = true;

scene.add(shadowCatcher);


// ========================================
// 7. GRUPPO AUTOMOBILE
// ========================================

const car = new THREE.Group();

scene.add(car);

/* ========================================
   MOBILE — ROTAZIONE CON DUE DITA
======================================== */

let mobileRotationActive = false;
let previousTouchX = 0;

const mobileTouchEnabled = window.matchMedia(
    "(max-width: 767px) and (pointer: coarse)"
).matches;

if (mobileTouchEnabled) {

    const canvas3D = renderer.domElement;

    canvas3D.addEventListener("touchstart", function(event) {

        if (event.touches.length !== 2) return;

        mobileRotationActive = true;

        previousTouchX =
            (event.touches[0].clientX +
             event.touches[1].clientX) / 2;

    }, { passive: true });


    canvas3D.addEventListener("touchmove", function(event) {

        if (
            event.touches.length !== 2 ||
            !mobileRotationActive ||
            revealActive ||
            interiorModeActive
        ) {
            return;
        }

        const configurator =
            document.getElementById("configurator");

        const rect = configurator?.getBoundingClientRect();

        const inConfigurator = rect &&
            rect.top < window.innerHeight * 0.8 &&
            rect.bottom > window.innerHeight * 0.2;

        const atBeginning =
            window.scrollY < window.innerHeight * 0.7;

        if (!atBeginning && !inConfigurator) return;

        event.preventDefault();

        const currentX =
            (event.touches[0].clientX +
             event.touches[1].clientX) / 2;

        const deltaX = currentX - previousTouchX;

        car.rotation.y += deltaX * 0.008;

        previousTouchX = currentX;

    }, { passive: false });


    function stopMobileRotation() {
        mobileRotationActive = false;
    }

    canvas3D.addEventListener(
        "touchend",
        stopMobileRotation
    );

    canvas3D.addEventListener(
        "touchcancel",
        stopMobileRotation
    );

}


// ========================================
// 8. CONTROLLI MOUSE
// ========================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;

controls.dampingFactor = 0.05;

controls.enablePan = false;


/* ========================================
   VYRA — TOUCH MOBILE
======================================== */

const isTouchMobile = window.matchMedia(
    "(max-width: 767px) and (pointer: coarse)"
).matches;

if (isTouchMobile) {

    // Sul telefono la priorità è lo scroll.
    // Disattiviamo i gesti OrbitControls sul canvas.

    controls.disconnect();

    // Il browser può gestire lo scorrimento.
    renderer.domElement.style.touchAction = "pan-y";

}

controls.minDistance = 5;
controls.maxDistance = 15;

controls.maxPolarAngle = Math.PI / 2.05;

controls.target.set(0, 0.8, 0);

controls.autoRotate = true;

controls.autoRotateSpeed = 0.5;

controls.update();


// ========================================
// 9. CARICAMENTO MODELLO 3D
// ========================================

const loader = new GLTFLoader();

const paintMaterials = new Set();

// ========================================
// VYRA CONFIGURATOR — STATE
// ========================================

let doorsOpen = false;

let setDoorsOpen = null;

let interiorModeActive = false;

let revealActive = false;

const loadingText = document.createElement('p');

loadingText.textContent = 'LOADING 3D EXPERIENCE...';

loadingText.style.cssText = `
    position: absolute;
    bottom: 12%;
    right: 12%;
    z-index: 5;
    color: #ffffff;
    font-family: Manrope, sans-serif;
    font-size: 11px;
    letter-spacing: 2px;
    pointer-events: none;
`;

container.appendChild(loadingText);


loader.load(

    './models/CarConcept.glb',

    // MODELLO CARICATO
    function (gltf) {

        const model = gltf.scene;

        // Attiviamo le ombre
        model.traverse(function (object) {

            if (object.isMesh) {

                object.castShadow = true;

                object.receiveShadow = true;

                const materials = Array.isArray(object.material)
                    ? object.material
                    : [object.material];

                materials.forEach(function (material) {

                   if (
    material &&
    /^Paint\s*[12]\b/i.test(material.name)
) {
    paintMaterials.add(material);
}

                });

            }

        });


        // Calcoliamo le dimensioni originali
        const box = new THREE.Box3().setFromObject(model);

        const size = box.getSize(new THREE.Vector3());

        const maxDimension = Math.max(
            size.x,
            size.z
        );


        // Adattiamo il modello alla scena
        const scale = 5.7 / Math.max(maxDimension, 0.001);

        model.scale.setScalar(scale);


        // Ricentriamo l'automobile
        const scaledBox = new THREE.Box3().setFromObject(model);

        const center = scaledBox.getCenter(
            new THREE.Vector3()
        );

        model.position.set(
            -center.x,
            -scaledBox.min.y,
            -center.z
        );


        // Inseriamo l'automobile
        car.add(model);


// ========================================
// VYRA — DOOR SYSTEM
// ========================================

const leftDoor = model.getObjectByName(
    'BodyDoorLColor1'
);

const rightDoor = model.getObjectByName(
    'BodyDoorRColor1'
);

const heroDoorButton = document.getElementById(
    'doors-toggle'
);

const configDoorButton = document.getElementById(
    'config-doors'
);


if (
    leftDoor &&
    rightDoor &&
    heroDoorButton &&
    configDoorButton
) {

    // Memorizziamo le rotazioni originali.

    const leftClosedRotation = leftDoor.rotation.z;

    const rightClosedRotation = rightDoor.rotation.z;


    // Funzione condivisa tra i due pulsanti.

    setDoorsOpen = function(open) {

        if (doorsOpen === open) return;

        doorsOpen = open;


        gsap.to(leftDoor.rotation, {

            z: leftClosedRotation + (
                doorsOpen ? -0.9 : 0
            ),

            duration: 1.3,

            ease: 'power2.inOut',

            overwrite: true

        });


        gsap.to(rightDoor.rotation, {

            z: rightClosedRotation + (
                doorsOpen ? 0.9 : 0
            ),

            duration: 1.3,

            ease: 'power2.inOut',

            overwrite: true

        });


        // Aggiorniamo entrambi i pulsanti.

        const label = doorsOpen
            ? 'CLOSE DOORS ↙'
            : 'OPEN DOORS ↗';


        [heroDoorButton, configDoorButton].forEach(
            function(button) {

                button.textContent = label;

                button.setAttribute(
                    'aria-pressed',
                    String(doorsOpen)
                );

            }
        );

    };


    heroDoorButton.disabled = false;

    heroDoorButton.classList.add('is-ready');

    configDoorButton.disabled = false;


    heroDoorButton.addEventListener('click', function() {

        setDoorsOpen(!doorsOpen);

    });


    configDoorButton.addEventListener('click', function() {

        setDoorsOpen(!doorsOpen);

    });

} else {

    console.warn(
        'Sistema portiere non disponibile.'
    );

}


// ========================================
// ATTIVAZIONE CLOSE-UP CINEMATOGRAFICI
// ========================================

setupCinematicDetails(model);

setupCarConfigurator(model);

        // Applichiamo il colore iniziale
        const selectedColor = document.querySelector(
            '.color.active'
        )?.dataset.color || '#cdd8e4';

        changeCarColor(selectedColor);

        // Attiviamo il salvataggio della configurazione.

setupConfigurationStorage();

setupVYRAReveal();


        // Nascondiamo il caricamento
        loadingText.remove();

        console.log('VYRA ONE: modello 3D caricato!');

        // Avviamo l'entrata cinematografica.

playIntroAnimation();

    },

    // AVANZAMENTO CARICAMENTO
    function (xhr) {

        if (xhr.total > 0) {

            const percentage = Math.round(
                (xhr.loaded / xhr.total) * 100
            );

            loadingText.textContent =
                `LOADING 3D EXPERIENCE... ${percentage}%`;

        }

    },

    // ERRORE
    function (error) {

        console.error(
            'Errore caricamento modello 3D:',
            error
        );

        loadingText.textContent =
            'IMPOSSIBILE CARICARE IL MODELLO 3D';

    }

);


// ========================================
// 10. UNIFIED PAINT CONFIGURATOR
// ========================================

function changeCarColor(color) {

    // Modifichiamo la carrozzeria.

    paintMaterials.forEach(function(material) {

        material.color.set(color);

    });


    // Sincronizziamo tutti i pulsanti.

    const buttons = document.querySelectorAll(
        '[data-color], [data-config-color]'
    );


    buttons.forEach(function(button) {

        const buttonColor =
            button.dataset.color ||
            button.dataset.configColor;

        const active =
            buttonColor.toLowerCase() === color.toLowerCase();


        button.classList.toggle(
            'active',
            active
        );

        button.setAttribute(
            'aria-pressed',
            String(active)
        );

    });

}


// ========================================
// EVENTI DEI PULSANTI
// ========================================

document.querySelectorAll(
    '[data-color], [data-config-color]'
).forEach(function(button) {

    button.addEventListener('click', function() {

        const color =
            button.dataset.color ||
            button.dataset.configColor;

        changeCarColor(color);

    });

});


// ========================================
// 11. DYNAMIC CINEMATIC LIGHTING
// ========================================


// Creiamo un orologio per le animazioni.

const lightingClock = new THREE.Clock();

// ========================================
// CINEMATIC LIGHTING STATE
// ========================================

const cinematicMood = {

    blueIntensity: 3.2,

    sidePositionX: 3,

    spotPositionX: 5

};


// ========================================
// ANIMATION LOOP
// ========================================

function animate() {

    const time = lightingClock.getElapsedTime();


    // ====================================
    // LUCE BLU DINAMICA
    // ====================================

    // L'intensità cambia lentamente.

    blueLight.intensity =

    cinematicMood.blueIntensity +
    Math.sin(time * 0.65) * 0.35;



    // ====================================
    // LUCE LATERALE
    // ====================================

    // La luce si muove orizzontalmente.

    sideLight.position.x =

    cinematicMood.sidePositionX +
    Math.sin(time * 0.4) * 1.25;



    // ====================================
    // SPOTLIGHT PRINCIPALE
    // ====================================

    // Il faretto percorre lentamente
    // una parte della carrozzeria.

    studioSpotlight.position.x =

    cinematicMood.spotPositionX +
    Math.sin(time * 0.3) * 1.5;



    // ====================================
    // AGGIORNAMENTO CONTROLLI
    // ====================================

    if (!interiorModeActive && !revealActive) {
    controls.update();
}


    // ====================================
    // RENDERING
    // ====================================

    renderer.render(scene, camera);

}


// Avviamo il rendering continuo.

renderer.setAnimationLoop(animate);


// ========================================
// 12. RIDIMENSIONAMENTO RESPONSIVE
// ========================================

window.addEventListener('resize', function () {

    const width = revealActive
        ? window.innerWidth
        : container.clientWidth;

    const height = revealActive
        ? window.innerHeight
        : container.clientHeight;

    // Inquadratura diversa per smartphone e desktop

    const mobile = window.matchMedia(
        "(max-width: 767px)"
    ).matches;

    camera.fov = mobile ? 68 : 40;

    camera.aspect = width / Math.max(height, 1);

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    // Ricalcoliamo le posizioni delle animazioni
    // quando cambiano le dimensioni dello schermo.

    if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
    }

});

// ========================================
// 13. ADVANCED CINEMATIC EXPERIENCE
// ========================================

gsap.registerPlugin(ScrollTrigger);


// Questa funzione viene eseguita quando
// il modello 3D è completamente caricato.

function setupCinematicDetails(model) {

    // ========================================
    // 14. INDIVIDUAZIONE COMPONENTI 3D
    // ========================================

    const headlights = model.getObjectByName(
        'BodyHeadlights'
    );

    const frontWheel = model.getObjectByName(
        'WheelFrontL'
    );


    // Controlliamo che i componenti esistano

    if (!headlights || !frontWheel) {

        console.warn(
            'Componenti 3D non trovati:',
            {
                headlights: !!headlights,
                frontWheel: !!frontWheel
            }
        );

        return;

    }


    // Aggiorniamo le trasformazioni 3D

    car.updateMatrixWorld(true);


    // ========================================
    // 15. POSIZIONE DEL FARO
    // ========================================

    // Calcoliamo il volume occupato dai fari.

    const headlightBox = new THREE.Box3()
        .setFromObject(headlights);


    // Otteniamo il centro del gruppo fari.

    const headlightTarget = headlightBox.getCenter(
        new THREE.Vector3()
    );


    // Spostiamo il punto di osservazione
    // verso il faro sul lato positivo dell'asse X.

    headlightTarget.x = THREE.MathUtils.lerp(
        headlightTarget.x,
        headlightBox.max.x,
        0.72
    );


    // Creiamo la posizione della telecamera.

    const headlightCamera = headlightTarget.clone()
        .add(
            new THREE.Vector3(
                1.9,
                1.1,
                2.6
            )
        );


    // ========================================
    // 16. POSIZIONE DELLA RUOTA
    // ========================================

    // Calcoliamo il volume occupato
    // dalla ruota anteriore.

    const wheelBox = new THREE.Box3()
        .setFromObject(frontWheel);


    // Otteniamo il centro della ruota.

    const wheelTarget = wheelBox.getCenter(
        new THREE.Vector3()
    );


    // Spostiamo leggermente il punto
    // verso la parte superiore del cerchio.

    wheelTarget.y += 0.1;


    // Posizioniamo la telecamera
    // davanti e lateralmente alla ruota.

    const wheelCamera = wheelTarget.clone()
        .add(
            new THREE.Vector3(
                2.3,
                1.2,
                1.8
            )
        );


    const cinematicTimeline = gsap.timeline({

    defaults: {
        ease: 'none'
    },

    scrollTrigger: {

        trigger: '.hero',

        start: 'top top',

        end: 'bottom bottom',

        scrub: 1.2,

        invalidateOnRefresh: true,

        onUpdate: function(self) {

    // Durante il Cinematic Reveal
    // non modifichiamo i controlli originali.

    if (revealActive) return;

    // Prima schermata

            const atBeginning =
                self.progress < 0.005;


            // Sezione configuratore

            const configurator =
                document.getElementById('configurator');

            let atConfigurator = false;

            if (configurator) {

                const rect =
                    configurator.getBoundingClientRect();

                atConfigurator =
                    rect.top < window.innerHeight * 0.85 &&
                    rect.bottom > window.innerHeight * 0.2;

            }


            // Controlli automobile

controls.autoRotate =
    atBeginning && !interiorModeActive;

controls.enabled =
    (atBeginning || atConfigurator) &&
    !interiorModeActive;


            // Pulsante portiere homepage

            const heroButton =
                document.getElementById('doors-toggle');

            if (heroButton) {

                heroButton.disabled = !atBeginning;

                heroButton.classList.toggle(
                    'is-ready',
                    atBeginning
                );

            }


            // Chiudiamo le portiere durante
            // le animazioni cinematografiche

            if (
                !atBeginning &&
                !atConfigurator &&
                doorsOpen &&
                setDoorsOpen
            ) {

                setDoorsOpen(false);

            }

        }

    }

});


    // ========================================
    // FUNZIONE PER MUOVERE LA TELECAMERA
    // ========================================

    function moveCamera(
        position,
        target,
        startTime,
        duration
    ) {

        // Movimento della telecamera

        cinematicTimeline.to(

            camera.position,

            {
                x: position.x,
                y: position.y,
                z: position.z,

                duration: duration

            },

            startTime

        );


        // Movimento del punto osservato

        cinematicTimeline.to(

            controls.target,

            {
                x: target.x,
                y: target.y,
                z: target.z,

                duration: duration

            },

            startTime

        );

    }


    // ========================================
    // SHOT 01 — BEYOND DESIGN
    // ========================================

    // La telecamera mostra il profilo.

    moveCamera(

        new THREE.Vector3(
            1,
            2.8,
            9.5
        ),

        new THREE.Vector3(
            0,
            0.9,
            0
        ),

        0,
        1

    );


    // ========================================
    // SHOT 02 — LIGHT SIGNATURE
    // ========================================

    // La telecamera si avvicina al faro.

    moveCamera(

        headlightCamera,

        headlightTarget,

        1,
        1

    );


    // ========================================
    // SHOT 03 — PERFORMANCE WHEELS
    // ========================================

    // La telecamera si sposta verso la ruota.

    moveCamera(

        wheelCamera,

        wheelTarget,

        2.35,
        0.35

    );


    // ========================================
    // SHOT 04 — THE FUTURE
    // ========================================

    // La telecamera torna ad allontanarsi.

    moveCamera(

        new THREE.Vector3(
            6.7,
            3.2,
            -6
        ),

        new THREE.Vector3(
            0,
            0.85,
            0
        ),

        2.72,
        0.28

    );


    // ========================================
    // 18. ETICHETTA FARI
    // ========================================

    cinematicTimeline.to(

        '#headlight-badge',

        {
            opacity: 1,

            duration: 0.12
        },

        1.92

    );


    cinematicTimeline.to(

        '#headlight-badge',

        {
            opacity: 0,

            duration: 0.12
        },

        2.26

    );


    // ========================================
    // 19. ETICHETTA RUOTE
    // ========================================

    cinematicTimeline.to(

        '#wheel-badge',

        {
            opacity: 1,

            duration: 0.12
        },

        2.38

    );


    cinematicTimeline.to(

        '#wheel-badge',

        {
            opacity: 0,

            duration: 0.12
        },

        2.69

    );


// ========================================
// 20. VYRA — EXPLODED VIEW EXPERIENCE
// ========================================


// Individuiamo i componenti da separare.
//
// Gli spostamenti sono espressi negli assi
// locali del modello 3D originale.

const explosionConfig = [

    // RUOTE ANTERIORI

    {
        name: 'WheelFrontL',
        offset: [0.95, -0.25, 0.30]
    },

    {
        name: 'WheelFrontR',
        offset: [-0.95, -0.25, 0.30]
    },


    // RUOTE POSTERIORI

    {
        name: 'WheelRearL',
        offset: [0.95, 0.25, 0.30]
    },

    {
        name: 'WheelRearR',
        offset: [-0.95, 0.25, 0.30]
    },


    // PORTIERE

    {
        name: 'BodyDoorLColor1',
        offset: [0.80, 0, 0.50]
    },

    {
        name: 'BodyDoorRColor1',
        offset: [-0.80, 0, 0.50]
    },


    // COFANO

    {
        name: 'BodyHood',
        offset: [0, -0.35, 1.35]
    },


    // MOTORE

    {
        name: 'Engine',
        offset: [0, -0.45, 0.55]
    }

];


// ========================================
// 21. MEMORIZZIAMO LE POSIZIONI ORIGINALI
// ========================================

const explodedComponents = [];


explosionConfig.forEach(function(config) {

    const component = model.getObjectByName(
        config.name
    );


    // Se il componente non esiste,
    // lo ignoriamo senza bloccare il sito.

    if (!component) {

        console.warn(
            'Componente non trovato:',
            config.name
        );

        return;

    }


    // Salviamo la posizione originale.

    const originalPosition = component.position.clone();


    // Calcoliamo la posizione esplosa.

    const explodedPosition = originalPosition.clone();

    explodedPosition.add(
        new THREE.Vector3(
            config.offset[0],
            config.offset[1],
            config.offset[2]
        )
    );


    // Conserviamo tutte le informazioni.

    explodedComponents.push({

        object: component,

        original: originalPosition,

        exploded: explodedPosition

    });

});


console.log(
    'Componenti disponibili per exploded view:',
    explodedComponents.length
);


// ========================================
// 22. TELECAMERA — EXPLODED VIEW
// ========================================

// Allontaniamo la telecamera per mostrare
// i componenti mentre si separano.

cinematicTimeline.to(

    camera.position,

    {
        x: 7.8,
        y: 4.6,
        z: -10.5,

        duration: 0.8,

        ease: 'power2.inOut'
    },

    3

);


// Solleviamo leggermente il punto osservato.

cinematicTimeline.to(

    controls.target,

    {
        x: 0,
        y: 1.35,
        z: 0,

        duration: 0.8
    },

    3

);


// ========================================
// 23. ESPLOSIONE DEI COMPONENTI
// ========================================

explodedComponents.forEach(function(component, index) {

    // Introduciamo un piccolo ritardo tra
    // i movimenti dei diversi componenti.

    const startTime = 3 + index * 0.02;


    cinematicTimeline.to(

        component.object.position,

        {
            x: component.exploded.x,

            y: component.exploded.y,

            z: component.exploded.z,

            duration: 0.75,

            ease: 'power2.inOut'

        },

        startTime

    );

});


// ========================================
// 24. RICOMPOSIZIONE DELLA VETTURA
// ========================================

explodedComponents.forEach(function(component, index) {

    // Riportiamo ogni componente
    // alla posizione originale.

    const startTime = 4 + index * 0.015;


    cinematicTimeline.to(

        component.object.position,

        {
            x: component.original.x,

            y: component.original.y,

            z: component.original.z,

            duration: 0.85,

            ease: 'power2.inOut'

        },

        startTime

    );

});


// ========================================
// 25. TELECAMERA — REASSEMBLY
// ========================================

// Durante la ricomposizione la telecamera
// torna a mostrare la vettura intera.

cinematicTimeline.to(

    camera.position,

    {
        x: 6.8,
        y: 2.8,
        z: 9,

        duration: 1,

        ease: 'power2.inOut'
    },

    4

);


// Ripristiniamo il punto di osservazione.

cinematicTimeline.to(

    controls.target,

    {
        x: 0,
        y: 0.85,
        z: 0,

        duration: 1

    },

    4

);


// ========================================
// 26. AGGIORNAMENTO SCROLLTRIGGER
// ========================================

// ========================================
// 27. CAMERA — 3D CONFIGURATOR
// ========================================

// Riportiamo l'automobile in una posizione
// adatta alla personalizzazione.

cinematicTimeline.to(

    camera.position,

    {
        x: 6,
        y: 2.8,
        z: 8,

        duration: 1,

        ease: 'none'
    },

    5

);


// Punto di osservazione.

cinematicTimeline.to(

    controls.target,

    {
        x: 0,
        y: 0.9,
        z: 0,

        duration: 1,

        ease: 'none'
    },

    5

);


// Riportiamo l'automobile
// al suo orientamento originale.

cinematicTimeline.to(

    car.rotation,

    {
        y: 0,

        duration: 1,

        ease: 'none'
    },

    5

);

ScrollTrigger.refresh();

}

// ========================================
// 18. CINEMATIC TEXT TRANSITIONS
// ========================================

const storyPanels =
    document.querySelectorAll('.story-panel');


// ========================================
// ANIMAZIONI DI OGNI SEZIONE
// ========================================

storyPanels.forEach(function(panel) {

    const copy = panel.querySelector(
        '.story-copy'
    );


    // ====================================
    // ENTRATA DEL TESTO
    // ====================================

    gsap.fromTo(

        copy,

        {
            autoAlpha: 0,

            y: 70
        },

        {
            autoAlpha: 1,

            y: 0,

            ease: 'none',

            scrollTrigger: {

                trigger: panel,

                start: 'top 78%',

                end: 'top 43%',

                scrub: 1

            }

        }

    );


    // ====================================
    // USCITA DEL TESTO
    // ====================================

    gsap.to(

        copy,

        {
            autoAlpha: 0,

            y: -55,

            ease: 'none',

            scrollTrigger: {

                trigger: panel,

                start: 'bottom 60%',

                end: 'bottom 27%',

                scrub: 1

            }

        }

    );

});

// ========================================
// HERO — CINEMATIC EXIT
// ========================================


// ========================================
// TITOLO E CONFIGURATORE
// ========================================

gsap.to(

    '.hero-content',

    {
        autoAlpha: 0,

        y: -45,

        ease: 'none',

        scrollTrigger: {

            trigger: '.hero',

            start: 'top top',

            end: '+=65%',

            scrub: 1

        }

    }

);


// ========================================
// INFORMAZIONI INFERIORI
// ========================================

gsap.to(

    '.hero-bottom',

    {
        autoAlpha: 0,

        y: -25,

        ease: 'none',

        scrollTrigger: {

            trigger: '.hero',

            start: 'top top',

            end: '+=45%',

            scrub: 1

        }

    }

);

// ========================================
// VYRA — CINEMATIC INTRO ANIMATION
// ========================================

function playIntroAnimation() {


    // Se l'utente aggiorna la pagina
    // mentre si trova già in basso,
    // non riproduciamo l'introduzione.

    if (window.scrollY > window.innerHeight * 0.4) {

        renderer.domElement.style.opacity = '1';

        return;

    }


    // ====================================
    // TIMELINE
    // ====================================

    const intro = gsap.timeline({

        defaults: {

            ease: 'power3.out'

        }

    });


    // ====================================
    // 01 — AUTOMOBILE
    // ====================================

    intro.to(

        renderer.domElement,

        {

            opacity: 1,

            duration: 1.7

        },

        0

    );


    // ====================================
    // 02 — EYEBROW
    // ====================================

    intro.from(

        '.hero-content .eyebrow',

        {

            opacity: 0,

            y: 25,

            duration: 0.8

        },

        0.2

    );


    // ====================================
    // 03 — TITOLO PRINCIPALE
    // ====================================

    intro.from(

        '.hero-content h1',

        {

            opacity: 0,

            y: 65,

            duration: 1.2

        },

        0.4

    );


    // ====================================
    // 04 — DESCRIZIONE
    // ====================================

    intro.from(

        '.hero-content .description',

        {

            opacity: 0,

            y: 30,

            duration: 0.9

        },

        0.8

    );


    // ====================================
    // 05 — CONFIGURATORE
    // ====================================

    intro.from(

        '.hero-content .color-picker',

        {

            opacity: 0,

            y: 25,

            duration: 0.8

        },

        1.1

    );


    // ====================================
    // 06 — INFORMAZIONI INFERIORI
    // ====================================

    intro.from(

        '.hero-bottom',

        {

            opacity: 0,

            y: 20,

            duration: 0.8

        },

        1.3

    );

}

// ========================================
// SCROLL PROGRESS INDICATOR
// ========================================

gsap.to(

    '.scroll-progress-fill',

    {

        scaleX: 1,

        ease: 'none',

        scrollTrigger: {

            trigger: '.hero',

            start: 'top top',

            end: 'bottom bottom',

            scrub: true

        }

    }

);

// ========================================
// FASE 8 — CINEMATIC ATMOSPHERE
// ========================================


// ========================================
// 1. TIMELINE AMBIENTAZIONE
// ========================================

const atmosphereTimeline = gsap.timeline({

    defaults: {
        ease: 'none'
    },

    scrollTrigger: {

        trigger: '.hero',

        start: 'top top',

        end: 'bottom bottom',

        scrub: 1.2

    }

});


// ========================================
// 2. CONFIGURAZIONE DELLE ATMOSFERE
// ========================================

const atmospheres = [

    // BEYOND DESIGN

    {
        background: '#0d1b2e',

        exposure: 1.35,

        blue: 3.8,

        side: 4,

        spot: 5.4,

        halo: 0.45
    },


    // EVERY DETAIL MATTERS

    {
        background: '#0a1727',

        exposure: 1.5,

        blue: 4.6,

        side: 4,

        spot: 4,

        halo: 0.65
    },


    // ENGINEERED TO EVOLVE

    {
        background: '#111725',

        exposure: 1.2,

        blue: 2.4,

        side: 2,

        spot: 6.2,

        halo: 0.25
    },


    // THE ART OF ENGINEERING

    {
        background: '#1b2231',

        exposure: 1.5,

        blue: 5,

        side: 4.5,

        spot: 4.5,

        halo: 0.7
    },


    // PERFECTLY REASSEMBLED

    {
        background: '#0b101a',

        exposure: 1.25,

        blue: 3.2,

        side: 3,

        spot: 5,

        halo: 0.22
    },

    // 3D CONFIGURATOR

{
    background: '#0e1929',

    exposure: 1.35,

    blue: 3.9,

    side: 3.2,

    spot: 4.5,

    halo: 0.4
}

];


// ========================================
// 3. ANIMAZIONE DELLE ATMOSFERE
// ========================================

atmospheres.forEach(function(mood, index) {


    // Colore dell'ambiente Three.js

    const backgroundColor = new THREE.Color(
        mood.background
    );


    // ====================================
    // SFONDO DELLA SCENA 3D
    // ====================================

    atmosphereTimeline.to(

        scene.background,

        {
            r: backgroundColor.r,

            g: backgroundColor.g,

            b: backgroundColor.b,

            duration: 1
        },

        index

    );


    // ====================================
    // SFONDO DELLA HOMEPAGE
    // ====================================

    atmosphereTimeline.to(

        '.hero',

        {
            backgroundColor: mood.background,

            duration: 1
        },

        index

    );


    // ====================================
    // ILLUMINAZIONE
    // ====================================

    atmosphereTimeline.to(

        cinematicMood,

        {
            blueIntensity: mood.blue,

            sidePositionX: mood.side,

            spotPositionX: mood.spot,

            duration: 1
        },

        index

    );


    // ====================================
    // ESPOSIZIONE DEL RENDERER
    // ====================================

    atmosphereTimeline.to(

        renderer,

        {
            toneMappingExposure: mood.exposure,

            duration: 1
        },

        index

    );


    // ====================================
    // ALONE LUMINOSO
    // ====================================

    atmosphereTimeline.to(

        '.showroom-halo',

        {
            opacity: mood.halo,

            duration: 1
        },

        index

    );

});

// ========================================
// FASE 9 — VYRA 3D CONFIGURATOR
// ========================================

function setupCarConfigurator(model) {


    // ====================================
    // 1. FINITURE CARROZZERIA
    // ====================================

    const paintFinishes = {

        gloss: {
            roughness: 0.16,
            metalness: 0.45,
            clearcoat: 1,
            clearcoatRoughness: 0.08
        },

        metallic: {
            roughness: 0.28,
            metalness: 0.85,
            clearcoat: 0.8,
            clearcoatRoughness: 0.18
        },

        matte: {
            roughness: 0.9,
            metalness: 0.1,
            clearcoat: 0,
            clearcoatRoughness: 1
        }

    };


    function setPaintFinish(finishName) {

        const finish = paintFinishes[finishName];

        if (!finish) return;


        paintMaterials.forEach(function(material) {

            material.roughness = finish.roughness;

            material.metalness = finish.metalness;


            if (material.isMeshPhysicalMaterial) {

                material.clearcoat = finish.clearcoat;

                material.clearcoatRoughness =
                    finish.clearcoatRoughness;

            }

            material.needsUpdate = true;

        });

    }


    // Pulsanti finitura.

    const finishButtons = document.querySelectorAll(
        '[data-finish]'
    );


    finishButtons.forEach(function(button) {

        button.addEventListener('click', function() {

            const finishName = button.dataset.finish;

            setPaintFinish(finishName);


            finishButtons.forEach(function(item) {

                const active = item === button;

                item.classList.toggle('active', active);

                item.setAttribute(
                    'aria-pressed',
                    String(active)
                );

            });

        });

    });


    // ====================================
    // 2. FINITURA CERCHI
    // ====================================

    const rimNames = [

        'WheelFrontLRim',
        'WheelFrontRRim',
        'WheelRearLRim',
        'WheelRearRRim'

    ];


    const rimMaterials = [];


    rimNames.forEach(function(name) {

        const rim = model.getObjectByName(name);

        if (!rim) {

            console.warn('Cerchio non trovato:', name);

            return;

        }


        rim.traverse(function(object) {

            if (!object.isMesh || !object.material) return;


            // Cloniamo i materiali per evitare di
            // modificare accidentalmente altre parti.

            const originalMaterials = Array.isArray(
                object.material
            )
                ? object.material
                : [object.material];


            const clonedMaterials = originalMaterials.map(
                material => material.clone()
            );


            object.material = Array.isArray(object.material)
                ? clonedMaterials
                : clonedMaterials[0];


            clonedMaterials.forEach(function(material) {

                if (material.isMeshStandardMaterial) {

                    rimMaterials.push(material);

                }

            });

        });

    });


    // Finiture disponibili.

    const wheelFinishes = {

        dark: {
            color: '#343943',
            metalness: 0.7,
            roughness: 0.35
        },

        silver: {
            color: '#c8d0da',
            metalness: 0.9,
            roughness: 0.2
        },

        bronze: {
            color: '#a68157',
            metalness: 0.8,
            roughness: 0.3
        }

    };


    function setWheelFinish(finishName) {

        const finish = wheelFinishes[finishName];

        if (!finish) return;


        rimMaterials.forEach(function(material) {

            material.color.set(finish.color);

            material.metalness = finish.metalness;

            material.roughness = finish.roughness;

            material.needsUpdate = true;

        });

    }


    const wheelButtons = document.querySelectorAll(
        '[data-wheel-finish]'
    );


    wheelButtons.forEach(function(button) {

        button.addEventListener('click', function() {

            setWheelFinish(
                button.dataset.wheelFinish
            );


            wheelButtons.forEach(function(item) {

                const active = item === button;

                item.classList.toggle('active', active);

                item.setAttribute(
                    'aria-pressed',
                    String(active)
                );

            });

        });

    });


    // ====================================
    // 3. SISTEMA FARI LED
    // ====================================

    const headlightMaterials = new Map();


    model.traverse(function(object) {

        if (!object.isMesh || !object.material) return;


        const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];


        materials.forEach(function(material) {

            if (material && material.name === 'Headlight') {

                // Conserviamo l'intensità originale.

                if (!headlightMaterials.has(material)) {

                    headlightMaterials.set(
                        material,
                        material.emissiveIntensity
                    );

                }

            }

        });

    });


    const lightsButton = document.getElementById(
        'config-lights'
    );


    let lightsEnabled = true;


    if (lightsButton && headlightMaterials.size > 0) {

        lightsButton.disabled = false;


        lightsButton.addEventListener('click', function() {

            lightsEnabled = !lightsEnabled;


            headlightMaterials.forEach(
                function(originalIntensity, material) {

                    material.emissiveIntensity = lightsEnabled
                        ? originalIntensity
                        : 0;

                }
            );


            lightsButton.textContent = lightsEnabled
                ? 'LIGHTS ON'
                : 'LIGHTS OFF';


            lightsButton.setAttribute(
                'aria-pressed',
                String(lightsEnabled)
            );

        });

    }


    // ========================================
// FASE 10 — VYRA INTERIOR EXPERIENCE
// ========================================


// ========================================
// 1. CONTROLLI INTERFACCIA
// ========================================

const viewButton = document.getElementById(
    'config-view'
);

const interiorButtons = document.querySelectorAll(
    '[data-interior-color]'
);


// ========================================
// 2. VYRA — REAL COCKPIT EXPERIENCE
// ========================================

// Memorizziamo la vista esterna.

const exteriorCameraPosition = new THREE.Vector3();
const exteriorCameraTarget = new THREE.Vector3();

const originalFov = camera.fov;
const originalNear = camera.near;

let viewTransition = null;

// ========================================
// COCKPIT CAMERA PRESETS
// ========================================

// Orientamento originale della visuale interna.

const cockpitHomeQuaternion = new THREE.Quaternion();

// Animazione dell'orientamento.

let cockpitLookTween = null;


// ========================================
// 3. COMPONENTI REALI DELL'ABITACOLO
// ========================================

const driverSeat = model.getObjectByName(
    'InteriorSeatsColor1'
);

const dashboard = model.getObjectByName(
    'InteriorSteeringDash'
);

// Parabrezza originale del modello

const windshield = model.getObjectByName(
    'BodyWindshield'
);

// ========================================
// 4. TRANSIZIONE CINEMATOGRAFICA
// ========================================

function changeCameraView(position, target, inside) {

    if (viewTransition) {
        viewTransition.kill();
    }

    viewTransition = gsap.timeline();


    // Nascondiamo brevemente la scena.
    // Così non vediamo la telecamera
    // attraversare la carrozzeria.

    viewTransition.to(renderer.domElement, {

        opacity: 0,

        duration: 0.35,

        ease: 'power2.inOut',

        onComplete: function() {

            // Posizioniamo la telecamera.

            // Nascondiamo il parabrezza nella vista interna
// e lo ripristiniamo nella vista esterna.

if (windshield) {
    windshield.visible = !inside;
}

            camera.position.copy(position);

            controls.target.copy(target);


            // Campo visivo più ampio
            // quando siamo nell'abitacolo.

            camera.fov = inside ? 76 : originalFov;

            camera.near = inside ? 0.02 : originalNear;

            camera.updateProjectionMatrix();

            camera.lookAt(target);

// Memorizziamo l'orientamento iniziale
// quando entriamo nell'abitacolo.

if (inside) {

    cockpitHomeQuaternion.copy(
        camera.quaternion
    );

}

// Mostriamo o nascondiamo i pulsanti.

const cockpitShortcuts = document.getElementById(
    'cockpit-shortcuts'
);

if (cockpitShortcuts) {

    cockpitShortcuts.hidden = !inside;

}

        }

    });


    // Facciamo riapparire la scena.

    viewTransition.to(renderer.domElement, {

        opacity: 1,

        duration: 0.5,

        ease: 'power2.inOut',

        onComplete: function() {

            controls.enabled = !inside;

        }

    });

}

// ========================================
// VYRA — INTERIOR FREE LOOK
// ========================================

// Permettiamo di girare lo sguardo
// senza spostare la telecamera.

const cockpitCanvas = renderer.domElement;

let isLooking = false;

let lookYaw = 0;
let lookPitch = 0;

let lastMouseX = 0;
let lastMouseY = 0;

const lookDirection = new THREE.Vector3();


// ========================================
// INIZIO TRASCINAMENTO
// ========================================

cockpitCanvas.addEventListener('pointerdown', function(event) {

    if (!interiorModeActive || event.button !== 0) {
        return;
    }

    isLooking = true;

// Interrompiamo il movimento automatico
// appena l'utente trascina manualmente.

if (cockpitLookTween) {

    cockpitLookTween.kill();

    cockpitLookTween = null;

}

// Rimuoviamo la selezione dei preset.

document.querySelectorAll(
    '[data-cockpit-view]'
).forEach(function(button) {

    button.classList.remove('active');

});

lastMouseX = event.clientX;
lastMouseY = event.clientY;

    camera.getWorldDirection(lookDirection);

    lookYaw = Math.atan2(
        lookDirection.x,
        lookDirection.z
    );

    lookPitch = Math.asin(
        THREE.MathUtils.clamp(
            lookDirection.y,
            -1,
            1
        )
    );

    cockpitCanvas.setPointerCapture(event.pointerId);

    event.preventDefault();

});


// ========================================
// MOVIMENTO DELLO SGUARDO
// ========================================

cockpitCanvas.addEventListener('pointermove', function(event) {

    if (!interiorModeActive || !isLooking) {
        return;
    }

    const deltaX = event.clientX - lastMouseX;
    const deltaY = event.clientY - lastMouseY;

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

    const sensitivity = 0.0035;

    // Movimento orizzontale
    lookYaw += deltaX * sensitivity;

    // Movimento verticale
    lookPitch -= deltaY * sensitivity;

    // Limiti verticali
    lookPitch = THREE.MathUtils.clamp(
        lookPitch,
        -0.85,
        0.75
    );

    // Nuova direzione dello sguardo
    lookDirection.set(
        Math.sin(lookYaw) * Math.cos(lookPitch),
        Math.sin(lookPitch),
        Math.cos(lookYaw) * Math.cos(lookPitch)
    );

    // Ruotiamo soltanto la telecamera
    camera.lookAt(
        camera.position.clone().add(lookDirection)
    );

});


// ========================================
// FINE TRASCINAMENTO
// ========================================

function stopLooking() {
    isLooking = false;
}

cockpitCanvas.addEventListener(
    'pointerup',
    stopLooking
);

cockpitCanvas.addEventListener(
    'pointercancel',
    stopLooking
);

cockpitCanvas.addEventListener(
    'lostpointercapture',
    stopLooking
);

cockpitCanvas.style.touchAction = 'none';

// ========================================
// VYRA — GUIDED COCKPIT EXPLORER
// ========================================


// Inquadrature disponibili.

const cockpitPresets = {

    driver: {
        yaw: 0,
        pitch: 0
    },

    dashboard: {
        yaw: 0,
        pitch: -18
    },

    passenger: {
        yaw: 60,
        pitch: -3
    }

};


// ========================================
// FUNZIONE DI CAMBIO INQUADRATURA
// ========================================

function setCockpitPreset(presetName) {

    if (!interiorModeActive) return;

    const preset = cockpitPresets[presetName];

    if (!preset) return;


    // Interrompiamo eventuali
    // animazioni precedenti.

    if (cockpitLookTween) {

        cockpitLookTween.kill();

    }


    // Salviamo l'orientamento attuale.

    const startRotation = camera.quaternion.clone();


    // Rotazione orizzontale.

    const yawRotation = new THREE.Quaternion()
        .setFromAxisAngle(

            new THREE.Vector3(0, 1, 0),

            THREE.MathUtils.degToRad(preset.yaw)

        );


    // Rotazione verticale.

    const pitchRotation = new THREE.Quaternion()
        .setFromAxisAngle(

            new THREE.Vector3(1, 0, 0),

            THREE.MathUtils.degToRad(preset.pitch)

        );


    // Calcoliamo l'orientamento finale
    // rispetto alla visuale originale.

    const targetRotation = yawRotation
        .multiply(cockpitHomeQuaternion.clone())
        .multiply(pitchRotation);


    // Stato dell'animazione.

    const animation = {
        progress: 0
    };


    // ====================================
    // ANIMAZIONE CINEMATOGRAFICA
    // ====================================

    cockpitLookTween = gsap.to(animation, {

        progress: 1,

        duration: 1,

        ease: 'power2.inOut',

        onUpdate: function() {

            if (!interiorModeActive) return;

            // Interpoliamo gli orientamenti.

            camera.quaternion
                .copy(startRotation)
                .slerp(
                    targetRotation,
                    animation.progress
                );

        }

    });

}


// ========================================
// EVENTI DEI PULSANTI
// ========================================

const cockpitPresetButtons = document.querySelectorAll(
    '[data-cockpit-view]'
);


cockpitPresetButtons.forEach(function(button) {

    button.addEventListener('click', function() {

        const presetName =
            button.dataset.cockpitView;


        // Avviamo l'animazione.

        setCockpitPreset(presetName);


        // Aggiorniamo il pulsante attivo.

        cockpitPresetButtons.forEach(function(item) {

            item.classList.toggle(
                'active',
                item === button
            );

        });

    });

});

// ========================================
// 5. AGGIORNAMENTO PULSANTE
// ========================================

function updateViewButton() {

    if (!viewButton) return;

    viewButton.textContent = interiorModeActive
        ? 'EXTERIOR VIEW ↙'
        : 'EXPLORE CABIN ↗';

    viewButton.setAttribute(
        'aria-pressed',
        String(interiorModeActive)
    );

}


// ========================================
// 6. RITORNO ALL'ESTERNO
// ========================================

function exitInteriorView() {

    if (!interiorModeActive) return;

    interiorModeActive = false;

    updateViewButton();

    changeCameraView(
        exteriorCameraPosition,
        exteriorCameraTarget,
        false
    );

}


// ========================================
// 7. ATTIVAZIONE COCKPIT VIEW
// ========================================

if (viewButton) {

    if (!driverSeat || !dashboard) {

        viewButton.disabled = true;

        console.warn(
            'Componenti abitacolo non trovati.'
        );

    } else {

        viewButton.disabled = false;

        viewButton.addEventListener('click', function() {

            // Ritorno alla vista esterna.

            if (interiorModeActive) {

                exitInteriorView();

                return;

            }


            // Salviamo la vista attuale.

            exteriorCameraPosition.copy(
                camera.position
            );

            exteriorCameraTarget.copy(
                controls.target
            );


            // Aggiorniamo il modello.

            car.updateMatrixWorld(true);


            // ========================================
// COCKPIT CAMERA — STEERING WHEEL REFERENCE
// ========================================

// Individuiamo il volante reale.

const steeringWheel = model.getObjectByName(
    'InteriorSteeringWheel01'
);

if (!steeringWheel) {
    console.error('Volante non trovato!');
    return;
}

// Aggiorniamo le trasformazioni.

car.updateMatrixWorld(true);

// Posizione esatta del volante nel mondo 3D.

const wheelPosition = new THREE.Vector3();

steeringWheel.getWorldPosition(wheelPosition);

// ========================================
// VYRA — DRIVER COCKPIT CAMERA
// ========================================

// Posizione degli occhi del conducente.

const cockpitPosition = wheelPosition.clone();

cockpitPosition.x += 0.22;
cockpitPosition.y += 0.26;
cockpitPosition.z -= 0.75;


// Direzione dello sguardo:
// verso il basso e il centro della plancia.

const cockpitTarget = wheelPosition.clone();

cockpitTarget.x += 0.32;
cockpitTarget.y -= 0.34;
cockpitTarget.z += 0.65;


// Controllo coordinate

console.log('COCKPIT CAMERA:', cockpitPosition);
console.log('COCKPIT TARGET:', cockpitTarget);

// Verifica delle coordinate.

console.log('COCKPIT CAMERA:', cockpitPosition);
console.log('COCKPIT TARGET:', cockpitTarget);


            // ====================================
            // ATTIVAZIONE MODALITÀ INTERNA
            // ====================================

            interiorModeActive = true;

            controls.enabled = false;
            controls.autoRotate = false;


            // Non apriamo le portiere:
            // la telecamera sarà dentro l'auto.

            if (doorsOpen && setDoorsOpen) {

                setDoorsOpen(false);

            }


            updateViewButton();


            // Passiamo alla visuale interna.

            changeCameraView(
                cockpitPosition,
                cockpitTarget,
                true
            );

        });

    }


    // ====================================
    // USCITA QUANDO CAMBIAMO SEZIONE
    // ====================================

    window.addEventListener('scroll', function() {

        if (!interiorModeActive) return;

        const configurator = document.getElementById(
            'configurator'
        );

        if (!configurator) return;

        const rect = configurator.getBoundingClientRect();

        if (
            rect.bottom < 0 ||
            rect.top > window.innerHeight
        ) {

            exitInteriorView();

        }

    }, { passive: true });

}


// ========================================
// 6. PERSONALIZZAZIONE INTERNI
// ========================================

const interiorMaterials = new Set();


// Cerchiamo i materiali dell'abitacolo.

model.traverse(function(object) {

    if (!object.isMesh || !object.material) {
        return;
    }

    const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];


    materials.forEach(function(material) {

        if (
            material &&
            /^Interior\s*3\b/i.test(material.name)
        ) {

            interiorMaterials.add(material);

        }

    });

});


// ========================================
// 7. CAMBIO COLORE INTERNI
// ========================================

interiorButtons.forEach(function(button) {

    button.addEventListener('click', function() {

        if (interiorMaterials.size === 0) return;

        const selectedColor =
            button.dataset.interiorColor;


        // Modifichiamo i materiali.

        interiorMaterials.forEach(function(material) {

            material.color.set(selectedColor);

        });


        // Aggiorniamo i pulsanti.

        interiorButtons.forEach(function(item) {

            const active = item === button;

            item.classList.toggle(
                'active',
                active
            );

            item.setAttribute(
                'aria-pressed',
                String(active)
            );

        });

    });

});


// Disabilitiamo i colori se il modello
// non contiene i materiali previsti.

if (interiorMaterials.size === 0) {

    interiorButtons.forEach(function(button) {

        button.disabled = true;

    });

}


// ========================================
// 8. VERIFICA COMPONENTI
// ========================================

console.log(
    'VYRA INTERIOR EXPERIENCE READY',
    {
        materials: interiorMaterials.size
    }
);

    // ====================================
    // 4. CONFIGURAZIONE INIZIALE
    // ====================================

    setPaintFinish('gloss');

    setWheelFinish('dark');


    console.log(
        'VYRA 3D CONFIGURATOR READY',
        {
            paintMaterials: paintMaterials.size,
            rimMaterials: rimMaterials.length,
            headlightMaterials: headlightMaterials.size
        }
    );

}

// ========================================
// FASE 12 — VYRA CONFIGURATION STORAGE
// ========================================

function setupConfigurationStorage() {

    const STORAGE_KEY = 'vyra-one-configuration-v1';

    const saveButton = document.getElementById(
        'save-configuration'
    );

    const loadButton = document.getElementById(
        'load-configuration'
    );

    const statusText = document.getElementById(
        'configuration-status'
    );

    if (!saveButton || !loadButton || !statusText) {
        return;
    }


    // ====================================
    // 1. LEGGIAMO LE SCELTE ATTUALI
    // ====================================

    function getCurrentConfiguration() {

        const paintColor =
            document.querySelector(
                '[data-config-color].active'
            )?.dataset.configColor ||
            document.querySelector(
                '[data-color].active'
            )?.dataset.color ||
            '#cdd8e4';


        const paintFinish =
            document.querySelector(
                '[data-finish].active'
            )?.dataset.finish || 'gloss';


        const wheelFinish =
            document.querySelector(
                '[data-wheel-finish].active'
            )?.dataset.wheelFinish || 'dark';


        const interiorColor =
            document.querySelector(
                '[data-interior-color].active'
            )?.dataset.interiorColor || '#9c3440';


        const lightsButton = document.getElementById(
            'config-lights'
        );

        const lightsOn = lightsButton
            ? lightsButton.getAttribute('aria-pressed') === 'true'
            : true;


        return {

            version: 1,

            paintColor: paintColor,

            paintFinish: paintFinish,

            wheelFinish: wheelFinish,

            interiorColor: interiorColor,

            lightsOn: lightsOn

        };

    }


    // ====================================
    // 2. TROVIAMO UN PULSANTE
    // ====================================

    function selectSavedOption(selector, dataKey, value) {

        if (typeof value !== 'string') return;

        const buttons = document.querySelectorAll(selector);

        const matchingButton = Array.from(buttons).find(
            function(button) {

                return button.dataset[dataKey] === value;

            }
        );


        if (matchingButton && !matchingButton.disabled) {

            matchingButton.click();

        }

    }


    // ====================================
    // 3. SALVIAMO LA CONFIGURAZIONE
    // ====================================

    function saveConfiguration() {

        const configuration = getCurrentConfiguration();

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(configuration)
            );

            loadButton.disabled = false;

            statusText.textContent =
                'Configuration saved successfully.';

            console.log(
                'VYRA CONFIGURATION SAVED:',
                configuration
            );

        } catch (error) {

            console.error(
                'Unable to save configuration:',
                error
            );

            statusText.textContent =
                'Unable to save. Check browser storage settings.';

        }

    }


    // ====================================
    // 4. RECUPERIAMO LA CONFIGURAZIONE
    // ====================================

    function loadConfiguration(automatic = false) {

        try {

            const storedData = localStorage.getItem(
                STORAGE_KEY
            );

            if (!storedData) {

                statusText.textContent =
                    'No saved configuration found.';

                return;

            }

            const saved = JSON.parse(storedData);

            if (!saved || saved.version !== 1) {

                statusText.textContent =
                    'Saved configuration is not compatible.';

                return;

            }


            // ====================================
            // CARROZZERIA
            // ====================================

            selectSavedOption(
                '[data-config-color]',
                'configColor',
                saved.paintColor
            );


            // ====================================
            // FINITURA VERNICE
            // ====================================

            selectSavedOption(
                '[data-finish]',
                'finish',
                saved.paintFinish
            );


            // ====================================
            // FINITURA CERCHI
            // ====================================

            selectSavedOption(
                '[data-wheel-finish]',
                'wheelFinish',
                saved.wheelFinish
            );


            // ====================================
            // COLORE INTERNI
            // ====================================

            selectSavedOption(
                '[data-interior-color]',
                'interiorColor',
                saved.interiorColor
            );


            // ====================================
            // FARI
            // ====================================

            const lightsButton = document.getElementById(
                'config-lights'
            );

            if (
                lightsButton &&
                !lightsButton.disabled &&
                typeof saved.lightsOn === 'boolean'
            ) {

                const currentlyOn =
                    lightsButton.getAttribute('aria-pressed') === 'true';

                if (currentlyOn !== saved.lightsOn) {

                    lightsButton.click();

                }

            }


            // ====================================
            // CONFERMA
            // ====================================

            statusText.textContent = automatic
                ? 'Your saved configuration has been loaded.'
                : 'Configuration restored successfully.';


            console.log(
                'VYRA CONFIGURATION LOADED:',
                saved
            );

        } catch (error) {

            console.error(
                'Unable to load configuration:',
                error
            );

            statusText.textContent =
                'Unable to read saved configuration.';

        }

    }


    // ====================================
    // 5. ATTIVIAMO I PULSANTI
    // ====================================

    saveButton.disabled = false;


    saveButton.addEventListener('click', function() {

        saveConfiguration();

    });


    loadButton.addEventListener('click', function() {

        loadConfiguration(false);

    });


    // ====================================
    // 6. CONTROLLIAMO SE ESISTE UN SALVATAGGIO
    // ====================================

    try {

        const savedData = localStorage.getItem(
            STORAGE_KEY
        );

        if (savedData) {

            loadButton.disabled = false;

            // Recuperiamo automaticamente
            // la configurazione salvata.

            loadConfiguration(true);

        } else {

            statusText.textContent =
                'No saved configuration yet.';

        }

    } catch (error) {

        console.warn(
            'Browser storage unavailable:',
            error
        );

        statusText.textContent =
            'Browser storage is not available.';

    }

    // ========================================
// FASE 13 — SHARE YOUR VYRA
// ========================================

const shareButton = document.getElementById(
    'share-configuration'
);


// ========================================
// 1. GENERAZIONE DEL LINK
// ========================================

function createShareLink() {

    // Recuperiamo le scelte attuali.

    const configuration = getCurrentConfiguration();


    // Partiamo dall'indirizzo del sito.

    const shareUrl = new URL(
        window.location.href
    );


    // Inseriamo la configurazione nel link.

    shareUrl.searchParams.set(
        'vyra',
        JSON.stringify(configuration)
    );


    // Quando si apre il link,
    // si raggiunge il configuratore.

    shareUrl.hash = 'configurator';


    return shareUrl.toString();

}


// ========================================
// 2. APPLICAZIONE CONFIGURAZIONE CONDIVISA
// ========================================

function applySharedConfiguration(configuration) {

    if (!configuration || configuration.version !== 1) {

        statusText.textContent =
            'Invalid shared configuration.';

        return;

    }


    // Controlliamo che le opzioni
    // esistano realmente nel configuratore.

    function isValidOption(selector, dataKey, value) {

        if (typeof value !== 'string') {
            return false;
        }

        return Array.from(
            document.querySelectorAll(selector)
        ).some(function(button) {

            return (
                button.dataset[dataKey] === value &&
                !button.disabled
            );

        });

    }


    const validConfiguration =

        isValidOption(
            '[data-config-color]',
            'configColor',
            configuration.paintColor
        ) &&

        isValidOption(
            '[data-finish]',
            'finish',
            configuration.paintFinish
        ) &&

        isValidOption(
            '[data-wheel-finish]',
            'wheelFinish',
            configuration.wheelFinish
        ) &&

        isValidOption(
            '[data-interior-color]',
            'interiorColor',
            configuration.interiorColor
        ) &&

        typeof configuration.lightsOn === 'boolean';


    if (!validConfiguration) {

        statusText.textContent =
            'Shared configuration contains invalid options.';

        return;

    }


    // ====================================
    // CARROZZERIA
    // ====================================

    selectSavedOption(
        '[data-config-color]',
        'configColor',
        configuration.paintColor
    );


    // ====================================
    // FINITURA VERNICE
    // ====================================

    selectSavedOption(
        '[data-finish]',
        'finish',
        configuration.paintFinish
    );


    // ====================================
    // FINITURA CERCHI
    // ====================================

    selectSavedOption(
        '[data-wheel-finish]',
        'wheelFinish',
        configuration.wheelFinish
    );


    // ====================================
    // COLORE INTERNI
    // ====================================

    selectSavedOption(
        '[data-interior-color]',
        'interiorColor',
        configuration.interiorColor
    );


    // ====================================
    // FARI
    // ====================================

    const lightsButton = document.getElementById(
        'config-lights'
    );

    if (lightsButton && !lightsButton.disabled) {

        const lightsCurrentlyOn =
            lightsButton.getAttribute('aria-pressed') === 'true';

        if (lightsCurrentlyOn !== configuration.lightsOn) {

            lightsButton.click();

        }

    }


    statusText.textContent =
        'Shared VYRA configuration loaded.';

}


// ========================================
// 3. COPIA DEL LINK
// ========================================

if (shareButton) {

    shareButton.disabled = false;


    shareButton.addEventListener(
        'click',
        async function() {

            const shareLink = createShareLink();


            try {

                // Copiamo il link negli appunti.

                await navigator.clipboard.writeText(
                    shareLink
                );


                statusText.textContent =
                    'Share link copied to clipboard!';


            } catch (error) {

                // Alternativa per browser che
                // non consentono la copia automatica.

                window.prompt(
                    'Copy your VYRA configuration link:',
                    shareLink
                );


                statusText.textContent =
                    'Your share link is ready.';

            }

        }
    );

}


// ========================================
// 4. LETTURA CONFIGURAZIONE DAL LINK
// ========================================

const currentUrl = new URL(
    window.location.href
);

const sharedData = currentUrl.searchParams.get(
    'vyra'
);


// Se il link contiene una configurazione,
// proviamo a ripristinarla.

if (sharedData !== null) {

    try {

        const sharedConfiguration = JSON.parse(
            sharedData
        );


        applySharedConfiguration(
            sharedConfiguration
        );


    } catch (error) {

        console.error(
            'Invalid VYRA share link:',
            error
        );


        statusText.textContent =
            'Unable to read shared configuration.';

    }

}

// ========================================
// FASE 14 — CONFIGURATION SUMMARY
// ========================================

// Elementi del riepilogo.

const summaryExterior = document.getElementById(
    'summary-exterior'
);

const summaryPaint = document.getElementById(
    'summary-paint'
);

const summaryWheels = document.getElementById(
    'summary-wheels'
);

const summaryInterior = document.getElementById(
    'summary-interior'
);

const summaryLights = document.getElementById(
    'summary-lights'
);

const downloadSpecButton = document.getElementById(
    'download-spec-sheet'
);


// ========================================
// 1. RECUPERIAMO I NOMI DELLE OPZIONI
// ========================================

function getConfigurationLabel(
    selector,
    dataKey,
    value
) {

    const buttons = document.querySelectorAll(
        selector
    );

    const matchingButton = Array.from(buttons).find(
        function(button) {

            return button.dataset[dataKey] === value;

        }
    );

    if (!matchingButton) {
        return value;
    }

    return (
        matchingButton.getAttribute('aria-label') ||
        matchingButton.textContent.trim() ||
        value
    );

}


// ========================================
// 2. AGGIORNIAMO IL RIEPILOGO
// ========================================

function updateConfigurationSummary() {

    const configuration = getCurrentConfiguration();

    // Colore carrozzeria

    const exteriorName = getConfigurationLabel(
        '[data-config-color]',
        'configColor',
        configuration.paintColor
    );

    // Colore interni

    const interiorName = getConfigurationLabel(
        '[data-interior-color]',
        'interiorColor',
        configuration.interiorColor
    );


    if (summaryExterior) {

        summaryExterior.textContent =
            exteriorName.toUpperCase();

    }

    if (summaryPaint) {

        summaryPaint.textContent =
            configuration.paintFinish.toUpperCase();

    }

    if (summaryWheels) {

        summaryWheels.textContent =
            configuration.wheelFinish.toUpperCase();

    }

    if (summaryInterior) {

        summaryInterior.textContent =
            interiorName.toUpperCase();

    }

    if (summaryLights) {

        summaryLights.textContent =
            configuration.lightsOn ? 'ON' : 'OFF';

    }

}


// ========================================
// 3. AGGIORNAMENTO AUTOMATICO
// ========================================

// Ogni volta che cambiamo una caratteristica,
// aggiorniamo il riepilogo.

document.addEventListener('click', function(event) {

    const option = event.target.closest(

        '[data-color], ' +
        '[data-config-color], ' +
        '[data-finish], ' +
        '[data-wheel-finish], ' +
        '[data-interior-color], ' +
        '#config-lights'

    );

    if (!option) return;

    requestAnimationFrame(
        updateConfigurationSummary
    );

});


// Mostriamo la configurazione iniziale.

updateConfigurationSummary();


// ========================================
// 4. GENERAZIONE SPEC SHEET PDF
// ========================================

if (downloadSpecButton) {

    downloadSpecButton.disabled = false;

    downloadSpecButton.addEventListener(
        'click',
        function() {

            // Verifichiamo che la libreria PDF
            // sia stata caricata correttamente.

            if (!window.jspdf?.jsPDF) {

                statusText.textContent =
                    'PDF download unavailable. Check your connection.';

                return;

            }

            const { jsPDF } = window.jspdf;

            const pdf = new jsPDF({

                orientation: 'portrait',

                unit: 'mm',

                format: 'a4'

            });


            // Recuperiamo la configurazione attuale.

            const configuration =
                getCurrentConfiguration();


            const exteriorName =
                getConfigurationLabel(
                    '[data-config-color]',
                    'configColor',
                    configuration.paintColor
                );


            const interiorName =
                getConfigurationLabel(
                    '[data-interior-color]',
                    'interiorColor',
                    configuration.interiorColor
                );


            // ====================================
            // SFONDO
            // ====================================

            pdf.setFillColor(11, 16, 26);

            pdf.rect(
                0,
                0,
                210,
                297,
                'F'
            );


            // ====================================
            // LOGO
            // ====================================

            pdf.setFont(
                'helvetica',
                'bold'
            );

            pdf.setFontSize(34);

            pdf.setTextColor(
                255,
                255,
                255
            );

            pdf.text(
                'VYRA ONE',
                20,
                32
            );


            // ====================================
            // SOTTOTITOLO
            // ====================================

            pdf.setFont(
                'helvetica',
                'normal'
            );

            pdf.setFontSize(10);

            pdf.setTextColor(
                141,
                174,
                216
            );

            pdf.text(
                'PERSONAL CONFIGURATION',
                20,
                43
            );


            // Linea decorativa

            pdf.setDrawColor(
                141,
                174,
                216
            );

            pdf.line(
                20,
                52,
                190,
                52
            );


            // ====================================
            // PANNELLO CARATTERISTICHE
            // ====================================

            pdf.setFillColor(
                19,
                29,
                45
            );

            pdf.roundedRect(
                15,
                65,
                180,
                154,
                4,
                4,
                'F'
            );


            // Funzione per disegnare una riga.

            function drawSpecRow(label, value, y) {

                pdf.setFont(
                    'helvetica',
                    'normal'
                );

                pdf.setFontSize(9);

                pdf.setTextColor(
                    141,
                    174,
                    216
                );

                pdf.text(
                    label,
                    26,
                    y
                );


                pdf.setFont(
                    'helvetica',
                    'bold'
                );

                pdf.setFontSize(13);

                pdf.setTextColor(
                    255,
                    255,
                    255
                );

                pdf.text(
                    String(value).toUpperCase(),
                    26,
                    y + 9
                );

            }


            // ====================================
            // VALORI DELLA CONFIGURAZIONE
            // ====================================

            drawSpecRow(
                'EXTERIOR COLOR',
                exteriorName,
                80
            );

            drawSpecRow(
                'PAINT FINISH',
                configuration.paintFinish,
                108
            );

            drawSpecRow(
                'WHEEL FINISH',
                configuration.wheelFinish,
                136
            );

            drawSpecRow(
                'INTERIOR COLOR',
                interiorName,
                164
            );

            drawSpecRow(
                'LED HEADLIGHTS',
                configuration.lightsOn ? 'ON' : 'OFF',
                192
            );


            // ====================================
            // DATA
            // ====================================

            const date = new Date().toLocaleDateString(
                'en-GB'
            );


            pdf.setFontSize(10);

            pdf.setFont(
                'helvetica',
                'normal'
            );

            pdf.setTextColor(
                160,
                176,
                196
            );

            pdf.text(
                'CONFIGURATION DATE: ' + date,
                20,
                245
            );


            // ====================================
            // FOOTER
            // ====================================

            pdf.setDrawColor(
                60,
                80,
                105
            );

            pdf.line(
                20,
                261,
                190,
                261
            );


            pdf.setFontSize(9);

            pdf.setTextColor(
                141,
                174,
                216
            );

            pdf.text(
                'BEYOND MOTION.',
                20,
                273
            );


            pdf.setFontSize(8);

            pdf.setTextColor(
                150,
                160,
                175
            );

            pdf.text(
                'Concept vehicle - selected configuration options.',
                20,
                282
            );


            // ====================================
            // DOWNLOAD
            // ====================================

            pdf.save(
                'VYRA-ONE-Configuration.pdf'
            );


            statusText.textContent =
                'Configuration PDF downloaded.';

        }
    );

}

}

// ========================================
// FASE 18 — VYRA CINEMATIC REVEAL
// ========================================

function setupVYRAReveal() {

    const startButton = document.getElementById(
        'vyra-reveal-start'
    );

    const overlay = document.getElementById(
        'vyra-reveal'
    );

    const stage = document.getElementById(
        'vyra-reveal-stage'
    );

    const specs = document.getElementById(
        'vyra-reveal-specs'
    );

    if (!startButton || !overlay || !stage) {
        return;
    }

    const canvas = renderer.domElement;

    const titles = overlay.querySelectorAll(
        '.vyra-reveal-title'
    );

    let revealTimeline = null;
    let savedState = null;


    // ====================================
    // 1. POSIZIONE CINEMATOGRAFICA
    // ====================================

    const orbit = {
        angle: -0.95,
        radius: 8.8,
        height: 2.4
    };


    function updateRevealCamera() {

        camera.position.set(

            Math.sin(orbit.angle) * orbit.radius,

            orbit.height,

            Math.cos(orbit.angle) * orbit.radius

        );

        camera.lookAt(0, 0.95, 0);

    }


    // ====================================
    // 2. AVVIO DELLA PRESENTAZIONE
    // ====================================

    function openReveal() {

        if (revealActive) return;


        // Conserviamo lo stato originale.

        savedState = {

            parent: canvas.parentElement,

            position: camera.position.clone(),

            quaternion: camera.quaternion.clone(),

            target: controls.target.clone(),

            fov: camera.fov,

            near: camera.near,

            carRotation: car.rotation.y,

            controlsEnabled: controls.enabled,

            autoRotate: controls.autoRotate,

            lightIntensity: studioSpotlight.intensity,

            canvasOpacity: canvas.style.opacity,

            bodyOverflow: document.body.style.overflow,

            htmlOverflow:
                document.documentElement.style.overflow

        };


        // Blocchiamo temporaneamente
        // le normali interazioni della pagina.

        revealActive = true;

        controls.enabled = false;
        controls.autoRotate = false;

        document.body.style.overflow = 'hidden';

        document.documentElement.style.overflow = 'hidden';


        // Chiudiamo eventuali portiere aperte.

        if (doorsOpen && setDoorsOpen) {
            setDoorsOpen(false);
        }


        // Mostriamo la schermata.

        overlay.hidden = false;


        // Spostiamo temporaneamente
        // il canvas 3D nel nostro studio.

        stage.appendChild(canvas);

        canvas.style.opacity = '1';


        // Adattiamo il renderer allo schermo.

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        camera.aspect =
            window.innerWidth / window.innerHeight;

        camera.fov = 40;
        camera.near = 0.1;

        camera.updateProjectionMatrix();


        // Prepariamo l'automobile.

        car.rotation.y = 0;

        studioSpotlight.intensity = 0;

        orbit.angle = -0.95;
        orbit.radius = 8.8;
        orbit.height = 2.4;

        updateRevealCamera();


        // ====================================
        // 3. MOSTRIAMO LA CONFIGURAZIONE
        // ====================================

        const selectedColor = document.querySelector(
            '[data-config-color].active'
        );

        const selectedFinish = document.querySelector(
            '[data-finish].active'
        );

        const selectedWheels = document.querySelector(
            '[data-wheel-finish].active'
        );


        const colorName =
            selectedColor?.getAttribute('aria-label') ||
            selectedColor?.dataset.configColor ||
            'CUSTOM';

        const finishName =
            selectedFinish?.dataset.finish ||
            'GLOSS';

        const wheelsName =
            selectedWheels?.dataset.wheelFinish ||
            'DARK';


        if (specs) {

            specs.textContent =

                colorName.toUpperCase() +
                ' / ' +
                finishName.toUpperCase() +
                ' / ' +
                wheelsName.toUpperCase() +
                ' WHEELS';

        }


        // Nascondiamo inizialmente i titoli.

        gsap.set(titles, {
            opacity: 0,
            y: 45
        });


        // ====================================
        // 4. TIMELINE CINEMATOGRAFICA
        // ====================================

        revealTimeline = gsap.timeline();


        // Accensione graduale dello studio.

        revealTimeline.to(

            studioSpotlight,

            {
                intensity: savedState.lightIntensity,
                duration: 2,
                ease: 'power2.out'
            },

            0

        );


        // PRIMA INQUADRATURA

        revealTimeline.to(

            orbit,

            {
                angle: -0.15,
                radius: 7.9,
                height: 2.6,

                duration: 3,

                ease: 'power1.inOut',

                onUpdate: updateRevealCamera
            },

            0

        );


        // PRIMO TITOLO

        revealTimeline.to(

            titles[0],

            {
                opacity: 1,
                y: 0,

                duration: 1.2,

                ease: 'power2.out'
            },

            0.6

        );


        revealTimeline.to(

            titles[0],

            {
                opacity: 0,
                y: -30,

                duration: 0.7
            },

            2.7

        );


        // SECONDA INQUADRATURA

        revealTimeline.to(

            orbit,

            {
                angle: 1.05,
                radius: 7,
                height: 2.8,

                duration: 3,

                ease: 'power1.inOut',

                onUpdate: updateRevealCamera
            },

            3

        );


        // SECONDO TITOLO

        revealTimeline.to(

            titles[1],

            {
                opacity: 1,
                y: 0,

                duration: 1,

                ease: 'power2.out'
            },

            3.4

        );


        revealTimeline.to(

            titles[1],

            {
                opacity: 0,
                y: -30,

                duration: 0.7
            },

            5.7

        );


        // INQUADRATURA FINALE

        revealTimeline.to(

            orbit,

            {
                angle: 0.55,
                radius: 8,
                height: 2.3,

                duration: 2.5,

                ease: 'power2.inOut',

                onUpdate: updateRevealCamera
            },

            6.1

        );


        // TITOLO FINALE

        revealTimeline.to(

            titles[2],

            {
                opacity: 1,
                y: 0,

                duration: 1.2,

                ease: 'power2.out'
            },

            6.6

        );

    }


    // ====================================
    // 5. RITORNO AL CONFIGURATORE
    // ====================================

    function closeReveal() {

        if (!revealActive || !savedState) {
            return;
        }


        // Interrompiamo l'animazione.

        if (revealTimeline) {
            revealTimeline.kill();
            revealTimeline = null;
        }


        // Nascondiamo la schermata.

        overlay.hidden = true;


        // Riportiamo il canvas nella scena.

        savedState.parent.appendChild(canvas);

        canvas.style.opacity =
            savedState.canvasOpacity;


        // Ripristiniamo l'automobile.

        car.rotation.y = savedState.carRotation;

        studioSpotlight.intensity =
            savedState.lightIntensity;


        // Ripristiniamo la telecamera.

        camera.position.copy(
            savedState.position
        );

        camera.quaternion.copy(
            savedState.quaternion
        );

        controls.target.copy(
            savedState.target
        );

        camera.fov = savedState.fov;
        camera.near = savedState.near;

        camera.aspect =
            container.clientWidth / container.clientHeight;

        camera.updateProjectionMatrix();


        // Ripristiniamo il renderer.

        renderer.setSize(
            container.clientWidth,
            container.clientHeight
        );


        // Riattiviamo i controlli.

        controls.enabled =
            savedState.controlsEnabled;

        controls.autoRotate =
            savedState.autoRotate;


        // Riattiviamo lo scroll.

        document.body.style.overflow =
            savedState.bodyOverflow;

        document.documentElement.style.overflow =
            savedState.htmlOverflow;


        revealActive = false;

        savedState = null;

    }


    // ====================================
    // 6. EVENTI DEI PULSANTI
    // ====================================

    startButton.disabled = false;


    startButton.addEventListener('click', function() {

        if (revealActive) return;


        // Se siamo negli interni,
        // torniamo prima alla vista esterna.

        if (interiorModeActive) {

            document.getElementById(
                'config-view'
            )?.click();

            gsap.delayedCall(
                1,
                openReveal
            );

        } else {

            openReveal();

        }

    });


    // Entrambi i pulsanti chiudono lo studio.

    overlay.querySelectorAll(
        '[data-reveal-close]'
    ).forEach(function(button) {

        button.addEventListener(
            'click',
            closeReveal
        );

    });


    // Permettiamo la chiusura con ESC.

    window.addEventListener('keydown', function(event) {

        if (event.key === 'Escape' && revealActive) {

            closeReveal();

        }

    });

}