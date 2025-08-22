import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@2.4.0';

export function initMountain() {

	// const container = document.getElementById("webgl-background");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
	  70,
	  window.innerWidth / window.innerHeight,
	  0.1,
	  100);
  camera.position.set(10, 15, 20);
  camera.lookAt(5, 10, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
	// renderer.setSize(container.clientWidth, container.clientHeight);
  document.body.appendChild(renderer.domElement);
	// container.appendChild(renderer.domElement);

  // PlaneGeometry
  const width = 100;
  const height = 100;
  const segments = 600;
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
	const grassNormal = textureLoader.load('js/textures/Grass/rocky_terrain_02_nor_gl_4k.jpg');
	const grassDisp = textureLoader.load('js/textures/Grass/rocky_terrain_02_disp_4k.jpg');
	const grassRough = textureLoader.load('js/textures/Grass/rocky_terrain_02_rough_4k.jpg');
	const sandrockColor = textureLoader.load('js/textures/SandRocks/coast_sand_rocks_02_diff_4k.jpg');
	// const cloudColor = textureLoader.load('js/textures/Cloud/Fabric081C_4K-JPG_Color.jpg');

	snowColor.wrapS = snowColor.wrapT = THREE.RepeatWrapping;
	iceColor.wrapS = iceColor.wrapT = THREE.RepeatWrapping;
	rockColor.wrapS = rockColor.wrapT = THREE.RepeatWrapping;
	grassColor.wrapS = grassColor.wrapT = THREE.RepeatWrapping;
	sandrockColor.wrapS = sandrockColor.wrapT = THREE.RepeatWrapping;
	// cloudColor.wrapS = cloudColor.wrapT = THREE.RepeatWrapping;
	
	// const cloudPos = new THREE.Vector2(0,0);
	
	const mountainUniforms = {
		rockTex: { value: rockColor },
		snowTex: { value: snowColor },
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
	    uniform sampler2D iceTex;
	    uniform sampler2D grassTex;
	    uniform sampler2D cloudTex;
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
	      float blend1 = smoothstep(0.0, 7.0, vHeight);
	      float blend2 = smoothstep(4.0, 12.0, vHeight);

	      vec3 snowC = texture2D(snowTex, vUv * snowRepeat).rgb;
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
	    // { x: 14, y: 16, z: -10},
	    { x: -30, y: 8, z: -1 },
	    // { x: 0, y: 16, z: 2 },
	    { x: 20, y: 10, z: 4 },
	    { x: -10, y: 6, z: 5 },
	    { x: 2, y: 8, z: 7},
	    { x: 15, y: 2, z: 2},
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

let targetRotation = 0;
window.addEventListener('mousemove', (event) => {
  // map mouseX to range -1 to 1
  targetRotation = ((event.clientX / window.innerWidth) - 0.5) * Math.PI / 2; 
});

	const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
	  const delta = clock.getDelta();

	mountainMesh.rotation.z += (targetRotation - mountainMesh.rotation.z) * 0.1;

	cloudPivots.forEach(pivot => {
		pivot.rotation.y += (targetRotation - pivot.rotation.y) * 0.1});
	clouds.forEach(cloud => {
		cloud.lookAt(camera.position);
	});

	// });
	// cloudPivots.forEach(pivot => {
	// 	pivot.rotation.y += 0.001;
	// });
	// cloudPivots.rotation.y += (targetRotation - cloudPivots.rotation.y) * 0.1;

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

