console.log('hello is this thing on?');

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import CANNON from 'cannon'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// *~ GRAB ICON ELEMENTS~*
let infoIcon = document.getElementById('info__icon');
let leafIcon = document.getElementById('leaf__icon');
let musicIcon = document.getElementById('music__icon');
let soundIcon = document.getElementById('sound__icon');

// *~ VARIABLES FOR 'WHISPERS' EVENT
let cursor = new THREE.Vector2();
let intersectionPoint = new THREE.Vector3();
let planeNormal = new THREE.Vector3();
let mousePlane = new THREE.Plane();
let raycaster = new THREE.Raycaster();

//Fetch all the messages from the server
fetch('/messages')
    .then(response => {
        return response.json()
    })
    .then(data => {
        console.log(data);
        //Add all the messages from the server to the page
        let messages = data.data;
        console.log(messages);
        for (let i = 0; i < messages.length; i++) {
            console.log(messages[i]);
            let message = messages[i].message;
            console.log(message);
            // let newMessage = document.createElement('p');
            // newMessage.innerHTML = message;
        }
    })
    .catch(error => {
        console.log(error);
    });



// *~ THREE.JS SETUP ~*
// *~ CANVAS ~*
const canvas = document.querySelector('canvas.webgl')


// *~ SCENE ~*
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xE09B51);
// add fog
scene.fog = new THREE.FogExp2(0xE09B51, 0.09);


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


// *~ TREE MODEL LOADER ~*
let gltfLoader = new GLTFLoader();

gltfLoader.load(
    '/models/autumn_tree.glb',
    (glb) => {

        // tree models
        let tree = glb.scene;

        // cast shadows
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
        //1
        tree.scale.set(0.80, 0.80, 0.80);
        tree.position.set(3, -0.2, -14);

        //2
        treeTwo.scale.set(0.60, 0.60, 0.60);
        treeTwo.position.set(4, -0.2, -8);
        treeTwo.rotation.set(0, 1, 0)

        //3
        treeThree.scale.set(0.70, 0.70, 0.70);
        treeThree.position.set(15, -0.2, -7);

        //4
        treeFour.scale.set(0.70, 0.70, 0.70);
        treeFour.position.set(5, -0.2, -9);

        //5
        treeFive.scale.set(0.60, 0.60, 0.60);
        treeFive.position.set(12, -0.2, -3);

        //6
        treeSix.scale.set(0.60, 0.60, 0.60);
        treeSix.position.set(15, -0.2, -12);

        //7
        treeSeven.scale.set(0.75, 0.75, 0.75);
        treeSeven.position.set(5, -0.2, -15);

    }
)


// *~ PHYSICS ~*
// create world
let world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);

world.defaultContactMaterial.contactEquationStiffness = 1e15; // Contact stiffness - use to make softer/harder contacts
world.defaultContactMaterial.contactEquationRelaxation = 2; // Stabilization time in number of timesteps

world.gravity.set(0, -1.82, 0);

// materials
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

// mouse move
window.addEventListener('mousemove', (event) => {
    // update mouse coordinates
    cursor.x = (event.clientX / sizes.width) * 2 - 1;
    cursor.y = - (event.clientY / sizes.height) * 2 + 1;

    // update the mouse plane's normals w/ camera position
    planeNormal.copy(camera.position).normalize();
    mousePlane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);

    // update raycaster
    raycaster.setFromCamera(cursor, camera);
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


// *~ CAMERA ~*
// Base camera
let camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 1, 3)
scene.add(camera)


// *~ ORBIT CONTROLS
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false;
controls.minPolarAngle = Math.PI * 0.35;
controls.maxPolarAngle = Math.PI * 0.45;
controls.minAzimuthAngle = - 1.3;
controls.maxAzimuthAngle = 0.005;
controls.maxDistance = 5;
controls.minDistance = 2;


// *~ RENDERER ~*
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// *~ CREATE LEAVES ~*
let leaves = [];
// let colors = ['#5a612b', '#a14a21', '#e9d1a0'];

// leaf geometry
let leafGeometry = new THREE.BoxGeometry(1, 0.01, 1);

// leaf material
let leafMaterial = new THREE.MeshStandardMaterial({
    metalness: 0,
    roughness: 1,
    envMap: environmentMapTexture
    // color: Math.random() * 0xffffff
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
    let shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)); // should be plane; figure out plane glitch
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


// *~ ADD WHISPERS TO SCENE (ON MOUSE DOUBLE CLICK) ~*
let whispers = [];
let whisperGeometry = new THREE.SphereGeometry(0.07, 30, 30);
let whisperMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFEA00,
    metalness: 0,
    roughness: 0
})

// popup window targets
// let popup = document.getElementById("popup")

window.addEventListener('dblclick', (event) => {

    if (event.target !== leafIcon) {
        // popup.classList.add("open");

        let whisperMesh = new THREE.Mesh(whisperGeometry, whisperMaterial);
        scene.add(whisperMesh);

        // place whisper at mouse position
        whisperMesh.position.copy(intersectionPoint);

        // add whisper to array
        whispers.push(whisperMesh);

        // delete whisper after 'x' amount of seconds
        for (let object of whispers) {
            setInterval(() => {
                whispers.shift(); // remove 1st object in the array
                scene.remove(object); // remove mesh
            }, 10000)
        }
        console.log(whispers)
    } else {
        // don't create a whisper if leaf button is hit
        event.preventDefault()
    }

})



// *~ ANIMATE ~*
const clock = new THREE.Clock()
let previousElapsedTime = 0;

const tick = () => {

    // update time
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousElapsedTime;
    previousElapsedTime = elapsedTime;


    // update wind force
    for (let object of leaves) {
        setInterval(() => {
            object.body.applyForce(new CANNON.Vec3(-1.5, 0, 0), object.body.position);
        }, 7000)
    }

    // update physics world
    world.step(1 / 60, deltaTime, 3);


    // update createLeaf sphere positions
    for (let object of leaves) {
        object.mesh.position.copy(object.body.position)
    }


    // update whispers position
    // for (let i = 0; i < whispers.length; i++) {
    //     gsap.to(whispers[i].position, { duration: 1, delay: 1, x: 1 })
    //     gsap.to(whispers[i].position, { duration: 1, delay: 2, x: 0 })
    // }

    // update orbit controls
    controls.update()

    // update render
    renderer.render(scene, camera)

    // call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick();