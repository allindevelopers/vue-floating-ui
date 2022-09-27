import type {
	ComputePositionReturn,
	Middleware,
	SideObject,
	Placement,
	MiddlewareData,
	Strategy,
} from "@floating-ui/core";
import {
	computePosition,
	arrow as arrowCore,
	ReferenceElement,
	FloatingElement,
} from "@floating-ui/dom";
import { ref, Ref, ToRefs, watch, isRef, toRefs, unref, reactive } from "vue";

export {
	autoPlacement,
	flip,
	hide,
	offset,
	shift,
	limitShift,
	size,
	inline,
	getOverflowAncestors,
	detectOverflow,
	autoUpdate,
} from "@floating-ui/dom";

type Data = Omit<ComputePositionReturn, "x" | "y"> & {
	x: number | null;
	y: number | null;
};

type UseFloatingReturn = ToRefs<Data> & {
	update: () => void;
	reference: Ref<ReferenceElement | null>;
	floating: Ref<FloatingElement | null>;
};

type MaybeRef<T> = Ref<T> | T;

type UseFloatingProps = {
	placement?: MaybeRef<Placement>;
	strategy?: MaybeRef<Strategy>;
	middleware?: MaybeRef<Array<Middleware>>;
	whileElementsMounted?: (
		reference: ReferenceElement,
		floating: FloatingElement,
		update: () => void,
	) => void | (() => void) | null;
};

export function useFloating({
	middleware = [],
	placement = "bottom",
	strategy = "absolute",
	whileElementsMounted,
}: UseFloatingProps = {}): UseFloatingReturn {
	const reference = ref<ReferenceElement | null>(null);
	const floating = ref<FloatingElement | null>(null);
	const middlewareRef = ref(middleware);
	const cleanupRef = ref<Function | void | null>(null);
	// Setting these to `null` will allow the consumer to determine if
	// `computePosition()` has run yet
	const data = reactive<Data>({
		x: null,
		y: null,
		placement: unref(placement),
		strategy: unref(strategy),
		middlewareData: {},
	});

	const update = () => {
		if (!reference.value || !floating.value) {
			return;
		}

		computePosition(reference.value, floating.value, {
			middleware: unref(middlewareRef),
			placement: unref(placement),
			strategy: unref(strategy),
		}).then((computedData) => {
			Object.assign(data, computedData);
		});
	};

	watch([placement, strategy], update);
	watch(middlewareRef, update, { deep: true });

	watch([reference, floating], () => {
		if (cleanupRef.value) {
			cleanupRef.value();
			cleanupRef.value = null;
		}

		if (!reference.value || !floating.value) {
			return;
		}

		if (whileElementsMounted) {
			cleanupRef.value = whileElementsMounted(
				reference.value,
				floating.value,
				update,
			);
		} else {
			update();
		}
	});

	return {
		...toRefs(data),
		update,
		reference,
		floating,
	};
}

export const arrow = (options: {
	element: Ref<HTMLElement | null> | HTMLElement;
	padding?: number | SideObject;
}): Middleware => {
	const { element, padding } = options;

	return {
		name: "arrow",
		options,
		fn(args) {
			if (isRef(element)) {
				if (element.value != null) {
					return arrowCore({ element: element.value, padding }).fn(args);
				}

				return {};
			} else if (element) {
				return arrowCore({ element, padding }).fn(args);
			}

			return {};
		},
	};
};
