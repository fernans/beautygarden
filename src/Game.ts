import * as THREE from "three";
import { WebGLRenderer, Application, Ticker } from "pixi.js";
import Scene3DControl, { paintModes } from "./Scene3DControl";
import UIControl from "./UIControl";

export default class Game {
  public WIDTH?: number;
  public HEIGHT?: number;

  CANVAS!: HTMLCanvasElement;

  tRenderer?: THREE.WebGLRenderer;
  tScene?: THREE.Scene;
  tCamera?: THREE.PerspectiveCamera;

  pRenderer?: WebGLRenderer;
  pApp?: Application;

  scene3DControl!: Scene3DControl;
  uiControl!: UIControl;

  constructor() {}

  async init() {
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;

    // ----- init THREE -----
    this.tRenderer = new THREE.WebGLRenderer({
      antialias: true,
      stencil: true,
    });
    this.CANVAS = this.tRenderer.domElement;
    document.body.appendChild(this.CANVAS);

    this.tCamera = new THREE.PerspectiveCamera(70, this.WIDTH / this.HEIGHT);
    this.tCamera.position.z = 50;

    // ----- init PIXIJS ----
    this.pRenderer = new WebGLRenderer();
    this.pRenderer.init({
      canvas: this.CANVAS,
      clearBeforeRender: false,
      width: this.WIDTH,
      height: this.HEIGHT,
    });

    // Initialize Pixi App
    this.pApp = new Application();
    await this.pApp.init({
      autoStart: false,
      resizeTo: this.CANVAS,
      context: this.pRenderer.gl,
    });

    // --- 3d Scene
    this.scene3DControl = new Scene3DControl();
    await this.scene3DControl.init(
      this.WIDTH,
      this.HEIGHT,
      this.tCamera,
      this.tRenderer.domElement,
    );
    this.tScene = this.scene3DControl.scene;

    // -- ui scene
    this.uiControl = new UIControl();
    await this.uiControl.init(this.WIDTH, this.HEIGHT, this.pRenderer.canvas);
    this.uiControl.addListener("paintFloor", (item) => {
      this.scene3DControl.setPaintMode(paintModes.Floor, item);
    });
    this.uiControl.addListener("paintPlant", (item) => {
      this.scene3DControl.setPaintMode(paintModes.Plant, item);
    });
    this.uiControl.addListener("paintFurniture", (item) => {
      this.scene3DControl.setPaintMode(paintModes.Furniture, item);
    });
    this.uiControl.addListener("cancelPaint", () => {
      this.scene3DControl.cancelPaintMode();
    });
    this.uiControl.addListener("snapshot", () => {
      this.tRenderer!.resetState();
      this.tRenderer!.render(this.tScene!, this.tCamera!);
      this.CANVAS.toBlob(this.saveBlob.bind(this));
    });
    this.pApp.stage.addChild(this.uiControl.scene);

    // start Pixi App loop
    this.pApp.ticker.add(this.loop.bind(this));
    this.pApp.start();

    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
  }

  // --- resize ---
  resize() {
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    this.tRenderer!.setSize(WIDTH, HEIGHT);
    this.tCamera!.aspect = WIDTH / HEIGHT;
    this.tCamera!.updateProjectionMatrix();

    this.pRenderer!.resize(WIDTH, HEIGHT);

    this.scene3DControl.resize(WIDTH, HEIGHT);
    this.uiControl.resize(WIDTH, HEIGHT);
  }

  // ----- Loop -----
  loop(ticker: Ticker) {
    this.scene3DControl.update(ticker.deltaTime);
    this.uiControl.update(ticker.deltaTime);

    this.tRenderer!.resetState();
    this.tRenderer!.render(this.tScene!, this.tCamera!);

    this.pRenderer!.resetState();
    this.pRenderer!.render(this.pApp!.stage);
  }

  saveBlob(blob: Blob | null) {
    if (blob == null) return;
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = "MyBeautyGarden_" + this.dateFormat(new Date()) + ".png";
    a.click();
  }

  dateFormat(date: Date) {
    function padTwoDigits(num: number) {
      return num.toString().padStart(2, "0");
    }
    return [
      date.getFullYear(),
      padTwoDigits(date.getMonth() + 1),
      padTwoDigits(date.getDate()),
      padTwoDigits(date.getHours()),
      padTwoDigits(date.getMinutes()),
      padTwoDigits(date.getSeconds()),
    ].join("");
  }
}
