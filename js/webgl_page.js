import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@2.4.0';

export function initMountain() {

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
	  70,
	  window.innerWidth / window.innerHeight,
	  0.1,
	  100);
  // camera.position.set(8, 12, 11);
  // camera.lookAt(6, 11, 0);

  // const renderer = new THREE.WebGLRenderer({ alpha: true });
  // renderer.setSize(window.innerWidth, window.innerHeight);
	// // renderer.setSize(container.clientWidth, container.clientHeight);
  // document.body.appendChild(renderer.domElement);
	// container.appendChild(renderer.domElement);
	
	const horizontalScroll = document.getElementById("horizontal-scroll"); //grab the container element
	horizontalScroll.addEventListener('scroll', () => {
	  const sectionIndex = horizontalScroll.scrollLeft / window.innerWidth;
	  const clampedIndex = Math.min(cameraStates.length - 1, Math.max(0, sectionIndex));
	  currentSection = clampedIndex;
	});
	const container = document.getElementById("webgl-container");
	const renderer = new THREE.WebGLRenderer({ alpha: true }); //create renderer
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x000000, 0);
	container.appendChild(renderer.domElement); //append to the container

  // PlaneGeometry
  const width = 100;
  const height = 100;
  const segments = 1000;
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);

  const position = geometry.attributes.position;
	const peaks = [
		{x:25, y:5, height:10},
		{x:5, y:15, height:12},
		{x:5, y:15, height:7},
		{x:-10, y:-5, height:11},
		{x:-20, y:30, height:11},
		{x:-2, y:9, height:14},
		{x:-2, y:20, height:10},
		{x:-10, y:20, height:10},
		{x:20, y:20, height:15},
		{x:-15, y:15, height:5},
		{x:-30, y:5, height:10},
		{x:-30, y:20, height:10},
		{x:-30, y:15, height:7},
	];

	const simplex = new SimplexNoise();
	const noiseScale = 0.4;

	// const pivot = new THREE.Object3D();
	// pivot.position.set(10,10,0);
	// scene.add(pivot);
	// pivot.add(camera);
	// camera.position.set(0, 20, 40);
	// camera.lookAt(pivot.position);

  // Generate mountain heights
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);

    // radial distance from center
    // const r = Math.sqrt(x * x + y * y);
	let heightValue = 0;
	for (const peak of peaks) {
		const dx = x - peak.x;
		const dy = y - peak.y;
		const r = Math.sqrt(dx * dx + dy * dy);
		const r2 = dx*dx + dy*dy;
		const noiseValue = simplex.noise2D(x * noiseScale, y * noiseScale) * 0.06;
		// heightValue += Math.max(0,peak.height-r) + Math.random()*0.3;
		// heightValue += peak.height * Math.exp(-r2 / (2 * (peak.height*0.4)**2)) + noiseValue;
		heightValue += Math.max(0,peak.height-r) + noiseValue;
		// heightValue = Math.max(0,peak.height-r) + noise.noise2D(x
	}
	// heightValue = Math.max(0,heightValue); 
	position.setZ(i,heightValue);
	}

    // // height function: taller at center, tapering off at edges
    // const heightValue = Math.max(0, 8 - r) + Math.random() * 0.7; // peak ~4, small noise
    // position.setZ(i, heightValue);
  // }
	position.needsUpdate = true;
	geometry.computeVertexNormals();

	const textureLoader = new THREE.TextureLoader();
	const iceColor = textureLoader.load('js/textures/Snow/Snow011_2K-JPG_AmbientOcclusion.jpg');
	const snowColor = textureLoader.load('js/textures/Snow/Snow011_2K-JPG_Color.jpg');
	const snowNormal = textureLoader.load('js/textures/Snow/Snow011_2K-JPG_NormalGL.jpg');
	const snowRough = textureLoader.load('js/textures/Snow/Snow011_2K-JPG_Roughness.jpg');
	const snowDisp = textureLoader.load('js/textures/Snow/Snow011_2K-JPG_Displacement.jpg');
	const rockColor = textureLoader.load('js/textures/GrassRock/rocky_terrain_diff_4k.jpg');
	const grassColor = textureLoader.load('js/textures/Grass/rocky_terrain_02_diff_4k.jpg');
	const grassNormal = textureLoader.load('js/textures/Grass/rocky_terrain_02_nor_gl_4k.exr');
	const grassDisp = textureLoader.load('js/textures/Grass/rocky_terrain_02_disp_4k.png');
	const grassRough = textureLoader.load('js/textures/Grass/rocky_terrain_02_rough_4k.exr');
	const sandrockColor = textureLoader.load('js/textures/SandRocks/coast_sand_rocks_02_diff_4k.jpg');
	const snow2Color = textureLoader.load('js/textures/Snow2/Snow010A_8K-JPG_AmbientOcclusion.jpg');

	snowColor.wrapS = snowColor.wrapT = THREE.RepeatWrapping;
	snow2Color.wrapS = snow2Color.wrapT = THREE.RepeatWrapping;
	iceColor.wrapS = iceColor.wrapT = THREE.RepeatWrapping;
	rockColor.wrapS = rockColor.wrapT = THREE.RepeatWrapping;
	grassColor.wrapS = grassColor.wrapT = THREE.RepeatWrapping;
	sandrockColor.wrapS = sandrockColor.wrapT = THREE.RepeatWrapping;
	
	const mountainUniforms = {
		rockTex: { value: rockColor },
		snowTex: { value: snowColor },
		snow2Tex: { value: snow2Color },
		iceTex: { value: iceColor },
		grassTex: { value: grassColor },
		sandrockTex: { value: sandrockColor },
		snowNormalTex: { value: snowNormal },
		grassNormalTex: { value: grassNormal },
		snowRoughTex: { value: snowRough },
		grassRoughTex: { value: grassRough },
		snowDispTex: { value: snowDisp },
		grassDispTex: { value: grassDisp },

		snowRepeat: { value: new THREE.Vector2(30,25) },
		iceRepeat: { value: new THREE.Vector2(20,30) },
		rockRepeat: { value: new THREE.Vector2(20,20) },
		sandrockRepeat: { value: new THREE.Vector2(20,20) },
		grassRepeat: { value: new THREE.Vector2(20,20) },
	};

	const mountainMaterial = new THREE.ShaderMaterial({
		uniforms: mountainUniforms,
	  vertexShader: `
	    varying float vHeight;
	    out vec3 vPosition;
	    out vec2 vUv;
	    void main() {
	      vPosition = position;
	      vUv = uv;
	      vHeight = position.z;
	      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	    }
	  `,
	  fragmentShader: `
	    uniform sampler2D rockTex;
	    uniform sampler2D sandrockTex;
	    uniform sampler2D snowTex;
	    uniform sampler2D snow2Tex;
	    uniform sampler2D iceTex;
	    uniform sampler2D grassTex;
	    uniform vec2 rockRepeat;
	    uniform vec2 sandrockRepeat;
	    uniform vec2 snowRepeat;
	    uniform vec2 iceRepeat;
	    uniform vec2 grassRepeat;
	    uniform sampler2D snowNormalTex;
	    uniform sampler2D grassNormalTex;
	    uniform sampler2D snowRoughTex;
	    uniform sampler2D grassRoughTex;
	    uniform sampler2D snowDispTex;
	    uniform sampler2D grassDispTex;
	    uniform float time;

	    varying float vHeight;
	    in vec3 vPosition;
	    in vec2 vUv;

	    void main() {
	      float blend1 = smoothstep(0.0, 2.0, vHeight);
	      float blend2 = smoothstep(6.0, 12.0, vHeight);

	      vec3 snowC = texture2D(snow2Tex, vUv * snowRepeat).rgb;
	      vec3 iceC = texture2D(iceTex, vUv * iceRepeat).rgb;
	      vec3 sandrockC = texture2D(sandrockTex, vUv * sandrockRepeat).rgb;

	      vec3 color = mix(sandrockC,snowC,blend1);
	      vec3 baseColor = mix(color,iceC,blend2);

	      gl_FragColor = vec4(baseColor, 1.0);
	    }
	  `,
	});
  const mountainMesh = new THREE.Mesh(geometry, mountainMaterial);
  mountainMesh.rotation.x = -Math.PI / 2;
  scene.add(mountainMesh);

	// Load the cloud texture
	const cloudTexture = new THREE.TextureLoader().load('js/textures/Cloud/08.png');

	// Create the cloud material
	const cloudMaterial = new THREE.MeshLambertMaterial({
	    map: cloudTexture,
	    transparent: true,   // important for blending
	    opacity: 0.99,
	    depthWrite: false,
		side: THREE.DoubleSide
	});

	const clouds = [];
	const cloudPivots = [];

	const cloudPositions = [
	    { x: 0, y: 16, z: -30},
	    { x: -15, y: 4, z: -15},
	    { x: -30, y: 8, z: -1 },
	    { x: 20, y: 10, z: 4 },
	    { x: -10, y: 6, z: 5 },
	    { x: 2, y: 8, z: 7},
	    { x: 15, y: 2, z: 2},
	    { x: 5, y: 5, z: -35},
	    { x: 20, y: 10, z: -20},
	    { x: 25, y: 5, z: 10},
	];

	// for (let i = 0; i < 3; i++) {
	cloudPositions.forEach(pos => {
	    const cloudGeo = new THREE.PlaneGeometry(30, 20);
	    const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);

	    const pivot = new THREE.Object3D();

	    scene.add(pivot);

		cloud.position.set(pos.x,pos.y,pos.z);

	    pivot.add(cloud);
	    clouds.push(cloud);
	    cloudPivots.push(pivot);
	});
	
	// Animate subtle drift
	function animateClouds(deltaTime) {
	    // clouds.forEach(c => {
		// c.position.x += deltaTime * 0.3; // slower than camera movement
	    // });
	}

	// Lighting
	const light = new THREE.DirectionalLight(0xFFFFFF,1.5);
	light.position.set(-5, 1000, 50);
	scene.add(light);

	const ambient = new THREE.AmbientLight(0xFFFFFF,10);
	scene.add(ambient);

	//Pivoting and camera movement
	const cameraStates = [
	  { pivot: new THREE.Vector3(-1, 8, -10), offset: new THREE.Vector3(10, 5, 30) }, // section 1
	  { pivot: new THREE.Vector3(-1, 8, -10), offset: new THREE.Vector3(35, 5, 5) }, // section 2
	  { pivot: new THREE.Vector3(-1, 8, -10), offset: new THREE.Vector3(25, 8, -30) }, // section 3
	  { pivot: new THREE.Vector3(-1, 8, -10), offset: new THREE.Vector3(-15, 10, 25) }, // section 3
	  { pivot: new THREE.Vector3(-1, 8, -10), offset: new THREE.Vector3(0, 15, 35) }, // section 4
	];

	let currentSection = 0;
	window.addEventListener('scroll', () => {
	  const sectionIndex = Math.round(window.scrollY / window.innerHeight);
	  currentSection = Math.min(cameraStates.length - 1, Math.max(0, sectionIndex));
	});
	
	const clock = new THREE.Clock();
	const pivot = new THREE.Vector3(-1,8,-10);

	camera.position.set(pivot.x+10,pivot.y+5,pivot.z+30);
	camera.lookAt(pivot);

	let dx = camera.position.x - pivot.x;
	let dz = camera.position.z - pivot.z;
	let radius = Math.sqrt(dx*dx + dz*dz);   // distance from pivot in x–z
	let angle = Math.atan2(dz, dx);

	let targetRotation = angle;

	// // Touch
	// window.addEventListener('touchmove', (event) => {
	//   event.preventDefault(); // stop page from scrolling
	//   const touch = event.touches[0];
	//   targetRotation = ((touch.clientX / window.innerWidth) - 0) * Math.PI / 1;
	// }, { passive: false });
	
