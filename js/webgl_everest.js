import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@2.4.0';
import { EXRLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/EXRLoader.js';

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

const loader = new THREE.TextureLoader();
loader.load('js/textures/Terrains/everest_heightmap.png', (texture) => {
    texture.minFilter = THREE.LinearFilter; // avoid mipmap artifacts
    createTerrainFromHeightmap(texture);
});

function createTerrainFromHeightmap(texture) {
    const image = texture.image;

    // Draw the image onto a canvas
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);

    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data; // Uint8ClampedArray, RGBA values

    const width = 200;
    const height = 200;
    const segments = 512;
    const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
    const position = geometry.attributes.position;

    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const z = position.getY(i);

        const u = (x + width/2) / width;
        const v = (z + height/2) / height;

        const px = Math.floor(u * (image.width - 1));
        const py = Math.floor(v * (image.height - 1));

        const idx = (py * image.width + px) * 4; // RGBA
        const hval = data[idx] / 255; // use red channel normalized 0–1

        position.setZ(i, hval * 10); // scale terrain height
    }

    geometry.computeVertexNormals();



  // // PlaneGeometry
  // const width = 100;
  // const height = 100;
  // const segments = 600;
  // const geometry = new THREE.PlaneGeometry(width, height, segments, segments);

	// // position.needsUpdate = true;
	// geometry.computeVertexNormals();

	const textureLoader = new THREE.TextureLoader();
	const snowColor = textureLoader.load('js/textures/Snow/Snow011_2K-JPG_Color.jpg');
	const snowAO = textureLoader.load('js/textures/Snow/Snow011_2K-JPG_AmbientOcclusion.jpg');
	// snowAO.encoding = THREE.LinearEncoding;
	const snowNormal = textureLoader.load('js/textures/Snow/Snow011_2K-JPG_NormalGL.jpg');
	snowNormal.encoding = THREE.LinearEncoding;
	const snowRough = textureLoader.load('js/textures/Snow/Snow011_2K-JPG_Roughness.jpg');
	snowRough.encoding = THREE.LinearEncoding;
	const snowDisp = textureLoader.load('js/textures/Snow/Snow011_2K-JPG_Displacement.jpg');
	snowDisp.encoding = THREE.LinearEncoding;
	const rockColor = textureLoader.load('js/textures/GrassRock/rocky_terrain_diff_4k.jpg');
	const grassColor = textureLoader.load('js/textures/Grass/rocky_terrain_02_diff_4k.jpg');
	const grassNormal = textureLoader.load('js/textures/Grass/rocky_terrain_02_nor_gl_4k.exr');
	grassNormal.encoding = THREE.LinearEncoding;
	const grassDisp = textureLoader.load('js/textures/Grass/rocky_terrain_02_disp_4k.png');
	grassDisp.encoding = THREE.LinearEncoding;
	const grassRough = textureLoader.load('js/textures/Grass/rocky_terrain_02_rough_4k.exr');
	grassRough.encoding = THREE.LinearEncoding;
	const sandrockColor = textureLoader.load('js/textures/SandRocks/coast_sand_rocks_02_diff_4k.jpg');
	const sandrockDisp = textureLoader.load('js/textures/SandRocks/coast_sand_rocks_02_disp_4k.png');
	sandrockDisp.encoding = THREE.LinearEncoding;
	const sandrockRough = textureLoader.load('js/textures/SandRocks/coast_sand_rocks_02_rough_4k.exr');
	sandrockRough.encoding = THREE.LinearEncoding;
	const sandrockNormal = textureLoader.load('js/textures/SandRocks/coast_sand_rocks_02_nor_gl_4k.exr');
	sandrockNormal.encoding = THREE.LinearEncoding;
	const snow2Color= textureLoader.load('js/textures/Snow2/Snow010A_4K-JPG_Color.jpg');
	// snow2Color.encoding = THREE.LinearEncoding;
	const snow2AO = textureLoader.load('js/textures/Snow2/Snow010A_4K-JPG_AmbientOcclusion.jpg');
	// snow2AO.encoding = THREE.LinearEncoding;
	const snow2Normal = textureLoader.load('js/textures/Snow2/Snow010A_4K-JPG_NormalGL.jpg');
	snow2Normal.encoding = THREE.LinearEncoding;
	const snow2Rough = textureLoader.load('js/textures/Snow2/Snow010A_4K-JPG_Roughness.jpg');
	snow2Rough.encoding = THREE.LinearEncoding;
	const snow2Disp = textureLoader.load('js/textures/Snow2/Snow010A_4K-JPG_Displacement.jpg');
	snow2Disp.encoding = THREE.LinearEncoding;
	const snow3Color= textureLoader.load('js/textures/Snow3/Snow003_4K-JPG_Color.jpg');
	const snow5Color= textureLoader.load('js/textures/Snow5/Snow005_4K-JPG_Color.jpg');

	snowColor.wrapS = snowColor.wrapT = THREE.RepeatWrapping;
	snow2Color.wrapS = snow2Color.wrapT = THREE.RepeatWrapping;
	snowAO.wrapS = snowAO.wrapT = THREE.RepeatWrapping;
	rockColor.wrapS = rockColor.wrapT = THREE.RepeatWrapping;
	grassColor.wrapS = grassColor.wrapT = THREE.RepeatWrapping;
	sandrockColor.wrapS = sandrockColor.wrapT = THREE.RepeatWrapping;
	
	const mountainUniforms = {
		rockTex: { value: rockColor },
		snowTex: { value: snowColor },
		snow2Tex: { value: snow2Color },
		grassTex: { value: grassColor },
		sandrockTex: { value: sandrockColor },
		snow3Tex: {value: snow3Color },
		snow5Tex: {value: snow5Color },

		snowAOTex: { value: snowAO },
		snow2AOTex: { value: snow2AO },

		snowNormalTex: { value: snowNormal },
		grassNormalTex: { value: grassNormal },
		sandrockNormalTex: { value: sandrockNormal },

		snowRoughTex: { value: snowRough },
		grassRoughTex: { value: grassRough },
		sandrockRoughTex: { value: sandrockRough },

		snowDispTex: { value: snowDisp },
		grassDispTex: { value: grassDisp },
		sandrockDispTex: { value: sandrockDisp },

		snowRepeat: { value: new THREE.Vector2(30,50) },
		snowAORepeat: { value: new THREE.Vector2(20,30) },
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
	    // uniform float displacementScale;
	    // uniform sampler2D rockDispTex;
		// uniform sampler2D snowDispTex;
		// uniform sampler2D snowAODispTex;
	    void main() {
		// vUv = uv;

		// float rockDisp = texture2D(rockDispTex, uv).r;
		// float snowDisp = texture2D(snowDispTex, uv).r;
		// float snowAODisp = texture2D(snowAODispTex, uv).r;

		// // Blend them based on height
		// float heightBlend1 = smoothstep(0.0, 2.0, position.z);
		// float heightBlend2 = smoothstep(6.0, 12.0, position.z);

		// float totalDisp = mix(rockDisp, snowDisp, heightBlend1);
		// totalDisp = mix(totalDisp, snowAODisp, heightBlend2);

		// vec3 displacedPosition = position + normal * totalDisp * displacementScale;

		// vHeight = displacedPosition.z; // or y if Y is up
		// vPosition = displacedPosition;

		// gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);

	      vPosition = position;
	      vUv = uv;
	      vHeight = position.y;
	      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	    }
	  `,
	  fragmentShader: `
	    uniform sampler2D rockTex;
	    uniform sampler2D sandrockTex;
	    uniform sampler2D snowTex;
	    uniform sampler2D snow2Tex;
	    uniform sampler2D snowAOTex;
	    uniform sampler2D snow2AOTex;
	    uniform sampler2D grassTex;
	    uniform sampler2D snow3Tex;
	    uniform sampler2D snow5Tex;
	    uniform vec2 rockRepeat;
	    uniform vec2 sandrockRepeat;
	    uniform vec2 snowRepeat;
	    uniform vec2 snowAORepeat;
	    uniform vec2 grassRepeat;
	    uniform sampler2D snowNormalTex;
	    uniform sampler2D snow2NormalTex;
	    uniform sampler2D grassNormalTex;
	    uniform sampler2D sandrockNormalTex;
	    uniform sampler2D snowRoughTex;
	    uniform sampler2D snow2RoughTex;
	    uniform sampler2D grassRoughTex;
	    uniform sampler2D sandrockRoughTex;
	    uniform sampler2D snowDispTex;
	    uniform sampler2D snow2DispTex;
	    uniform sampler2D grassDispTex;
	    uniform sampler2D sandrockDispTex;
	    uniform float time;

	    varying float vHeight;
	    in vec3 vPosition;
	    in vec2 vUv;

	    void main() {
	      float blend1 = smoothstep(0.0, 4.0, vHeight);
	      float blend2 = smoothstep(4.0, 40.0, vHeight);

	      vec3 snowC = texture2D(snowTex, vUv * snowRepeat).rgb;
	     vec3 snow2C = texture2D(snow2Tex, vUv * snowRepeat).rgb;
	     vec3 snow3C = texture2D(snow3Tex, vUv * snowRepeat).rgb;
	     vec3 snow5C = texture2D(snow5Tex, vUv * snowRepeat).rgb;
	     vec3 snowAOC = texture2D(snowAOTex, vUv * snowAORepeat).rgb;
	     vec3 snow2AOC = texture2D(snow2AOTex, vUv * snowAORepeat).rgb;
	     vec3 sandrockC = texture2D(sandrockTex, vUv * sandrockRepeat).rgb;

	//	//Normal, Roughness, Ambient Occlusion
	//      vec3 lightDir = normalize(vec3(1.0,1.0,1.0));
	//      vec3 snowN = texture2D(snowNormalTex, vUv * snowRepeat).rgb;
	//      vec3 snow2N = texture2D(snow2NormalTex, vUv * snowRepeat).rgb;
	//      vec3 sandrockN = texture2D(sandrockNormalTex, vUv * sandrockRepeat).rgb;
	//      vec3 snowNNorm = normalize(snowN * 2.0 - 1.0);
	//      vec3 snow2NNorm = normalize(snow2N * 2.0 - 1.0);
	//      vec3 sandrockNNorm = normalize(sandrockN * 2.0 - 1.0);
	//      float snowR = texture2D(snowRoughTex, vUv * snowRepeat).r;
	//      float snow2R = texture2D(snow2RoughTex, vUv * snowRepeat).r;
	//      float sandrockR = texture2D(sandrockRoughTex, vUv * sandrockRepeat).r;
	//      float snowA = texture2D(snowAOTex, vUv * snowRepeat).r;
	//      float snow2A = texture2D(snow2AOTex, vUv * snowRepeat).r;
	//      float snowDiff = max(dot(snowNNorm, lightDir), 0.0);
	//      float snow2Diff = max(dot(snow2NNorm, lightDir), 0.0);
	//      float sandrockDiff = max(dot(sandrockNNorm, lightDir), 0.0);
	//      vec3 finalSnowC = snowC * snowDiff * snowA;
	//      vec3 finalSnow2C = snow2C * snow2Diff * snow2A;
	//      vec3 finalSandrockC = sandrockC * sandrockDiff;

	     vec3 baseColor = mix(sandrockC,snowAOC,blend1);
	     vec3 allColor = mix(baseColor,snowAOC,blend2);

	     gl_FragColor = vec4(allColor, 1.0);
	   }
	 `,
	});
  // const mountainMesh = new THREE.Mesh(geometry, mountainMaterial);
  // mountainMesh.rotation.x = -Math.PI / 2;
  // scene.add(mountainMesh);
    // const mesh = new THREE.Mesh(geometry, mountainMaterial);
    // scene.add(mesh);
// });
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI/2;

    scene.add(mesh);
}

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

	const ambient = new THREE.AmbientLight(0xFFFFFF,0.3);
	scene.add(ambient);

	//Pivoting and camera movement
	const cameraStates = [
	  { pivot: new THREE.Vector3(-1, 8, -10), offset: new THREE.Vector3(-30, 5, 5) }, // section 4
	  { pivot: new THREE.Vector3(-1, 8, -10), offset: new THREE.Vector3(0, 12, 30) }, // section 4
	  { pivot: new THREE.Vector3(-1, 8, -10), offset: new THREE.Vector3(30, 5, 10) }, // section 1
	  { pivot: new THREE.Vector3(-1, 8, -10), offset: new THREE.Vector3(20, 5, -25) }, // section 2
	  { pivot: new THREE.Vector3(-1, 8, -10), offset: new THREE.Vector3(-5, 8, -35) }, // section 2
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

