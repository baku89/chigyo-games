<template>
	<GameContainer :game-duration="15">
		<template #instruction="{gameDuration}">
			<div class="instruction">
				<h1>稚魚シャワー</h1>
				<p>
					シャワーの湯加減と勢いを調整して<br />
					稚魚を喜ばせよう
				</p>
				<p>
					制限時間は<strong>{{ gameDuration }}秒</strong>
				</p>
				<p class="small">
					※ 本ゲームでは、操作データが一度だけサーバーに送信・記録されます。<br />
					プレイ開始をもって、データの収集・利用に同意したものとみなされます。
				</p>
			</div>
		</template>

		<template #default>
			<main class="Shower">
				<h1>稚魚シャワー</h1>
				<Renderer
					ref="renderer"
					class="shower-renderer"
					:antialias="true"
					:alpha="true"
					:resize="true"
				>
					<Camera :position="{z: 10}" :fov="30" />
					<Scene>
						<AmbientLight :intensity="1" />
						<DirectionalLight
							:position="{x: -10, y: 10, z: 5}"
							:intensity="1"
						/>
						<Group :position="{y: -1.2}">
							<FbxModel
								src="/chigyo-games/shower/faucet_2.fbx"
								@load="onLoadModel"
							/>
						</Group>
					</Scene>
				</Renderer>
			</main>
		</template>
	</GameContainer>
</template>

<script setup lang="ts">
import type {Group as ThreeGroup, Mesh} from 'three'
import {
	MeshStandardMaterial,
	TextureLoader,
	EquirectangularReflectionMapping,
} from 'three'
import {
	AmbientLight,
	Camera,
	DirectionalLight,
	Renderer,
	Scene,
	Group,
	FbxModel,
} from 'troisjs'

function onLoadModel(group: ThreeGroup) {
	// Load 2:1 equirectangular image as environment map
	const loader = new TextureLoader()
	loader.load('/chigyo-games/shower/studio023.jpg', texture => {
		texture.mapping = EquirectangularReflectionMapping

		// Apply to all meshes once loaded
		group.traverse((obj: any) => {
			if (obj?.isMesh) {
				const mesh = obj as Mesh
				if (mesh.material instanceof MeshStandardMaterial) {
					mesh.material.envMap = texture
					mesh.material.needsUpdate = true
				}
			}
		})
	})

	group.traverse((obj: any) => {
		if (obj?.isMesh) {
			const mesh = obj as Mesh

			mesh.material = new MeshStandardMaterial({
				color: 0xffffff,
				metalness: 0.8, // 金属感を強化
				roughness: 0.2, // 滑らかにして反射を強化
			})
		}
	})
}
</script>

<style lang="stylus">
body
	background white !important

.Shower
	padding 1rem
	aspect-ratio 1 / 1

.shower-renderer
	position absolute
	top 0
	left 0
	width 100%
	height 100%
	background transparent
</style>
