import * as THREE from 'three'
import { colorObjToRgb, loadGLTFModel } from '../helpers'
import SceneRenderer, { BaseScene } from '../utils/SceneRenderer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { Camera, Euler, MathUtils, Scene, Vector3 } from 'three'
import { GlitchPass } from '../effects/glitch'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { CRTShader } from '../effects/crt-shader'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { TransparentBloomPass } from '../effects/transparent-bloom'

interface TicketSceneState {
  visible: boolean
  secret: boolean
  platinum: boolean
  frontside: boolean
  startDate: Date
  ticketNumber: number
  texts: {
    username: string
    species: string
    earth: string
    seatCode: string
  }
}

interface TicketSceneOptions {
  defaultVisible?: boolean
  defaultSecret?: boolean
  defaultPlatinum?: boolean
  startDate: Date
  user: {
    id?: string
    name?: string
    ticketNumber?: number
  }
  onSeatChartButtonClicked?: () => void
  onWebsiteButtonClicked?: () => void
  onGoBackButtonClicked?: () => void
}

interface MousePositionState {
  clientX: number
  clientY: number
  isWithinContainer: boolean
  containerX: number
  containerY: number
  mouseIntensity: number
}

type AvailableTextures = (typeof TicketScene)['TEXTURE_NAMES'][number]

interface TextureDescriptor {
  url: string
  cachedData: THREE.Texture | null
}

class TicketScene implements BaseScene {
  raycaster = new THREE.Raycaster()
  sceneUrl = '/images/launchweek/14/ticket-model.glb'

  textureImages = {
    basic: {
      back: {
        url: '/images/launchweek/14/back-basic-ticket-texture.png',
        cachedData: null,
      } as TextureDescriptor,
      front: {
        url: '/images/launchweek/14/front-basic-ticket-texture.png',
        cachedData: null,
      } as TextureDescriptor,

      bgColor: { rgb: 0x202020, alpha: 1 },
      textColor: { rgb: 0xffffff, alpha: 1 },
      textDimmedColor: { rgb: 0x515151, alpha: 1 },
      textNeonColor: { rgb: 0xffffff, alpha: 1 },
      textNeonDimmedColor: { rgb: 0x515151, alpha: 1 },
      transparentBg: { rgb: 0x000000, alpha: 0 },
    },
    secret: {
      back: {
        url: '/images/launchweek/14/back-secret-ticket-texture.png',
        cachedData: null,
      } as TextureDescriptor,
      front: {
        url: '/images/launchweek/14/front-secret-ticket-texture.png',
        cachedData: null,
      } as TextureDescriptor,
      seat: {
        url: '',
        cachedData: null,
      } as TextureDescriptor,
      bgColor: { rgb: 0x050505, alpha: 1 },
      textColor: { rgb: 0xffffff, alpha: 1 },
      textDimmedColor: { rgb: 0x515151, alpha: 1 },
      textNeonColor: { rgb: 0x2cf494, alpha: 1 },
      textNeonDimmedColor: { rgb: 0x12623b, alpha: 1 },
      transparentBg: { rgb: 0x2cf494, alpha: 0.4 },
    },
    platinum: {
      back: {
        url: '/images/launchweek/14/back-platinum-ticket-texture.png',
        cachedData: null,
      } as TextureDescriptor,
      front: {
        url: '/images/launchweek/14/front-platinum-ticket-texture.png',
        cachedData: null,
      } as TextureDescriptor,

      bgColor: { rgb: 0x050505, alpha: 1 },
      textColor: { rgb: 0xffc73a, alpha: 1 },
      textDimmedColor: { rgb: 0xffc73a, alpha: 1 },
      textNeonColor: { rgb: 0xffc73a, alpha: 1 },
      textNeonDimmedColor: { rgb: 0xffc73a, alpha: 1 },
      transparentBg: { rgb: 0xffc73a, alpha: 0.4 },
    },
  }

  typography = {
    main: {
      family: 'Departure Mono',
      relativeSize: 100 / 1400,
    },
    ticketNumber: {
      family: 'Nippo-Variable',
      weight: 400,
      relativeSize: 125 / 1400,
    },
  }

