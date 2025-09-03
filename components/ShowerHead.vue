<template>
	<FbxModel
		src="/chigyo-games/shower/shower_head.fbx"
		:position="{x: -0.1, y: 0.7}"
		@load="setupMetalicMaterial"
	/>
</template>

<script setup lang="ts">
import {FbxModel} from 'troisjs'
import {setupMetalicMaterial} from '~/utils/faucetsMaterial'
</script>
