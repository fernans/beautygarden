import * as THREE from "three";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import config from "./config.json";

export enum paintModes {
  None = 0,
  Floor,
  Plant,
  Furniture,
}
export default class Scene3DControl {
  constructor() {}

  public scene!: THREE.Scene;
  private WIDTH!: number;
  private HEIGHT!: number;
  private CAMERA!: THREE.PerspectiveCamera;
  private CANVAS!: HTMLCanvasElement;

  private controls!: OrbitControls;

  private floorTilesContainer!: THREE.Scene;
  private floorTiles: THREE.Mesh[] = [];
  private floorMaterials!: THREE.MeshPhongMaterial[];

  private objectsContainer!: THREE.Scene;
  private objects: THREE.Scene[] = [];
  private plantsModels!: THREE.Scene[];
  private furnitureModels!: THREE.Scene[];

  private cursorTile!: THREE.Mesh;
  private raycaster!: THREE.Raycaster;
  private picketTile?: THREE.Object3D = undefined;

  currentPaintMode: paintModes = paintModes.None;
  currentPaintIndex: number = -1;

  async init(
    WIDTH: number,
    HEIGHT: number,
    CAMERA: THREE.PerspectiveCamera,
    CANVAS: HTMLCanvasElement,
  ) {
    this.WIDTH = WIDTH;
    this.HEIGHT = HEIGHT;
    this.CAMERA = CAMERA;
    this.CANVAS = CANVAS;

    this.controls = new OrbitControls(this.CAMERA, this.CANVAS);
    this.controls.maxPolarAngle = Math.PI * 0.45;
    this.controls.minAzimuthAngle = -Math.PI / 2;
    this.controls.maxAzimuthAngle = Math.PI / 2;
    this.controls.maxDistance = 250;
    this.controls.minDistance = 100;
    this.CAMERA.position.set(0, 50, 100);
    this.CAMERA.lookAt(0, 0, 0);

    this.scene = new THREE.Scene();
    const objLoader = new GLTFLoader();

    // environtment
    this.scene.background = new THREE.Color(0xdfffff);

    // ligths
    const light = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 0.1);
    this.scene.add(light);
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(0, 10, 0);
    sun.target.position.set(0, 0, 0);
    this.scene.add(sun);
    this.scene.add(sun.target);

    // materials
    const loader: THREE.TextureLoader = new THREE.TextureLoader();
    this.floorMaterials = [];
    for (let i = 0; i < config.floor.length; i++) {
      const floorTileTexture: THREE.Texture = loader.load(config.floor[i]);
      floorTileTexture.colorSpace = THREE.SRGBColorSpace;
      const floorMaterial = new THREE.MeshPhongMaterial({
        map: floorTileTexture,
        //flatShading: true,
        emissiveMap: floorTileTexture,
        emissive: 0xcccccc,
      });
      this.floorMaterials.push(floorMaterial);
    }

