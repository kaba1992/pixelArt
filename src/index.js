// IMPORTS

import * as THREE from 'three';
import OrbitControls from 'threejs-orbit-controls';




// VARIABLES

let mixer, clock
clock = new THREE.Clock();
const canvas = document.querySelector('canvas.webgl')
canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true });
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

  // cover(refImg, camera.aspect);

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
const rangeValue = document.getElementById('rangeValue');


let colums = 20;


const texture = new THREE.TextureLoader()
let refImg  // load image

// Editors
const drawBtn = document.querySelector('.draw');
const deleteBtn = document.querySelector('.delete');
let isDrawing = false;
let isDeleting = false;

drawBtn.addEventListener('click', () => {
  isDrawing = true;
  isDeleting = false;
  document.body.style.cursor = 'url(./assets/images/brush-cursor.png)4 12, auto';
  highlightMesh.visible = true;


});
deleteBtn.addEventListener('click', () => {
  isDrawing = false;
  isDeleting = true;
  document.body.style.cursor = 'url(./assets/images/eraser-cursor.png)4 12, auto';
  highlightMesh.visible = false;

});



const imgLoader = document.getElementById('file');
imgLoader.addEventListener('change', handleImage, false);

function handleImage(e) {
  let reader = new FileReader();
  reader.onload = function (event) {
    let img = new Image();
    img.src = event.target.result;
    refImg = texture.load(`${event.target.result} `);

    // refImg.matrixAutoUpdate = false;



    refImg.flipY = false;
    planeMesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, map: refImg, visible: true, transparent: true });
    range.addEventListener('input', debounce((e) => {
      planeMesh.material.opacity = e.target.value;
      rangeValue.innerHTML = e.target.value;

    }, 250));
    console.log(event.target.result);
  }
  reader.readAsDataURL(e.target.files[0]);
}

// function cover(texture,aspect) {
//   let imageAspect = texture.image.width / texture.image.height;

// 	if ( aspect < imageAspect ) {

// 			texture.matrix.setUvTransform( 0, 0, aspect / imageAspect, 1, 0, 0.5, 0.5 );

// 	} else {

// 			texture.matrix.setUvTransform( 0, 0, 1, imageAspect / aspect, 0, 0.5, 0.5 );

// 	}

// }

// set grid dimensions
columnInput.addEventListener('input', inputValue);
function inputValue(e) {
  // colums = e.target.value % 2 === 0 ? e.target.value : parseInt(e.target.value) + 1;

  colums = e.target.value;

  // destroy all highlightsMeshCloen contening in objects array
  objects.forEach((object) => {
    object.geometry.dispose();
    object.material.dispose();
    scene.remove(object);
  });
  // clear objects array
  objects = [];
  //destroy planeMesh and remove grid
  planeMesh.geometry.dispose();
  planeMesh.material.dispose();
  scene.remove(planeMesh);
  scene.remove(grid);
  // create new grid and planeMesh
  setTimeout(() => {
    planeMesh.geometry = new THREE.PlaneGeometry(colums, colums);
    grid = new THREE.GridHelper(colums, colums);
    grid.rotateX(Math.PI / 2);
    grid.position.z = 0.1;
    scene.add(grid);
    scene.add(planeMesh);
  }, 250);
  console.log(planeMesh);

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
// console.log(planeMesh);

// Grid

let grid = new THREE.GridHelper(colums, colums);
grid.rotateX(Math.PI / 2);
grid.position.z = 0.1;
scene.add(grid);
// console.log(grid);

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
    highlightMesh.position.set(highlightPos.x, highlightPos.y, 0);
  }
});

let objects = [];
console.log(objects);
// clone highlightMesh and add it to the scene and objects array
let mousemove = true;
let mouseDown = false;

window.addEventListener('mousedown', function () {

  mouseDown = true;
  OnMouseMove()
  window.addEventListener('mousemove', OnMouseMove);
  console.log(scene.children.length);


});


function OnMouseMove() {

  const objectExist = objects.find(function (object) {
    return (object.position.x === highlightMesh.position.x)
      && (object.position.y === highlightMesh.position.y)
  });
  if (mouseDown) {

    if (!objectExist && isDrawing) {
      drawing();
    }
    else  {
      deleting();
      if (isDrawing) {
        objectExist.material.color.set(highLightColor);
    
      }
    }
  }
}
function drawing() {

  if (intersects.length > 0) {
    const highLightClone = highlightMesh.clone();
    highLightClone.material = highlightMesh.material.clone();
    scene.add(highLightClone);
    objects.push(highLightClone);

  }
}


function deleting() {
  if (isDeleting) {
    objects.forEach((object, index) => {
      if ((object.position.x === highlightMesh.position.x)
        && (object.position.y === highlightMesh.position.y)) {
        object.geometry.dispose();
        object.material.dispose();
        scene.remove(object);
        objects.splice(index, 1);
      }
    
    });
  }

}


window.addEventListener('mouseup', function () {
  window.removeEventListener('mousemove', OnMouseMove);
  mouseDown = false;
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
  }, 500);
});



function animate(dt) {
  // composer.render();
  renderer.render(scene, camera);
  controls.update();

  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(window.devicePixelRatio);

  requestAnimationFrame(animate);
}
animate();
