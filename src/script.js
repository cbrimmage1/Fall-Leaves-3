console.log('hello is this thing on?');

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import CANNON from 'cannon'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap';

// firefly model
let firefly;
let mixer;

// ????
let INTERSECTED;

// whispers array
let whispers = [];

// *~ GRAB DOM ELEMENTS~*
// icons
let infoIcon = document.getElementById('info__icon');
let leafIcon = document.getElementById('leaf__icon');
let musicIcon = document.getElementById('music__icon');
let soundIcon = document.getElementById('sound__icon');
// music
let lofiMusic = document.getElementById('lofi');
lofiMusic.loop = true;
// whisper input pop up
let popup = document.getElementById("popup");
let popupInner = document.getElementById('popup__inner');
let whisper = document.querySelector('#popup__input');
let whisperInput = document.getElementById('popup__input');
let whisperSubmit = document.querySelector('#popup__submit');
// whisper text container
let whisperContainer = document.getElementById("whisper__container")
// whisper message popup
let whisperMessagePop = document.getElementById("whisper__popup")


// *~ VARIABLES FOR 'WHISPERS' EVENT
let cursor = new THREE.Vector2();
let intersectionPoint = new THREE.Vector3();
let planeNormal = new THREE.Vector3();
let mousePlane = new THREE.Plane();
let raycaster = new THREE.Raycaster();


//*~ FETCH WHISPER MESSAGES FROM THE SERVER
fetch('/messages')
    .then(response => {
        return response.json()
    })
    .then(data => {
        console.log(data);
        //add all the messages from the server to the page
        let loadedWhispers = data.data;
        console.log(loadedWhispers);
        for (let i = 0; i < loadedWhispers.length; i++) {
            // grab text
            let message = loadedWhispers[i].text;
            console.log(message)

            // make message a 'p' element
            let serverMessage = document.createElement('p');
            serverMessage.className = 'server__text'
            serverMessage.innerHTML = message

            // append text to whisper popup
            whisperMessagePop.appendChild(serverMessage)

            // display popup on click
            window.addEventListener('click', () => {
                if (INTERSECTED) {
                    whisperMessagePop.classList.add("open");
                }
                if (event.target == whisperMessagePop) {
                    whisperMessagePop.classList.remove("open")
                }
            })

            // grab position
            let position = loadedWhispers[i].position;
            console.log(position)

            // create new mesh
            let loadWhisperMesh = new THREE.Mesh(whisperGeometry, whisperMaterial);
            scene.add(loadWhisperMesh);

            // push mesh to whisper array
            whispers.push(loadWhisperMesh);
            console.log(whispers)

            // place loaded whisper
            loadWhisperMesh.position.copy(position)

        }
    })
    .catch(error => {
        console.log(error);
    });


// *~ TOGGLE AUDIO ~*

musicIcon.addEventListener('click', () => {
    return lofiMusic.paused ? lofiMusic.play() : lofiMusic.pause()

})


// *~ THREE.JS SETUP ~*
// *~ CANVAS ~*
const canvas = document.querySelector('canvas.webgl')


// *~ SCENE ~*
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xE09B51);
// add fog
scene.fog = new THREE.FogExp2(0xE09B51, 0.09);


// *~ LIGHTS ~*
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)


// *~ SIZES ~*
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


// *~ CAMERA ~*
let camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 1, 3)
scene.add(camera)


// *~ TEXTURES ~*
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])


// *~ FLOOR ~*
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        color: '#9f562c',
        metalness: 0,
        roughness: 1,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)


// *~ BLANKET MODEL LOADER ~*
let blanketModelLoader = new GLTFLoader();

blanketModelLoader.load(
    '/models/blanket.glb',
    (glb) => {
        let blanket = glb.scene;
        // scene.add(blanket);

        // blanket position
        // blanket.scale.set(0.9, 0.9, 0.9)
        blanket.position.set(-4, 0.09, 4)
    }
)

// *~ TREE MODEL LOADER ~*
let gltfTreeLoader = new GLTFLoader();

gltfTreeLoader.load(
    '/models/autumn_tree.glb',
    (glb) => {

        // tree models
        let tree = glb.scene;

        // // cast shadows
        tree.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
            }
        })
        scene.add(tree);

        let treeTwo = tree.clone()
        scene.add(treeTwo);

        let treeThree = tree.clone()
        scene.add(treeThree);

        let treeFour = tree.clone()
        scene.add(treeFour);

        let treeFive = tree.clone()
        scene.add(treeFive);

        let treeSix = tree.clone()
        scene.add(treeSix);

        let treeSeven = tree.clone()
        scene.add(treeSeven);

        // set tree positions & rotation
        // 1
        tree.scale.set(0.80, 0.80, 0.80);
        tree.position.set(3, -0.2, -14);

        // 2
        treeTwo.scale.set(0.60, 0.60, 0.60);
        treeTwo.position.set(4, -0.2, -8);
        treeTwo.rotation.set(0, 1, 0)

        // 3
        treeThree.scale.set(0.70, 0.70, 0.70);
        treeThree.position.set(15, -0.2, -7);

        // 4
        treeFour.scale.set(0.70, 0.70, 0.70);
        treeFour.position.set(5, -0.2, -9);

        // 5
        treeFive.scale.set(0.60, 0.60, 0.60);
        treeFive.position.set(12, -0.2, -3);

        // 6
        treeSix.scale.set(0.60, 0.60, 0.60);
        treeSix.position.set(15, -0.2, -12);

        // 7
        treeSeven.scale.set(0.75, 0.75, 0.75);
        treeSeven.position.set(5, -0.2, -15);

    }

)

