"use server";

import {
	createFormAction,
	parseFormData,
	schema,
} from "@yedoma-labs/suruy-form-actions";
import { z } from "zod";
import { actionLogger } from "@/lib/logger";

// Example 1: suruy validation + schema, consumed by sir-forms
const profileSchema = schema<{
	firstName: string;
	lastName: string;
	email: string;
	bio: string;
	age: string;
}>({
	firstName: { type: "string", required: true, min: 2, max: 50 },
	lastName: { type: "string", required: true, min: 2, max: 50 },
	email: { type: "email", required: true },
	bio: { type: "string", required: false, max: 500 },
	age: {
		type: "string",
		required: true,
		custom: (value: unknown) => {
			const num = Number(value);
			if (Number.isNaN(num) || num < 18 || num > 120) {
				return "Age must be between 18 and 120";
			}
			return null;
		},
	},
});

export const hybridUpdateProfile = createFormAction(
	async (formData) => profileSchema.safeParse(parseFormData(formData)),
	async (data) => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		actionLogger.info("Hybrid form submission - profile update", {
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			age: data.age,
			action: "hybridUpdateProfile",
		});

		return {
			success: true,
			data: {
				userId: `user_${Date.now()}`,
				...data,
				updatedAt: new Date().toISOString(),
			},
		};
	},
);

// Example 2: Zod + suruy, consumed by sir-forms
const zodCheckoutSchema = z.object({
	cardNumber: z
		.string()
		.min(16, "Card number must be 16 digits")
		.max(16, "Card number must be 16 digits")
		.regex(/^\d+$/, "Card number must contain only digits"),
	expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
	expiryYear: z.string().regex(/^\d{4}$/, "Invalid year"),
	cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3-4 digits"),
	amount: z
		.string()
		.transform((val) => Number.parseFloat(val))
		.refine((val) => val > 0, "Amount must be greater than 0"),
	saveCard: z.string().optional(),
});

export const hybridProcessCheckout = createFormAction(
	async (formData) => {
		const data = parseFormData(formData);
		const result = zodCheckoutSchema.safeParse(data);

		if (!result.success) {
			return {
				success: false,
				errors: result.error.flatten().fieldErrors as Record<string, string[]>,
			};
		}

		// Additional business validation
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1;
		const expYear = Number.parseInt(result.data.expiryYear, 10);
		const expMonth = Number.parseInt(result.data.expiryMonth, 10);

		if (
			expYear < currentYear ||
			(expYear === currentYear && expMonth < currentMonth)
		) {
			return {
				success: false,
				errors: { expiryMonth: ["Card has expired"] },
			};
		}

		return { success: true, data: result.data };
	},
	async (data) => {
		await new Promise((resolve) => setTimeout(resolve, 1500));

		actionLogger.info("Hybrid checkout processed", {
			amount: data.amount,
			saveCard: data.saveCard === "on",
			cardLast4: data.cardNumber.slice(-4),
			action: "hybridProcessCheckout",
		});

		return {
			success: true,
			data: {
				transactionId: `txn_${Date.now()}`,
				amount: data.amount,
				cardLast4: data.cardNumber.slice(-4),
				processedAt: new Date().toISOString(),
			},
		};
	},
);

// Example 3: Multi-step form (suruy validation, sir-forms state)
const step1Schema = schema<{
	companyName: string;
	industry: string;
	employeeCount: string;
}>({
	companyName: { type: "string", required: true, min: 2, max: 100 },
	industry: { type: "string", required: true },
	employeeCount: { type: "string", required: true },
});

const step2Schema = schema<{
	contactName: string;
	contactEmail: string;
	contactPhone: string;
}>({
	contactName: { type: "string", required: true, min: 2 },
	contactEmail: { type: "email", required: true },
	contactPhone: {
		type: "string",
		required: true,
		custom: (value: unknown) => {
			if (typeof value === "string" && !/^\+?[\d\s\-()]+$/.test(value)) {
				return "Invalid phone number format";
			}
			return null;
		},
	},
});

export const hybridSubmitStep1 = createFormAction(
	async (formData) => step1Schema.safeParse(parseFormData(formData)),
	async (data) => {
		await new Promise((resolve) => setTimeout(resolve, 500));
		return { success: true, data };
	},
);

export const hybridSubmitStep2 = createFormAction(
	async (formData) => step2Schema.safeParse(parseFormData(formData)),
	async (data) => {
		await new Promise((resolve) => setTimeout(resolve, 500));
		return { success: true, data };
	},
);

export const hybridFinalSubmit = createFormAction(
	async (formData) => {
		// Get all data from formData
		const data = parseFormData(formData);

		actionLogger.debug("Final submit - received data", {
			data,
			action: "hybridFinalSubmit",
		});

		// Validate both steps together
		const step1Result = step1Schema.safeParse(data);
		const step2Result = step2Schema.safeParse(data);

		actionLogger.debug("Multi-step validation results", {
			step1Success: step1Result.success,
			step2Success: step2Result.success,
			action: "hybridFinalSubmit",
		});

		if (!step1Result.success || !step2Result.success) {
			const errors: Record<string, string[]> = {};

			if (!step1Result.success) {
				Object.assign(errors, step1Result.errors);
			}
			if (!step2Result.success) {
				Object.assign(errors, step2Result.errors);
			}

			actionLogger.warn("Multi-step validation failed", {
				errors,
				action: "hybridFinalSubmit",
			});

			return {
				success: false,
				errors,
			};
		}

		return {
			success: true,
			data: { ...step1Result.data, ...step2Result.data },
		};
	},
	async (data) => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		actionLogger.info("Multi-step form completed", {
			companyName: data.companyName,
			industry: data.industry,
			employeeCount: data.employeeCount,
			contactName: data.contactName,
			contactEmail: data.contactEmail,
			action: "hybridFinalSubmit",
		});

		return {
			success: true,
			data: {
				applicationId: `app_${Date.now()}`,
				...data,
				submittedAt: new Date().toISOString(),
			},
		};
	},
);