  texts = {
    user: {
      x: 367 / 2000,
      y: 533 / 1400,
    },
    species: {
      x: 367 / 2000,
      y: 628 / 1400,
    },
    planet: {
      x: 367 / 2000,
      y: 721 / 1400,
    },
    date: {
      x: 1249 / 2000,
      y: 255 / 1400,
    },
    ticketNumber: {
      x: 368 / 2000,
      y: 1077.69 / 1400,
    },
    ticketNumberBack: {
      x: 368 / 2000,
      y: 1070 / 1400,
    },
  }

  fonts: ConstructorParameters<typeof FontFace>[] = [
    [
      'Departure Mono',
      'url("/fonts/launchweek/14/DepartureMono-Regular.woff2") format("woff2")',
      {
        weight: '400',
        style: 'normal',
      },
    ],
    [
      'Nippo-Variable',
      'url("/fonts/launchweek/14/Nippo-Variable.woff2") format("woff2")',
      {
        weight: '400 700',
        style: 'normal',
      },
    ],
  ]

  state: TicketSceneState

  private _internalState = {
    mousePosition: undefined as MousePositionState | undefined,
    containerBBox: undefined as DOMRect | undefined,
    naturalPosition: new Vector3(0, 0, 0),
    fontsLoaded: false,
    loadedTextureType: null as 'basic' | 'secret' | 'platinum' | null,
    effectsIntensity: 0,
    mouseIntensityDecay: 0.98, // How quickly the intensity decays
    mouseIntensityGainRate: 0.003,
  }

  private _sceneConfig = {
    camera: {
      position: new Vector3(0, 10, 0),
      rotation: new Euler(MathUtils.degToRad(-90), 0, 0),
      fov: 30,
    },
  }

  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null

  private _sceneRenderer: SceneRenderer | null = null

  private _ticket: THREE.Scene | null = null
  private _modelRenderPass: RenderPass | null = null
  private static TEXTURE_NAMES = [
    'TicketFront',
    'TicketBack',
    'TicketEdge',
    'TicketFrontWebsiteButton',
    'TicketFrontSeatChartButton',
    'TicketBackGoBackButton',
    'TicketBackWebsiteButton',
  ] as const
  private static TEXTURE_PIXEL_DENSITY_FACTOR = 400
  private texturePlaneMapping: { [key in AvailableTextures]?: 'back' | 'front' | 'edge' } = {
    TicketFront: 'front',
    TicketBack: 'back',
    TicketEdge: 'edge',
    TicketFrontWebsiteButton: 'front',
    TicketFrontSeatChartButton: 'front',
    TicketBackGoBackButton: 'back',
    TicketBackWebsiteButton: 'back',
  }

  private _textureCanvases: {
    [key in AvailableTextures]?: { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D }
  } = {}

  private _namedMeshes: { [key in AvailableTextures]?: THREE.Mesh } = {}

  private _bloomPass: TransparentBloomPass | null = null
  private _glitchPass: GlitchPass | null = null
  private _crtPass: ShaderPass | null = null
  private _effectsEnabled = false

  constructor(private options: TicketSceneOptions) {
    this.state = {
      visible: options.defaultVisible ?? false,
      secret: options.defaultSecret || false,
      platinum: options.defaultPlatinum || false,
      frontside: true,
      startDate: options.startDate,
      ticketNumber: options.user.ticketNumber || 0,
      texts: {
        username: 'Goszczu 123425' ?? options.user.name ?? '',
        species: 'Modern Human',
        earth: 'Earth',
        // Start assigning seats from A001
        seatCode: (466561 + (options.user.ticketNumber || 0)).toString(36),
      },
    }
  }

  async setup(context: SceneRenderer): Promise<void> {
    this._sceneRenderer = context
    this._internalState.containerBBox = context.container.getBoundingClientRect()
    console.log('setup', this._internalState.containerBBox)

    // Load fonts before loading the model
    await this._loadFonts()
    await this._preloadAllTextureSets()

    const gltf = await loadGLTFModel(this.sceneUrl)

    this._ticket = gltf.scene as unknown as Scene
    if (!this.state.visible) this._ticket.scale.set(0, 0, 0)

    this._setCamera(context.camera)
    this._modelRenderPass = new RenderPass(this._ticket, context.camera)

    // Set up post-processing effects but keep them disabled initially
    this._setupPostProcessingEffects(context)

    // Important: Don't set clear values for the render pass
    // Let the renderer handle clearing

    // Set renderer clear color to make background transparent
    context.renderer.setClearColor(0x000000, 0)

    // Keep everything in linear space until the end of the pipeline
    // Don't set outputColorSpace here
    context.renderer.autoClear = false

    // Add ambient light with increased intensity
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
    this._ticket.add(ambientLight)

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(5, 5, 5)
    this._ticket.add(directionalLight)

    // Add a point light to better illuminate the placeholder
    const pointLight = new THREE.PointLight(0xffffff, 1.0)
    pointLight.position.set(0, 0, 5)
    this._ticket.add(pointLight)
    this._registerMousePositionTracking(context)

    this._setupNamedObjects()
    this._setupTextureCanvases()
    await this._loadTextures()

    context.composer.addPass(this._modelRenderPass)

    // Add the effects passes but with zero intensity
    if (this._glitchPass) context.composer.addPass(this._glitchPass)
    if (this._crtPass) context.composer.addPass(this._crtPass)
    if (this._bloomPass) context.composer.addPass(this._bloomPass)
    context.composer.addPass(new OutputPass())
  }

  update(context: SceneRenderer, time?: number): void {
    // Clear the renderer with transparent background before rendering
    context.renderer.clear(true, true, true)

    const ticket = context.composer.passes[0]
    if (ticket instanceof RenderPass) {

      this._updateNaturalPosition()
      this._updateTicketSize(time)
      this._updateTicketToFollowMouse(ticket.scene, time)
      this._updatePasses(time)
    }
  }

  cleanup(): void {
    if (this.mouseMoveHandler) window.removeEventListener('mousemove', this.mouseMoveHandler)
  }

  handleEvent(event: string, data?: any): void {
    throw new Error('Method not implemented.')
  }

  resize(_ev: UIEvent): void {
    this._internalState.containerBBox = this._sceneRenderer?.container.getBoundingClientRect()
    console.log('resize', this._internalState.containerBBox)
    return
  }

  showFrontSide() {
    this.state.frontside = true
  }

  showBackSide() {
    this.state.frontside = false
  }

  async upgradeToSecret() {
    this.state.secret = true
    await this._loadTextures()
    // Start enabling effects gradually
    this._enableSecretEffects()
  }