// *~ FIREFLY MODEL LOADER ~*
let gltfFireflyLoader = new GLTFLoader();

gltfFireflyLoader.load(
    '/models/firefly.glb',
    (glb) => {
        firefly = glb.scene;
        // scene.add(firefly)

        mixer = new THREE.AnimationMixer(firefly)
        let clips = glb.animations;


    })



// *~ ORBIT CONTROLS
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.dampingFactor = 0.01;
controls.enablePan = false;
controls.minPolarAngle = Math.PI * 0.37;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minAzimuthAngle = - 1.2;
controls.maxAzimuthAngle = -0.2;
controls.maxDistance = 5;
controls.minDistance = 2;


// *~ PHYSICS ~*
// create physics world
let world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);

world.defaultContactMaterial.contactEquationStiffness = 1e15; // contact stiffness (use to make softer/harder contacts)
world.defaultContactMaterial.contactEquationRelaxation = 2; // stabilization time (in number of timesteps)

world.gravity.set(0, -1.82, 0);

// physics materials
let floorMaterial = new CANNON.Material('floor');
let leafPhysicsMaterial = new CANNON.Material('leaf');

// floor/leaf contact
let floorLeafMaterial = new CANNON.ContactMaterial(
    floorMaterial,
    leafPhysicsMaterial,
    {
        friction: 10,
        restitution: 0.04
    }
)
world.addContactMaterial(floorLeafMaterial);

// leaf/leaf contact
let leafLeafMaterial = new CANNON.ContactMaterial(
    leafPhysicsMaterial,
    leafPhysicsMaterial,
    {
        friction: 100,
        restitution: 0
    }
)
world.addContactMaterial(leafLeafMaterial);


// floor physics
let floorShape = new CANNON.Plane();
let floorBody = new CANNON.Body();
floorBody.material = floorMaterial;
floorBody.mass = 0; // floor is static
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle( // rotate floor
    new CANNON.Vec3(-1, 0, 0),
    Math.PI * 0.5
);
world.addBody(floorBody); // add floor to physics world


// *~ MOUSE MOVE EVENT ~*
// mouse move
window.addEventListener('mousemove', (event) => {
    // update mouse coordinates
    cursor.x = (event.clientX / sizes.width) * 2 - 1;
    cursor.y = - (event.clientY / sizes.height) * 2 + 1;

    // update the mouse plane's normals w/ camera position
    planeNormal.copy(camera.position).normalize();
    mousePlane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);

    // update raycaster
    raycaster.ray.intersectPlane(mousePlane, intersectionPoint);

})

window.addEventListener('resize', () => {
    // update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


// *~ RENDERER ~*
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// *~ CREATE LEAVES ~*
// leaves array
let leaves = [];

// leaf geometry
let leafGeometry = new THREE.BoxGeometry(1, 0.01, 1);

// leaf material
let leafMaterial = new THREE.MeshStandardMaterial({
    metalness: 0,
    roughness: 1,
    envMap: environmentMapTexture,
    color: 0xa14a21
})


// create leaves function!
let createLeaf = (width, height, depth, position, color) => {

    // create three.js leaf mesh
    let mesh = new THREE.Mesh(leafGeometry, leafMaterial);
    mesh.scale.set(width, height, depth);
    mesh.rotation.set(0, Math.random() * 0.5, 0);
    mesh.castShadow = true;
    mesh.position.copy(position);
    mesh.material.color.setHex(color);
    scene.add(mesh);

    // create cannon.js leaf physics body
    let shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5));
    let body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: leafPhysicsMaterial
    })
    body.position.copy(position);
    body.size = 0.01;
    // body.applyLocalForce(new CANNON.Vec3(0, 0, 20), new CANNON.Vec3(Math.PI,0,0));
    world.addBody(body);

    // save in array
    leaves.push({
        mesh: mesh,
        body: body
    })
}

