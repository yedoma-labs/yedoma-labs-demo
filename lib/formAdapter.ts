/**
 * Adapter to make suruy-form-actions compatible with sir-forms
 *
 * suruy actions have signature: (prevState, formData) => Promise<Result>
 * sir-forms expects: (data: Record<string, unknown>) => Promise<Result>
 */

import type {
	FormAction,
	FormActionResult,
} from "@yedoma-labs/suruy-form-actions";
import { clientLogger } from "./clientLogger";

const adapterLogger = clientLogger.child({ module: "adapter" });

/**
 * Convert a suruy-form-actions action to sir-forms compatible format
 */
export function adaptSuruyActionForSirForms<TOutput>(
	suruyAction: FormAction<TOutput>,
) {
	return async (
		data: Record<string, unknown>,
	): Promise<FormActionResult<TOutput>> => {
		adapterLogger.debug("Received data from sir-forms", { data });

		// Convert data object to FormData
		const formData = new FormData();

		for (const [key, value] of Object.entries(data)) {
			if (value === null || value === undefined) {
				continue;
			}

			// Handle different value types
			if (typeof value === "boolean") {
				// Checkboxes: only add if checked
				if (value) {
					formData.append(key, "on");
				}
			} else if (value instanceof File) {
				formData.append(key, value);
			} else if (Array.isArray(value)) {
				// Handle array fields (e.g., tags[])
				for (const item of value) {
					formData.append(key, String(item));
				}
			} else {
				formData.append(key, String(value));
			}
		}

		// Log FormData contents
		const formDataEntries = Array.from(formData.entries()).reduce(
			(acc, [key, value]) => ({ ...acc, [key]: value }),
			{} as Record<string, FormDataEntryValue>,
		);
		adapterLogger.debug("FormData entries", { formDataEntries });

		// Call suruy action with null prevState and our FormData
		const result = await suruyAction(null, formData);

		adapterLogger.debug("Result from suruy action", { result });

		return result;
	};
}

/**
 * Type helper to extract the output type from a suruy action
 */
export type ExtractActionOutput<T> = T extends FormAction<infer O> ? O : never;
