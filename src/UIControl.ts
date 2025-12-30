import { Container, Assets, Sprite, FillGradient, Color } from "pixi.js";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import config from "./config.json";

export default class UIControl extends PIXI.EventEmitter {
  constructor() {
    super();
    gsap.registerPlugin(PixiPlugin);
    PixiPlugin.registerPIXI(PIXI);
  }

  public scene!: Container;
  private WIDTH!: number;
  private HEIGHT!: number;
  private CANVAS!: HTMLCanvasElement;

  private logo!: Sprite;

  private mainMenu!: Container;
  private floorMenu!: Container;
  private plantsMenu!: Container;
  private furnitureMenu!: Container;

  private higlightedSprite?: Sprite;
  private highlightTintcolor: Color = new Color(0xff5555);

  async init(WIDTH: number, HEIGHT: number, CANVAS: HTMLCanvasElement) {
    this.WIDTH = WIDTH;
    this.HEIGHT = HEIGHT;
    this.CANVAS = CANVAS;

    this.scene = new Container();

    // ------ LOGO
    const texture = await Assets.load("/assets/logo.png");
    this.logo = new Sprite(texture);
    this.scene.addChild(this.logo);

    // general close button texture
    const closeBtnTexture = await Assets.load("./assets/close.png");
    const eraserBtnTexture = await Assets.load("./assets/eraser.png");

    // ----- mainMenu
    this.mainMenu = new Container();
    this.mainMenu.interactiveChildren = true;
    // -- floor btn
    const floorMenuSprite = await Assets.load("./assets/floorBtn.png");
    const floorMenuBtn: Sprite = new Sprite(floorMenuSprite);
    floorMenuBtn.setSize(50, 50);
    floorMenuBtn.position.x = this.mainMenu.width + 5;
    floorMenuBtn.interactive = true;
    floorMenuBtn.onclick = () => this.showFloorMenu(true);
    this.mainMenu.addChild(floorMenuBtn);
    // -- plants btn
    const plantsMenuSprite = await Assets.load("./assets/plantsBtn.png");
    const plantsMenuBtn: Sprite = new Sprite(plantsMenuSprite);
    plantsMenuBtn.setSize(50, 50);
    plantsMenuBtn.position.x = this.mainMenu.width + 10;
    plantsMenuBtn.interactive = true;
    plantsMenuBtn.onclick = () => this.showPlantsMenu(true);
    this.mainMenu.addChild(plantsMenuBtn);
    // -- furniture btn
    const furnitureMenuSprite = await Assets.load("./assets/furnitureBtn.png");
    const furnitureMenuBtn: Sprite = new Sprite(furnitureMenuSprite);
    furnitureMenuBtn.setSize(50, 50);
    furnitureMenuBtn.position.x = this.mainMenu.width + 10;
    furnitureMenuBtn.interactive = true;
    furnitureMenuBtn.onclick = () => this.showFurnitureMenu(true);
    this.mainMenu.addChild(furnitureMenuBtn);
    // -- take snapshot btn
    const snapshotMenuSprite = await Assets.load("./assets/snapshot.png");
    const snapshotMenuBtn: Sprite = new Sprite(snapshotMenuSprite);
    snapshotMenuBtn.setSize(50, 50);
    snapshotMenuBtn.position.x = this.mainMenu.width + 10;
    snapshotMenuBtn.interactive = true;
    snapshotMenuBtn.onclick = () => this.takeSnapshot();
    this.mainMenu.addChild(snapshotMenuBtn);

    this.mainMenu.visible = false;
    this.scene.addChild(this.mainMenu);

    // ----- floor tiles menu
    this.floorMenu = new Container();
    this.floorMenu.interactiveChildren = true;
    const closeFloorMenu: Sprite = new Sprite(closeBtnTexture);
    closeFloorMenu.setSize(50, 50);
    closeFloorMenu.interactive = true;
    closeFloorMenu.onclick = () => this.showFloorMenu(false);
    this.floorMenu.addChild(closeFloorMenu);
    for (let i = 0; i < config.floor.length; i++) {
      const texture = await Assets.load(config.floor[i]);
      const floorTileBtn: Sprite = new Sprite(texture);
      floorTileBtn.setSize(50, 50);
      floorTileBtn.interactive = true;
      floorTileBtn.onclick = () => this.selectFloorItem(i, floorTileBtn);
      floorTileBtn.position.x = this.floorMenu.width + 5;
      this.floorMenu.addChild(floorTileBtn);
    }
    this.floorMenu.visible = false;
    this.scene.addChild(this.floorMenu);

    // ----- plants menu
    this.plantsMenu = new Container();
    this.plantsMenu.interactiveChildren = true;
    const closePlantsMenu: Sprite = new Sprite(closeBtnTexture);
    closePlantsMenu.setSize(50, 50);
    closePlantsMenu.interactive = true;
    closePlantsMenu.onclick = () => this.showPlantsMenu(false);
    this.plantsMenu.addChild(closePlantsMenu);
    for (let i = 0; i < config.plants.length; i++) {
      const texture = await Assets.load(config.plants[i].image);
      const plantBtn: Sprite = new Sprite(texture);
      plantBtn.setSize(50, 50);
      plantBtn.interactive = true;
      plantBtn.onclick = () => this.selectPlantItem(i, plantBtn);
      plantBtn.position.x = this.plantsMenu.width + 5;
      this.plantsMenu.addChild(plantBtn);
    }
    const deletePlantBtn: Sprite = new Sprite(eraserBtnTexture);
    deletePlantBtn.setSize(50, 50);
    deletePlantBtn.interactive = true;
    deletePlantBtn.onclick = () => this.selectPlantItem(-1, deletePlantBtn);
    deletePlantBtn.position.x = this.plantsMenu.width + 5;
    this.plantsMenu.addChild(deletePlantBtn);

    this.plantsMenu.visible = false;
    this.scene.addChild(this.plantsMenu);

    // ----- furniture menu
    this.furnitureMenu = new Container();
    this.furnitureMenu.interactiveChildren = true;
    const closeFurnitureMenu: Sprite = new Sprite(closeBtnTexture);
    closeFurnitureMenu.setSize(50, 50);
    closeFurnitureMenu.interactive = true;
    closeFurnitureMenu.onclick = () => this.showFurnitureMenu(false);
    this.furnitureMenu.addChild(closeFurnitureMenu);
    for (let i = 0; i < config.furniture.length; i++) {
      const texture = await Assets.load(config.furniture[i].image);
      const furnitureBtn: Sprite = new Sprite(texture);
      furnitureBtn.setSize(50, 50);
      furnitureBtn.interactive = true;
      furnitureBtn.onclick = () => this.selectFurnitureItem(i, furnitureBtn);
      furnitureBtn.position.x = this.furnitureMenu.width + 5;
      this.furnitureMenu.addChild(furnitureBtn);
    }
    const deleteFurnitureBtn: Sprite = new Sprite(eraserBtnTexture);
    deleteFurnitureBtn.setSize(50, 50);
    deleteFurnitureBtn.interactive = true;
    deleteFurnitureBtn.onclick = () =>
      this.selectPlantItem(-1, deleteFurnitureBtn);
    deleteFurnitureBtn.position.x = this.furnitureMenu.width + 5;
    this.furnitureMenu.addChild(deleteFurnitureBtn);

    this.furnitureMenu.visible = false;
    this.scene.addChild(this.furnitureMenu);

    // -- final full UI layout init --
    this.resize(WIDTH, HEIGHT);

    // --- delayed show mainMenu
    gsap.from(this.logo, {
      duration: 2,
      pixi: { y: this.HEIGHT / 4, x: this.WIDTH / 2, scale: 1.5 },
      ease: "easy.out",
    });
    setTimeout(() => {
      this.showMenu(this.mainMenu);
    }, 1000);

    return this.scene;
  }