// call creaeLeaf function on leafIcon click
leafIcon.addEventListener('click', () => {

    createLeaf(
        // width, height, depth
        Math.random() * (0.45 - 0.25) + 0.25,
        0.04,
        0.25,
        // position
        {
            x: Math.random() * 2 - 0.1,
            y: 4,
            z: Math.random() * 2 - 0.3
        },
        // hex
        Math.random() * 0xffffff

    );

    for (let object of leaves) {

        if (leaves.length > 200) {
            leaves.shift(); // remove 1st object in the array
            world.remove(object.body); // remove physics
            scene.remove(object.mesh); // remove mesh
        }

    }

})


// *~ CREATE WHISPERS ~*

// whisper animation timeline -- !! once you replace w/ blender mesh, animate so that it expands on hover !!
let tl = gsap.timeline(
    {
        repeat: -1,
        yoyo: true,
    });

// whisper geometry
let whisperGeometry = new THREE.SphereGeometry(0.05, 30, 30);

// whisper material
let whisperMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFEA00,
    metalness: 0,
    roughness: 0
})

// called to create new whisper meshes
let createWhisper = () => {
    // create whisper mesh
    let whisperMesh = new THREE.Mesh(whisperGeometry, whisperMaterial);
    whisperMesh.visible = false; // mesh invisible when initially called (toggled with input)
    scene.add(whisperMesh);
    console.log(whisperMesh)

    // place whisper at mouse position
    whisperMesh.position.copy(intersectionPoint);

    // add whisper to array
    whispers.push(whisperMesh);

    console.log(whispers)

    // animate
    tl.to(whisperMesh.scale, { duration: 1, x: 1.3, y: 1.3, z: 1.3 }, 'start')


}

// create whisper mesh + trigger popup on dbl click
window.addEventListener('dblclick', () => {

    // create mesh element at click location
    createWhisper();

    // toggle pop up
    popup.classList.add("open")

})

// if input is received, then :
whisperSubmit.addEventListener('click', () => {
    let whisperValue = whisper.value
    let lastWhisper = whispers[whispers.length - 1]

    // if the submission isn't empty
    if (whisperValue !== '') {

        // *~ SEND WHISPER MESSAGE TO SERVER ~*
        // 1. create whisper text object
        let whisperObject = {
            message: whisperValue,
            position: {
                x: whispers[whispers.length - 1].position.x,
                y: whispers[whispers.length - 1].position.y,
                z: whispers[whispers.length - 1].position.z
            }

        }

        console.log(whisperObject)

        // 2. stringify the data
        let whisperObjectJSON = JSON.stringify(whisperObject);

        // 3. create a post request
        fetch('/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: whisperObjectJSON
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Message created:', data);
                // 4. create text element
                let newMessage = document.createElement('p');
                newMessage.className = 'whisper__text'
                newMessage.innerHTML = whisperValue
                // newMessage.visible 
                newMessage.setAttribute('data-position', JSON.stringify(whisperObject.position));
                console.log(newMessage)

                // 5. add text to whisper popup on hover
                // whisperContainer.appendChild(newMessage) // !! change to modals !!
                // whisperMessagePop.appendChild(newMessage)

            })
            .catch(error => {
                console.error('Error:', error);
            });


        // 5. show mesh element
        lastWhisper.visible = true;

        // if the submission is empty, remove the last whisper mesh that was created
    } else if (whisperValue == '') {

        let remove = whispers.pop()
        scene.remove(remove)

    }

    //close popup
    popup.classList.remove("open")

    // clear input
    whisperInput.value = "";

})

// close popup window by clicking outside popup
window.addEventListener('click', (event) => {
    if (event.target !== whisper || event.target == popupInner) {
        popup.classList.remove("open")
    }
})

// prevent popup being closed from clicking inside popup
popupInner.addEventListener('click', event => event.stopPropagation());


// *~ THREE.JS ANIMATE ~*
const clock = new THREE.Clock()
let previousElapsedTime = 0;

const tick = () => {

    // update time
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousElapsedTime;
    previousElapsedTime = elapsedTime;

    // update raycaster + find raycaster intersections

    raycaster.setFromCamera(cursor, camera);

    let whisperIntersects = [...whispers];
    const intersects = raycaster.intersectObjects(whisperIntersects, false)

    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {
            console.log(intersects[0].object)

            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex)

            INTERSECTED = intersects[0].object
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex()
            INTERSECTED.material.emissive.setHex(0xFFFFFF)

        }

    } else {

        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex)

        INTERSECTED = null

    }

    // update wind force
    for (let object of leaves) {
        setInterval(() => {
            object.body.applyForce(new CANNON.Vec3(-1.5, 0, 0), object.body.position);
        }, 7000)
    }

    // update physics world
    world.step(1 / 60, deltaTime, 3);

    // update createLeaf physics positions
    for (let object of leaves) {
        object.mesh.position.copy(object.body.position)
    }

    // update orbit controls
    controls.update()

    // update render
    renderer.render(scene, camera)

    // call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick();