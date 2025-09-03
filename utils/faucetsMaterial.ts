import {
	EquirectangularReflectionMapping,
	Group,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	TextureLoader,
} from 'three'

const metalicMaterial = new MeshStandardMaterial({
	color: 0xffffff,
	metalness: 0.8, // 金属感を強化
	roughness: 0.2, // 滑らかにして反射を強化
	vertexColors: true,
})

const loader = new TextureLoader()

loader.load('/chigyo-games/shower/studio023.jpg', texture => {
	texture.mapping = EquirectangularReflectionMapping

	metalicMaterial.envMap = texture
	metalicMaterial.needsUpdate = true
})

export function setupMetalicMaterial(group: Group) {
	group.traverse((obj: any) => {
		if (obj?.isMesh) {
			const mesh = obj as Mesh
			mesh.material = metalicMaterial
		}
	})
}

const constantMaterial = new MeshBasicMaterial({
	vertexColors: true, // Vertex colorをそのまま使用
})

export function setupConstantMaterial(group: Group) {
	group.traverse((obj: any) => {
		if (obj?.isMesh) {
			const mesh = obj as Mesh
			mesh.material = constantMaterial
		}
	})
}