let touchStartX = 0;

horizontalScroll.addEventListener('touchstart', (event) => {
  touchStartX = event.touches[0].clientX;
}, { passive: true });

horizontalScroll.addEventListener('touchmove', (event) => {
	event.preventDefault();
  const touchX = event.touches[0].clientX;
  const deltaX = touchStartX - touchX;

  // move the scroll container by the delta
	const sensitivity = 0.2;
	const fractionDrag = (deltaX / window.innerWidth) / sensitivity;

	currentSection += fractionDrag;
	currentSection = Math.max(0,Math.min(cameraStates.length - 1, currentSection));

  touchStartX = touchX;
}, { passive: false });

function animate() {
  requestAnimationFrame(animate);

const delta = clock.getDelta();
  const lerpFactor = 0.05;
  const prevSection = Math.floor(currentSection);
  const nextSection = Math.ceil(currentSection);
  const t = currentSection % 1; // interpolation factor between sections

  const prevState = cameraStates[prevSection];
  const nextState = cameraStates[nextSection];

  const desiredPos = new THREE.Vector3().lerpVectors(prevState.offset.clone().add(prevState.pivot), 
                                                     nextState.offset.clone().add(nextState.pivot), 
                                                     t);
  camera.position.lerp(desiredPos, lerpFactor);

  const lookTarget = new THREE.Vector3().lerpVectors(prevState.pivot, nextState.pivot, t);
  camera.lookAt(lookTarget);

clouds.forEach(cloud => {             
        cloud.lookAt(camera.position);
});
animateClouds(delta);


  renderer.render(scene, camera);
}
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
	// camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
	// renderer.setSize(container.clientWidth,container.clientHeight);
  });
}

initMountain();