  update(deltaTime: number) {}

  resize(WIDTH: number, HEIGHT: number) {
    // logo
    this.logo.anchor.set(0.5, 0);
    this.logo.position.set(WIDTH / 2, 0);
    this.logo.height = HEIGHT * 0.25;
    this.logo.scale.x = this.logo.scale.y;
    if (this.logo.width * 2 > WIDTH) {
      this.logo.width = WIDTH / 2;
      this.logo.scale.y = this.logo.scale.x;
    }

    // main menu
    this.mainMenu.position.set(
      (WIDTH - this.mainMenu.width) / 2,
      HEIGHT - this.mainMenu.height,
    );
    this.mainMenu.width = WIDTH;
    this.mainMenu.scale.y = this.mainMenu.scale.x;
    if (this.mainMenu.height > HEIGHT / 4) {
      this.mainMenu.height = HEIGHT / 4;
      this.mainMenu.scale.x = this.mainMenu.scale.y;
    }

    // floor menu
    this.floorMenu.position.set(
      (WIDTH - this.floorMenu.width) / 2,
      HEIGHT - this.floorMenu.height,
    );
    this.floorMenu.width = WIDTH;
    this.floorMenu.scale.y = this.floorMenu.scale.x;
    if (this.floorMenu.height > HEIGHT / 4) {
      this.floorMenu.height = HEIGHT / 4;
      this.floorMenu.scale.x = this.floorMenu.scale.y;
    }

    // plants menu
    this.plantsMenu.position.set(
      (WIDTH - this.plantsMenu.width) / 2,
      HEIGHT - this.plantsMenu.height,
    );
    this.plantsMenu.width = WIDTH;
    this.plantsMenu.scale.y = this.plantsMenu.scale.x;
    if (this.plantsMenu.height > HEIGHT / 4) {
      this.plantsMenu.height = HEIGHT / 4;
      this.plantsMenu.scale.x = this.plantsMenu.scale.y;
    }

    // furniture menu
    this.furnitureMenu.position.set(
      (WIDTH - this.furnitureMenu.width) / 2,
      HEIGHT - this.furnitureMenu.height,
    );
    this.furnitureMenu.width = WIDTH;
    this.furnitureMenu.scale.y = this.furnitureMenu.scale.x;
    if (this.furnitureMenu.height > HEIGHT / 4) {
      this.furnitureMenu.height = HEIGHT / 4;
      this.furnitureMenu.scale.x = this.furnitureMenu.scale.y;
    }
  }

