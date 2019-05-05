import * as THREE from "three";
// var OrbitControls = require("three-orbit-controls")(THREE);
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

var renderer = null,
  scene = null,
  camera = null,
  orbitControls = null,
  headlight = null;

var shadows = true;
var addEnvironment = true;
var SHADOW_MAP_WIDTH = 2048,
  SHADOW_MAP_HEIGHT = 2048;

var container = document.getElementById("container");
createRenderer(container);
createScene(container);
initControls();
run();

function run() {
  requestAnimationFrame(function() {
    run();
  });

  //update camera controller
  orbitControls.update();

  // reposition the headlight to point at the model
  headlight.position.copy(camera.position);

  // render the scene
  renderer.render(scene, camera);
}

function loadModel() {
  var url = "../data/models/ball_chair/ball_chair.json";
  var loader = new THREE.ObjectLoader();
  loader.load(url, function(geometry, materials) {
    handleModelLoaded(geometry, materials);
  });
}

function handleModelLoaded(geometry, materials) {
  // create a new mesh with per-face materials
  var mesh = new THREE.Mesh(geometry, materials);

  // Turn on shadows
  mesh.castShadow = true;

  // Translate the object to the origin
  geometry.computeBoundBox();
  var center = new THREE.Vector3()
    .addVectors(geometry.boundingBox.max, geometry.boundingBox.min)
    .multiplyScalar(0.5);
  mesh.position.set(-center.x, 0, -center.z);
  scene.add(mesh);

  // Find a good camera position
  var front = geometry.boundingBox.max.clone().sub(center);
  camera.position.set(0, front.x, front.z * 5);

  if (orbitControls) orbitControls.center.copy(center);
}

function createRenderer(container) {
  renderer = new THREE.WebGLRenderer({ antialias: true });

  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  renderer.setSize(container.offsetWidth, container.offsetHeight);

  container.appendChild(renderer.domElement);
}

function createLights() {
  // Lighting up
  headlight = new THREE.DirectionalLight();
  headlight.position.set(0, 0, 1);
  scene.add(headlight);

  if (shadows) {
    var spot1 = new THREE.SpotLight(0xaaaaaa);
    spot1.position.set(0, 150, 200);
    scene.add(spot1);

    spot1.shadow.camera.near = 1;
    spot1.shadow.camera.far = 1024;
    spot1.castShadow = true;
    // spot1.shadowDarkness = 0.3;
    spot1.shadow.bias = 0.0001;
    spot1.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spot1.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
  }
}

function createEnvironment() {
  // floor
  var floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    // ambient: 0x555555,
    // shading: THREE.SmoothShading
    flatShading: true
  });
  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1024, 1024),
    floorMaterial
  );

  if (shadows) {
    floor.receiveShadow = true;
  }

  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
}

function createScene(container) {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    container.offsetWidth / container.offsetHeight,
    1,
    4000
  );
  camera.position.z = 10;
  scene.add(camera);

  // lights
  createLights();

  //Ground
  if (addEnvironment) createEnvironment();

  // model
  loadModel();
}

function initControls() {
  orbitControls = new OrbitControls(camera, renderer.domElement);
}
