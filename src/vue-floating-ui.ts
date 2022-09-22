import type {
	ComputePositionConfig,
	ComputePositionReturn,
	Middleware,
	SideObject,
	Placement,
	MiddlewareData,
	Strategy,
} from "@floating-ui/core";
import { computePosition, arrow as arrowCore } from "@floating-ui/dom";
import { ref, Ref, ToRefs, watch, isRef } from "vue";

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
	reference: Ref<Element | null>;
	floating: Ref<HTMLElement | null>;
};

type UseFloatingProps = Omit<Partial<ComputePositionConfig>, "platform"> & {
	whileElementsMounted?: (
		reference: Element | null,
		floating: HTMLElement | null,
		update: () => void,
	) => void | (() => void) | null;
};

export function useFloating({
	middleware = [],
	placement = "bottom",
	strategy = "absolute",
	whileElementsMounted,
}: UseFloatingProps = {}): UseFloatingReturn {
	const reference = ref<Element | null>(null);
	const floating = ref<HTMLElement | null>(null);
	// Setting these to `null` will allow the consumer to determine if
	// `computePosition()` has run yet
	const x = ref<number | null>(null);
	const y = ref<number | null>(null);
	const _placement = ref<Placement>(placement);
	const _strategy = ref<Strategy>(strategy);
	const _middleware = ref<Middleware[]>(middleware);
	const middlewareData = ref<MiddlewareData>({});
	const cleanupRef = ref<Function | void | null>(null);

	const update = () => {
		if (!reference.value || !floating.value) {
			return;
		}

		computePosition(reference.value, floating.value, {
			middleware: _middleware.value,
			placement: _placement.value,
			strategy: _strategy.value,
		}).then((data) => {
			x.value = data.x;
			y.value = data.y;
			_placement.value = data.placement;
			_strategy.value = data.strategy;
			middlewareData.value = data.middlewareData;
		});
	};

	watch([_placement, _strategy], update);
	watch(_middleware, update, { deep: true });

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
		x,
		y,
		strategy: _strategy,
		placement: _placement,
		middlewareData,
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