  // general menu open/close functions
  showMenu(target: Container) {
    // show menu
    gsap.from(target, {
      duration: 1.5,
      pixi: { y: this.HEIGHT },
      ease: "elastic.out",
    });
    target.visible = true;
  }
  hideMenu(target: Container) {
    this.highlight(undefined);
    // hide menu
    const originalY = target.position.y;
    gsap
      .to(target, {
        duration: 0.2,
        pixi: { y: this.HEIGHT },
      })
      .then(() => {
        target.visible = false;
        target.position.y = originalY;
      });
  }

  highlight(s: Sprite | undefined = undefined) {
    if (this.higlightedSprite != undefined)
      this.higlightedSprite.tint = 0xffffff;
    if (s != null) {
      this.higlightedSprite = s;
      s.tint = this.highlightTintcolor;
    }
  }

  // floorMenu interactions
  showFloorMenu(open = true) {
    if (open) {
      this.hideMenu(this.mainMenu);
      this.showMenu(this.floorMenu);
    } else {
      this.hideMenu(this.floorMenu);
      this.showMenu(this.mainMenu);
      this.emit("cancelPaint"); // disaple paint mode
    }
  }

  selectFloorItem(item: number = -1, s: Sprite | undefined) {
    if (item != -1) {
      this.emit("paintFloor", item);
      this.highlight(s);
    } else this.emit("cancelPaint"); // disaple paint mode
  }

  // plantsMenu interactions
  showPlantsMenu(open = true) {
    if (open) {
      this.hideMenu(this.mainMenu);
      this.showMenu(this.plantsMenu);
    } else {
      this.hideMenu(this.plantsMenu);
      this.showMenu(this.mainMenu);
      this.emit("cancelPaint"); // disaple paint mode
    }
  }
  selectPlantItem(item: number = NaN, s: Sprite | undefined) {
    if (!isNaN(item)) {
      this.emit("paintPlant", item);
      this.highlight(s);
    } else this.emit("cancelPaint"); // disaple paint mode
  }

  // furnitureMenu interactions
  showFurnitureMenu(open = true) {
    if (open) {
      this.hideMenu(this.mainMenu);
      this.showMenu(this.furnitureMenu);
    } else {
      this.hideMenu(this.furnitureMenu);
      this.showMenu(this.mainMenu);
      this.emit("cancelPaint"); // disaple paint mode
    }
  }
  selectFurnitureItem(item: number = NaN, s: Sprite | undefined) {
    if (!isNaN(item)) {
      this.emit("paintFurniture", item);
      this.highlight(s);
    } else this.emit("cancelPaint"); // disaple paint mode
  }

  takeSnapshot() {
    this.emit("snapshot");
  }
}
