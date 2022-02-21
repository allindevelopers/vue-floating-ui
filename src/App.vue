<script setup lang="ts">
import { Teleport } from "vue";
import { useFloating, autoPlacement } from "./use-floating";

const { x, y, reference, floating, strategy } = useFloating({
	placement: "bottom-end",
	middleware: [autoPlacement()],
});
</script>

<template>
	<button ref="reference">Button lorem ipsum dolor</button>
	<Teleport to="body">
		<div
			ref="floating"
			:style="{
				position: strategy,
				top: y ? `${y}px` : '',
				left: x ? `${x}px` : '',
			}"
		>
			Tooltip
		</div>
	</Teleport>
</template>