    // ----- geometry -----
    // base floor
    const floorGeometry = new THREE.PlaneGeometry(2000, 2000);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x22ff22 });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotateX(THREE.MathUtils.degToRad(-90));
    this.scene.add(floorMesh);

    // floor tiles (10x10)
    this.floorTilesContainer = new THREE.Scene();
    this.scene.add(this.floorTilesContainer);
    const floorTileGeometry = new THREE.PlaneGeometry(10, 10);
    for (let v = -5; v < 5; v++) {
      for (let h = -5; h < 5; h++) {
        const floorTile = new THREE.Mesh(
          floorTileGeometry,
          this.floorMaterials[0],
        );
        floorTile.position.set(10 * h + 5, 1, 10 * v + 5);
        floorTile.rotateX(THREE.MathUtils.degToRad(-90));
        this.floorTiles.push(floorTile);
        this.floorTilesContainer.add(floorTile);
      }
    }

    // objects (10x10)
    this.objectsContainer = new THREE.Scene();
    this.scene.add(this.objectsContainer);
    for (let v = -5; v < 5; v++) {
      for (let h = -5; h < 5; h++) {
        const objectTile = new THREE.Scene();
        objectTile.position.set(10 * h + 5, 1, 10 * v + 5);
        objectTile.rotateX(THREE.MathUtils.degToRad(-90));
        this.objects.push(objectTile);
        this.objectsContainer.add(objectTile);
      }
    }

    // load plants models
    this.plantsModels = [];
    for (let i = 0; i < config.plants.length; i++) {
      const objA: THREE.Scene = new THREE.Scene();
      objA.add((await objLoader.loadAsync(config.plants[i].model)).scene);
      objA.rotateX(THREE.MathUtils.DEG2RAD * 90);
      objA.scale.set(5, 5, 5);
      this.plantsModels.push(objA);
    }

    // load furniture models
    this.furnitureModels = [];
    for (let i = 0; i < config.furniture.length; i++) {
      const objA: THREE.Scene = new THREE.Scene();
      objA.add((await objLoader.loadAsync(config.furniture[i].model)).scene);
      objA.rotateX(THREE.MathUtils.DEG2RAD * 90);
      objA.scale.set(5, 5, 5);
      this.furnitureModels.push(objA);
    }

    // Cursor tile
    const cursorMat = new THREE.MeshBasicMaterial({ color: "red" });
    this.cursorTile = new THREE.Mesh(floorTileGeometry, cursorMat);
    this.cursorTile.position.set(0, 2, 0);
    this.cursorTile.rotateX(THREE.MathUtils.degToRad(-90));
    this.scene.add(this.cursorTile);

    this.raycaster = new THREE.Raycaster();
    this.initPicker();

    return this.scene;
  }

  resize(WIDTH: number, HEIGHT: number) {
    this.WIDTH = WIDTH;
    this.HEIGHT = HEIGHT;
  }

  update(deltatime: number) {
    this.controls.update();
  }

  // ------------
  private initPicker() {
    this.cursorTile.visible = false;
    this.picketTile = undefined;

    window.addEventListener("mousemove", (event) => {
      if (this.currentPaintMode == paintModes.None) return;
      const rect = this.CANVAS.getBoundingClientRect();
      const point = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        ((event.clientY - rect.top) / rect.height) * -2 + 1,
      );
      this.picketTile = this.pick(point);
    });

    window.addEventListener("click", () => {
      if (this.picketTile != undefined) {
        this.setSelectedObject();
      }
    });
  }

  private pick(mouseCoords: THREE.Vector2): THREE.Object3D | undefined {
    this.raycaster.setFromCamera(mouseCoords, this.CAMERA);
    const pointedTiles = this.raycaster.intersectObjects(
      this.floorTilesContainer.children,
    );
    if (pointedTiles.length > 0) {
      const coords = pointedTiles[0].object;
      this.cursorTile.position.set(
        coords.position.x,
        coords.position.y,
        coords.position.z,
      );
      this.cursorTile.visible = true;
      return coords;
    } else {
      this.cursorTile.visible = false;
      return undefined;
    }
  }

  private setSelectedObject() {
    if (this.currentPaintMode != paintModes.None) {
      const tile = this.picketTile as THREE.Mesh;
      const index = this.floorTiles.findIndex((t) => t == tile);

      if (this.currentPaintMode == paintModes.Floor) {
        this.floorTiles[index].material =
          this.floorMaterials[this.currentPaintIndex];
      } else if (this.currentPaintMode == paintModes.Plant) {
        this.objects[index].clear();
        if (this.currentPaintIndex != -1)
          this.objects[index].add(
            this.plantsModels[this.currentPaintIndex].clone(),
          );
      } else if (this.currentPaintMode == paintModes.Furniture) {
        this.objects[index].clear();
        if (this.currentPaintIndex != -1)
          this.objects[index].add(
            this.furnitureModels[this.currentPaintIndex].clone(),
          );
      }
    }
  }

  cancelPaintMode() {
    this.cursorTile.visible = false;
    this.currentPaintMode = paintModes.None;
    this.currentPaintIndex = -1;
  }
  setPaintMode(paintMode: paintModes, item: number = -1) {
    this.currentPaintMode = paintMode;
    this.currentPaintIndex = item;
  }
}
