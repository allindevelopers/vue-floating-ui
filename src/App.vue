<script setup lang="ts">
import { Placement, Strategy } from "@floating-ui/core";
import { Teleport, ref } from "vue";
import { useFloating, flip, shift, autoUpdate } from "./vue-floating-ui";

const placement = ref<Placement>("top");
const strategy = ref<Strategy>("fixed");
const middleware = ref([flip(), shift()]);
const {
	x,
	y,
	reference,
	floating,
	strategy: computedStrategy,
	placement: computedPlacement,
} = useFloating({
	placement,
	strategy,
	middleware,
	whileElementsMounted: autoUpdate,
});

function togglePlacement() {
	placement.value = placement.value === "top" ? "right" : "top";
}
function toggleStrategy() {
	strategy.value = strategy.value === "fixed" ? "absolute" : "fixed";
}
function toggleMiddleware() {
	middleware.value = middleware.value.length ? [] : [flip(), shift()];
}
</script>

<template>
	<div class="fixed top-0 right-0 flex flex-col gap-1 bg-gray-300 p-2">
		<button
			class="px-2 text-sm py-1 bg-gray-900 text-gray-100 rounded inline-block"
			@click="togglePlacement"
		>
			Toggle placement: {{ placement }} | {{ computedPlacement }}
		</button>
		<button
			class="px-2 text-sm py-1 bg-gray-900 text-gray-100 rounded inline-block"
			@click="toggleStrategy"
		>
			Toggle strategy: {{ strategy }} | {{ computedStrategy }}
		</button>
		<button
			class="px-2 text-sm py-1 bg-gray-900 text-gray-100 rounded inline-block"
			@click="toggleMiddleware"
		>
			Toggle middleware: {{ middleware.length ? "on" : "off " }}
		</button>
	</div>
	<button
		ref="reference"
		class="px-3 py-2 bg-gray-100 rounded inline-block"
		:style="{ position: strategy === 'fixed' ? 'fixed' : undefined }"
	>
		Button lorem ipsum dolor
	</button>
	<Teleport to="body">
		<div
			ref="floating"
			class="bg-red-100 p-2 rounded"
			:style="{
				position: computedStrategy,
				top: y ? `${y}px` : '',
				left: x ? `${x}px` : '',
			}"
		>
			Tooltip
		</div>
	</Teleport>
</template>