  // In your click method
  click(e: MouseEvent) {
    this._updateMousePosition(e)

    if (!this._internalState.mousePosition?.isWithinContainer || !this._sceneRenderer) return

    // Set up raycaster
    this.raycaster.setFromCamera(
      new THREE.Vector2(
        this._internalState.mousePosition.containerX,
        this._internalState.mousePosition.containerY
      ),
      this._sceneRenderer.camera
    )

    // Get all meshes to check for intersection
    const meshes = Object.values(this._namedMeshes).filter(Boolean) as THREE.Mesh[]

    // Check for intersections
    const intersects = this.raycaster.intersectObjects(meshes)

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object as THREE.Mesh

      // Handle click based on which mesh was clicked
      if (clickedMesh === this._namedMeshes.TicketFrontWebsiteButton) {
        this.options.onWebsiteButtonClicked?.()
        // Add your action here
      } else if (clickedMesh === this._namedMeshes.TicketFrontSeatChartButton) {
        this.options.onSeatChartButtonClicked?.()
        // Add your action here
      } else if (clickedMesh === this._namedMeshes.TicketBackGoBackButton) {
        this.options.onGoBackButtonClicked?.()
      } else if (clickedMesh === this._namedMeshes.TicketBackWebsiteButton) {
        this.options.onWebsiteButtonClicked?.()
        // Add your action here
      }
    }
  }

  setVisible(value: boolean) {
    this.state.visible = value
  }

  private _enableSecretEffects() {
    if (this._effectsEnabled) return // Already enabled

    this._effectsEnabled = true
    this._internalState.effectsIntensity = 0

    // Enable all passes
    if (this._glitchPass) this._glitchPass.enabled = true
    if (this._crtPass) this._crtPass.enabled = true
    if (this._bloomPass) this._bloomPass.enabled = true
  }

  private _updatePasses(time?: number) {
    // Update time-based uniforms for shader passes
    if (this._crtPass && this._crtPass.uniforms['time']) {
      this._crtPass.uniforms['time'].value = time
    }

    if (this._internalState.mousePosition) {
      // Gradually decay mouse intensity when not moving
      if (this._internalState.mousePosition.mouseIntensity > 0) {
        this._internalState.mousePosition.mouseIntensity *= this._internalState.mouseIntensityDecay
        if (this._internalState.mousePosition.mouseIntensity < 0.0000001) {
          this._internalState.mousePosition.mouseIntensity = 0
        }
      }
    }

    // Update effect intensities if effects are enabled
    if (this._effectsEnabled) {
      // Gradually increase effect intensity over time
      this._internalState.effectsIntensity = Math.min(
        this._internalState.effectsIntensity + 0.01,
        1.0
      )

      // Update glitch pass intensity
      if (this._glitchPass) {
        const glitchIntensity = this._internalState.mousePosition?.mouseIntensity ?? 1
        this._glitchPass.setIntensity(glitchIntensity * this._internalState.effectsIntensity * 4)
      }

      // Update CRT shader intensity
      if (this._crtPass && this._crtPass.uniforms['intensity']) {
        this._crtPass.uniforms['intensity'].value = this._internalState.effectsIntensity * 1 // Scale to desired max (0.3)
      }

      // Update bloom pass parameters based on secret version state
      if (this._bloomPass) {
        if (this.state.secret) {
          // Gradually increase bloom strength from 0 to 3 without affecting transparency
          const targetStrength = 3.0
          const currentStrength = this._bloomPass.strength || 0
          const newStrength = currentStrength + (targetStrength - currentStrength) * 0.05
          this._bloomPass.strength = newStrength

          // Gradually decrease threshold for more bloom
          const targetThreshold = 0.2
          const currentThreshold = this._bloomPass.threshold || 1.0
          const newThreshold = currentThreshold - (currentThreshold - targetThreshold) * 0.05
          this._bloomPass.threshold = newThreshold
        } else {
          // Gradually reset bloom to initial values
          this._bloomPass.strength = Math.max(0, (this._bloomPass.strength || 0) - 0.05)
          this._bloomPass.threshold = Math.min(1.0, (this._bloomPass.threshold || 0.2) + 0.05)
        }
      }
    } else {
      // If effects are disabled, ensure all intensities are zero
      this._internalState.effectsIntensity = 0

      if (this._glitchPass) this._glitchPass.setIntensity(0)
      if (this._crtPass && this._crtPass.uniforms['intensity'])
        this._crtPass.uniforms['intensity'].value = 0
      if (this._bloomPass) {
        this._bloomPass.strength = 0
        this._bloomPass.threshold = 1.0
        this._bloomPass.radius = 0.5
      }
    }
  }

  private _setupPostProcessingEffects(context: SceneRenderer) {
    // Create glitch pass and disable it initially
    const glitchPass = new GlitchPass(521)
    glitchPass.enabled = false // Start disabled
    glitchPass.uniforms.col_s.value = 0
    glitchPass.setIntensity(0) // Start with zero intensity
    this._glitchPass = glitchPass

    // Create CRT pass with initial zero intensity
    const crtPass = new ShaderPass(CRTShader)
    crtPass.enabled = false // Start disabled
    crtPass.uniforms.intensity.value = 0 // Start with zero intensity
    this._crtPass = crtPass

    if (!this._ticket) throw new Error('Ticket not loaded')
    if (!this._sceneRenderer) throw new Error('SceneRenderer not loaded')

    // Create bloom pass with initial zero intensity
    const bloomPass = new TransparentBloomPass(
      new THREE.Vector2(context.container.clientWidth, context.container.clientHeight),
      0, // Initial strength (0-3)
      0.5, // Initial radius
      1.0 // Initial threshold (higher = less bloom)
    )

    bloomPass.enabled = false // Start disabled
    this._bloomPass = bloomPass
  }

  private _updateTicketToFollowMouse(scene: THREE.Scene, dt?: number) {
    // Calculate rotation based on mouse position
    // Limit rotation to reasonable angles
    if (this._internalState.mousePosition?.isWithinContainer) {
      const mouseX = this._internalState.mousePosition.containerX
      const mouseY = this._internalState.mousePosition.containerY
      // Limit the rotation angles to a reasonable range
      const targetRotationX = MathUtils.clamp(mouseY * -0.2, -0.3, 0.3)
      const targetRotationZ = MathUtils.clamp(mouseX * -0.3, -0.4, 0.4)

      // Apply smooth rotation with a smaller lerp factor
      const lerpFactor = Math.min(dt ?? 0.05, 0.05)
      scene.rotation.x = MathUtils.lerp(
        scene.rotation.x,
        this._internalState.naturalPosition.x + targetRotationX,
        lerpFactor
      )
      scene.rotation.z = MathUtils.lerp(
        scene.rotation.z,
        this._internalState.naturalPosition.z + targetRotationZ,
        lerpFactor
      )
    } else {
      // Return to neutral position more slowly
      const lerpFactor = Math.min(dt ?? 0.03, 0.03)
      scene.rotation.x = MathUtils.lerp(
        scene.rotation.x,
        this._internalState.naturalPosition.x,
        lerpFactor
      )
      scene.rotation.z = MathUtils.lerp(
        scene.rotation.z,
        this._internalState.naturalPosition.z,
        lerpFactor
      )
    }
  }

  private _updateNaturalPosition() {
    if (this.state.frontside) {
      this._internalState.naturalPosition.set(0, 0, 0)
    } else {
      this._internalState.naturalPosition.set(0, 0, Math.PI)
    }
  }

  private _setCamera(camera: Camera) {
    camera.position.copy(this._sceneConfig.camera.position)
    camera.rotation.copy(this._sceneConfig.camera.rotation)

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = this._sceneConfig.camera.fov
      camera.updateProjectionMatrix()
    }
  }

  private _registerMousePositionTracking(context: SceneRenderer) {
    this.mouseMoveHandler = this._updateMousePosition.bind(this)
    window.addEventListener('mousemove', this.mouseMoveHandler)
  }

  private _updateTicketSize(time?: number) {
    if (this.state.visible) {
      // console.log("Setting ticket visible")
      // this._ticket?.scale.set(1, 1, 1)
      this._ticket?.scale.lerp(new Vector3(1, 1, 1), 0.01)
    } else {
      // console.log("Setting ticket invisible")
      this._ticket?.scale.lerp(new Vector3(0, 0, 0), 0.01)
    }
  }

  private _updateMousePosition(ev: MouseEvent) {
    if (!this._internalState.mousePosition) {
      this._internalState.mousePosition = {
        clientX: 0,
        clientY: 0,
        isWithinContainer: false,
        containerX: 0,
        containerY: 0,
        mouseIntensity: 0,
      }
    } else {
      // Calculate mouse movement distance for glitch effect
      const dx = ev.clientX - this._internalState.mousePosition.clientX
      const dy = ev.clientY - this._internalState.mousePosition.clientY
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Update intensity based on movement (clamped between 0 and 1)
      this._internalState.mousePosition.mouseIntensity = Math.min(
        1.0,
        Math.max(
          0,
          this._internalState.mousePosition.mouseIntensity +
            distance * this._internalState.mouseIntensityGainRate
        )
      )

      // Update last position
      this._internalState.mousePosition.clientX = ev.clientX
      this._internalState.mousePosition.clientY = ev.clientY

      const rect = this._internalState.containerBBox
      if (!rect) {
        return
      }
      const isWithinContainer =
        ev.clientX >= rect.left &&
        ev.clientX <= rect.right &&
        ev.clientY >= rect.top &&
        ev.clientY <= rect.bottom

      this._internalState.mousePosition.isWithinContainer = isWithinContainer
      this._internalState.mousePosition.containerX = ((ev.clientX - rect.left) / rect.width) * 2 - 1
      this._internalState.mousePosition.containerY =
        -((ev.clientY - rect.top) / rect.height) * 2 + 1
    }
  }

  private _setupTextureCanvases() {
    for (const [name, mesh] of Object.entries(this._namedMeshes)) {
      const planeType = this.texturePlaneMapping[name as AvailableTextures]
      let referenceMesh: THREE.Mesh | undefined
      if (planeType === 'front') {
        referenceMesh = this._namedMeshes.TicketFront
      } else if (planeType === 'back') {
        referenceMesh = this._namedMeshes.TicketBack
      } else if (planeType === 'edge') {
        referenceMesh = this._namedMeshes.TicketEdge
      }

      if (!referenceMesh) {
        throw new Error(`Could not find reference mesh for texture ${name}`)
      }

      const localBox = new THREE.Box3().setFromObject(referenceMesh)
      const localSize = localBox.getSize(new THREE.Vector3())

      // Get world scale
      const worldScale = new THREE.Vector3()
      mesh.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), worldScale)

      // Apply world scale to get world size
      const worldSize = new THREE.Vector3(
        localSize.x / Math.abs(worldScale.x),
        localSize.y / Math.abs(worldScale.y),
        localSize.z / Math.abs(worldScale.z)
      )

      const canvas = document.createElement('canvas')
      const canvasWidth = worldSize.x * TicketScene.TEXTURE_PIXEL_DENSITY_FACTOR
      const canvasHeight = Math.floor(canvasWidth * (localSize.z / localSize.x)) // Maintain aspect ratio

      canvas.width = canvasWidth
      canvas.height = canvasHeight

      // Get canvas context and set up text rendering
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error(`Could not get 2D context for text "${name}"`)
      }

      this._textureCanvases[name as AvailableTextures] = {
        canvas,
        context,
      }
    }
  }

  private _setupNamedObjects() {
    const mainMeshName = 'Plane'
    const mesh = this._ticket?.getObjectByName(mainMeshName)

    if (!mesh) {
      throw new Error(`Could not find mesh named ${mainMeshName}`)
    }

    for (const part of mesh.children) {
      if (!(part instanceof THREE.Mesh)) {
        console.warn(`Part is not a THREE.Mesh. Got:`, part)
        continue
      }

      if (!(part.material instanceof THREE.Material)) {
        console.log(`Material is not an instance of THREE.Material. Got:`, part.material)
        continue
      }

      if ((TicketScene.TEXTURE_NAMES as readonly string[]).includes(part.material.name)) {
        console.log(`Found named mesh:`, part.material.name)
        this._namedMeshes[part.material.name as AvailableTextures] = part
      } else {
        console.warn(`Mesh ${part.material.name} is not a named texture`)
      }
    }
  }

  private async _loadTextures() {
    // Load textures for each named mesh
    // Create a texture loader
    const textureLoader = new THREE.TextureLoader()
    const loadingPromises: Promise<void>[] = []

    const textureSetKey = this.state.secret ? 'secret' : this.state.platinum ? 'platinum' : 'basic'

    if (this._internalState.loadedTextureType === textureSetKey) {
      console.log('Textures already loaded. Active set:', textureSetKey)
      return
    } else {
      console.log('Loading textures for set:', textureSetKey)
    }

    this._internalState.loadedTextureType = textureSetKey

    // Determine which texture set to use based on ticket type
    const textureSet = this.textureImages[textureSetKey]

    // Map of which image to use for each mesh
    const textureImageMap: Partial<Record<AvailableTextures, TextureDescriptor>> = {
      TicketFront: textureSet.front,
      TicketBack: textureSet.back,
      TicketFrontWebsiteButton: textureSet.front,
      TicketBackGoBackButton: textureSet.back,
      TicketFrontSeatChartButton: textureSet.front,
      TicketBackWebsiteButton: textureSet.back,
      // Add mappings for buttons if they have separate textures
      // Or they can reuse the front/back textures with different UV coordinates
    }

    const allMeshes = Object.entries(this._namedMeshes)
    // Preload all textures and prepare canvases
    for (const [name, mesh] of allMeshes) {
      console.log('Drawind texture', name)
      if (!mesh || !(mesh instanceof THREE.Mesh)) {
        console.warn(`Mesh ${name} is not a THREE.Mesh`)
        continue
      }
      if (!mesh.material || !(mesh.material instanceof THREE.MeshStandardMaterial)) {
        console.warn(`Mesh ${name} has no material or is not a MeshStandardMaterial`)
        continue
      }

      const textureKey = name as AvailableTextures
      const textureCanvas = this._textureCanvases[textureKey]

      if (!textureCanvas) {
        console.warn(`No texture canvas found for texture ${textureKey}`)
        continue
      }
      const { canvas, context } = textureCanvas

      // If we have an image for this texture
      const textureDescriptor = textureImageMap[textureKey]
      if (!textureDescriptor) {
        console.warn(`No texture descriptor found for texture ${textureKey}`)
        continue
      }

      if (textureDescriptor.cachedData === null) {
        // Create a loading promise for this texture
        await new Promise<void>((resolve) => {
          textureLoader.load(
            textureDescriptor.url,
            (loadedTexture) => {
              // Create an image from the loaded texture
              textureDescriptor.cachedData = loadedTexture

              // Fix: Set the correct color space to match the original model
              loadedTexture.colorSpace = THREE.SRGBColorSpace

              resolve()
            },
            undefined, // onProgress callback
            (error) => {
              console.error(`Error loading texture ${textureDescriptor.url}:`, error)
              resolve() // Resolve anyway to not block other textures
            }
          )
        })
      }

      if (!textureDescriptor.cachedData) {
        throw new Error(`Failed to load texture ${textureDescriptor.url}`)
      }

      context.drawImage(textureDescriptor.cachedData.image, 0, 0, canvas.width, canvas.height)

      // For meshes without base images, just draw custom content
      this._drawCustomContentOnTexture(textureKey, context, canvas)

      const texture = new THREE.CanvasTexture(canvas)
      texture.flipY = false
      // Set the correct color space for the texture
      texture.colorSpace = THREE.SRGBColorSpace
      texture.needsUpdate = true

      // Fix: Preserve the original material properties
      const originalMaterial = mesh.material
      const originalColor = mesh.material.color.clone()
      const originalEmissive = mesh.material.emissive ? mesh.material.emissive.clone() : null
      const originalEmissiveIntensity = mesh.material.emissiveIntensity

      mesh.material.map = texture
      mesh.material.color = originalColor
      if (originalEmissive) mesh.material.emissive = originalEmissive
      if (originalEmissiveIntensity) mesh.material.emissiveIntensity = originalEmissiveIntensity

      // Ensure material properties are preserved
      mesh.material.needsUpdate = true
    }

    // Return a promise that resolves when all textures are loaded
    return Promise.all(loadingPromises)
  }

  // Method to draw custom content on each texture type
  private _drawCustomContentOnTexture(
    textureKey: AvailableTextures,
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) {
    // Use fallback fonts if custom fonts failed to load
    const mainFontFamily = this._internalState.fontsLoaded
      ? this.typography.main.family
      : 'monospace'

    const ticketNumberFontFamily = this._internalState.fontsLoaded
      ? this.typography.ticketNumber.family
      : 'monospace'

    // Get the appropriate color scheme based on ticket type
    const colors = this.state.secret
      ? this.textureImages.secret
      : this.state.platinum
        ? this.textureImages.platinum
        : this.textureImages.basic

    const isNeon = this.state.secret || this.state.platinum

    switch (textureKey) {
      case 'TicketFront': {
        // Draw username
        context.fillStyle = colorObjToRgb(isNeon ? colors.textNeonColor : colors.textColor)
        const fontSize = this.typography.main.relativeSize * canvas.height
        context.font = `400 ${fontSize}px ${mainFontFamily}`
        context.textAlign = 'left'
        context.textBaseline = 'top'
        context.fillText(
          this.state.texts.username,
          this.texts.user.x * canvas.width,
          this.texts.user.y * canvas.height
        )

        context.fillStyle = colorObjToRgb(
          isNeon ? colors.textNeonDimmedColor : colors.textDimmedColor
        )
        // Draw species
        context.fillText(
          this.state.texts.species,
          this.texts.species.x * canvas.width,
          this.texts.species.y * canvas.height
        )

        // Draw planet
        context.fillText(
          this.state.texts.earth,
          this.texts.planet.x * canvas.width,
          this.texts.planet.y * canvas.height
        )

        context.fillStyle = colorObjToRgb(isNeon ? colors.textNeonColor : colors.textDimmedColor)
        // Draw ticket number with different font
        const ticketNumberFontSize = this.typography.ticketNumber.relativeSize * canvas.height
        context.font = `${this.typography.ticketNumber.weight} ${ticketNumberFontSize}px ${ticketNumberFontFamily}`
        context.fillText(
          this.state.texts.seatCode.toUpperCase(),
          this.texts.ticketNumber.x * canvas.width,
          this.texts.ticketNumber.y * canvas.height
        )
        break
      }
      case 'TicketBack': {
        context.fillStyle = colorObjToRgb(isNeon ? colors.textNeonColor : colors.textColor)

        context.textAlign = 'left'
        context.textBaseline = 'top'

        // Draw ticket number with different font
        const ticketNumberFontSize = this.typography.ticketNumber.relativeSize * canvas.height
        context.font = `${this.typography.ticketNumber.weight} ${ticketNumberFontSize}px ${ticketNumberFontFamily}`
        context.fillText(
          this.state.texts.seatCode.toUpperCase(),
          this.texts.ticketNumberBack.x * canvas.width,
          this.texts.ticketNumberBack.y * canvas.height
        )
        break
      }
      // Handle other texture types as needed
      case 'TicketFrontWebsiteButton':
      case 'TicketFrontSeatChartButton':
      case 'TicketBackGoBackButton':
      case 'TicketBackWebsiteButton':
        // These might not need custom content if the base image is sufficient
        break
    }
  }

  private async _loadFonts(): Promise<void> {
    try {
      // Define the fonts to load
      const fontFaces = this.fonts.map((f) => new FontFace(...f))
      // Load all fonts
      await Promise.all(
        fontFaces.map(async (font) => {
          const loadedFont = await font.load()
          // Add the loaded font to the document
          document.fonts.add(loadedFont)
          return loadedFont
        })
      )

      // All fonts loaded successfully
      this._internalState.fontsLoaded = true
    } catch (error) {
      // Handle font loading errors
      console.error('Failed to load fonts:', error)
      // Still continue to not block rendering, but with a warning
      this._internalState.fontsLoaded = false
    }
  }

  private async _preloadAllTextureSets() {
    const textureLoader = new THREE.TextureLoader()
    const allSets = ['basic', 'secret', 'platinum'] as const

    let promises: Promise<void>[] = []
    for (const set of allSets) {
      const textureSet = this.textureImages[set]
      if (textureSet.front.cachedData === null) {
        const promise = new Promise<void>((resolve, reject) => {
          textureLoader.load(
            textureSet.front.url,
            (texture) => {
              textureSet.front.cachedData = texture
              resolve()
            },
            undefined,
            reject
          )
        })
        promises.push(promise)
      }
      if (textureSet.back.cachedData === null) {
        const promise = new Promise<void>((resolve, reject) => {
          textureLoader.load(
            textureSet.back.url,
            (texture) => {
              textureSet.back.cachedData = texture
              resolve()
            },
            undefined,
            reject
          )
        })

        promises.push(promise)
      }
    }

    await Promise.all(promises)
  }
}

export default TicketScene
