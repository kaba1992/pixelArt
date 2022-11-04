// IMPORTS

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Perlin } from 'three-noise';
import OrbitControls from 'threejs-orbit-controls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';



// VARIABLES

let mixer, clock
clock = new THREE.Clock();
const canvas = document.querySelector('canvas.webgl')
canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true });
const perlin = new Perlin(Math.random())
const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 20;
//camera.position.y = 3
//camera.position.x = 3

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  preserveDrawingBuffer: true // for screenshot
});


window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const controls = new OrbitControls(camera, canvas);
controls.enabled = true;

controls.enableRotate = false;
controls.enableZoom = true;
controls.enablePan = false;
controls.rotateSpeed = 0.5;
controls.maxDistance = 1500;
controls.minDistance = 0;

// MODELS

const loaderCube = new THREE.CubeTextureLoader();
loaderCube.setPath('assets/textures/cube/');
const textureCube = loaderCube.load([
  'px.png', 'nx.png',
  'py.png', 'ny.png',
  'pz.png', 'nz.png'
]);




// LIGHTS

const light = new THREE.DirectionalLight(0xFFFFFF);
const ambientLight = new THREE.AmbientLight(0x404040);

const debounce = (func, delay) => {
  let debounceTimer
  return function () {
    const context = this
    const args = arguments
    clearTimeout(debounceTimer)
    debounceTimer
      = setTimeout(() => func.apply(context, args), delay)
  }
}

//color
const color = document.getElementById('color');

const columnInput = document.getElementById('columInput');
const range = document.getElementById('range');


let colums = 20;
let refimgContainer = document.querySelector('.refimgContainer');

const texture = new THREE.TextureLoader()
let refImg  // load image





const imgLoader = document.getElementById('file');
imgLoader.addEventListener('change', handleImage, false);

function handleImage(e) {
  let reader = new FileReader();
  reader.onload = function (event) {
    let img = new Image();
    img.src = event.target.result;
    refImg = texture.load(`${event.target.result} `);
    refImg.flipY = false;
    planeMesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, map: refImg, visible: true, transparent: true });
    range.addEventListener('input', debounce((e) => {
      planeMesh.material.opacity = e.target.value;
      console.log(e.target.value);
    }, 250));
    console.log(refImg);
    // refimgContainer.style.background = "url(" + event.target.result + ")";
    // refimgContainer.style.backgroundSize = "cover";
    // refimgContainer.style.backgroundPosition = "center";
    // refimgContainer.style.backgroundRepeat = "no-repeat";
    console.log(event.target.result);
  }
  reader.readAsDataURL(e.target.files[0]);
}

// set grid dimensions
columnInput.addEventListener('input', inputValue);
function inputValue(e) {
  colums = e.target.value;

  // refimgContainer.style.width = colums * 30.5 + "px";
  // refimgContainer.style.height = colums * 30.5 + "px";

  // destroy all highlightsMeshCloen contening in objects array
  objects.forEach((object) => {
    object.geometry.dispose();
    object.material.dispose();
    scene.remove(object);
  });
  //destroy planeMesh and remove grid
  planeMesh.geometry.dispose();
  planeMesh.material.dispose();
  scene.remove(planeMesh);
  scene.remove(grid);
  // create new grid and planeMesh
  planeMesh.geometry = new THREE.PlaneGeometry(colums, colums);
  grid = new THREE.GridHelper(colums, colums);
  grid.rotateX(Math.PI / 2);
  grid.position.z = 0.1;
  scene.add(grid);
  scene.add(planeMesh);

}

let highLightColor
let oldColorWrapper = document.querySelector('.oldColWrapper');
let oldColors
// console.log(oldColors);



// get old colors and set highLightColor
color.addEventListener('input', debounce(function (e) {
  if (!highLightColor) return
  highLightColor.set(e.target.value);
  let coloBlock = document.createElement('div');
  coloBlock.style.backgroundColor = e.target.value;
  oldColorWrapper.appendChild(coloBlock);
  coloBlock.classList.add('oldCol');
  oldColors = [...document.querySelectorAll('.oldCol')]

  if (oldColorWrapper.children.length >= 6) {
    oldColorWrapper.removeChild(oldColorWrapper.firstChild);
  }

  if (oldColors) {
    oldColors.forEach(color => {
      color.addEventListener('click', (e) => {
        highLightColor.set(e.target.style.backgroundColor);

      })
    })
  }

}, 250));





// Plateau

const planeMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(colums, colums),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
    visible: true,
    map: refImg,
    transparent: true,
  })
);
planeMesh.rotateX(Math.PI);
scene.add(planeMesh);


// Grid

let grid = new THREE.GridHelper(colums, colums);
grid.rotateX(Math.PI / 2);
grid.position.z = 0.1;
scene.add(grid);

// HighLightMesh
const highlightMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true
  })
);
highLightColor = highlightMesh.material.color;

highlightMesh.rotateX(Math.PI);
highlightMesh.position.set(0.5, 0.5, 0);
scene.add(highlightMesh);


// raycast
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

// make highlightMesh follow mouse by getting mouse position and intersecting with planeMesh
window.addEventListener('mousemove', function (e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mousePosition, camera);
  intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    const highlightPos = new THREE.Vector3().copy(intersects[0].point).floor().addScalar(0.5);
    // console.log(intersects[0].point.floor());
    highlightMesh.position.set(highlightPos.x, highlightPos.y, 0);
  }
});

const objects = [];

// clone highlightMesh and add it to the scene and objects array

window.addEventListener('mousedown', function () {
  const objectExist = objects.find(function (object) {
    return (object.position.x === highlightMesh.position.x)
      && (object.position.y === highlightMesh.position.y)
  });

  if (!objectExist) {
    if (intersects.length > 0) {
      const highLightClone = highlightMesh.clone();
      highLightClone.material = highlightMesh.material.clone();
      scene.add(highLightClone);
      objects.push(highLightClone);
      columnInput.removeEventListener('focus', (e) => { })
    }
  }
  else {
    scene.remove(objectExist);
    objects.splice(objects.indexOf(objectExist), 1);
  }
  console.log(scene.children.length);
});

// screen shot
const download = document.getElementById('btn');
const btnDownload = document.getElementById('btnDownload');
btnDownload.addEventListener('click', function (e) {
  // e.preventDefault();
  grid.visible = false;
  planeMesh.visible = false;
  highlightMesh.visible = false;
  setTimeout(() => {
    download.href = canvas.toDataURL('img/png');
    download.download = 'myImage.png';
    download.target = '_blank';
    download.click();
    grid.visible = true;
    planeMesh.visible = true;
    highlightMesh.visible = true;
  }, 250);
});



function animate(dt) {
  // composer.render();
  renderer.render(scene, camera);
  controls.update();

  renderer.antialias = true;
  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(window.devicePixelRatio);


  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  requestAnimationFrame(animate);
}
animate();

