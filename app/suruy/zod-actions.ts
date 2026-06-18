"use server";

import {
	createFormAction,
	parseFormData,
} from "@yedoma-labs/suruy-form-actions";
import { z } from "zod";
import { actionLogger } from "@/lib/logger";

// Example: Using suruy-form-actions with Zod validator
const zodLoginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	rememberMe: z.string().optional(),
});

export const suruyZodLogin = createFormAction(
	async (formData) => {
		const data = parseFormData(formData);
		const result = zodLoginSchema.safeParse(data);

		if (!result.success) {
			return {
				success: false,
				errors: result.error.flatten().fieldErrors as Record<string, string[]>,
			};
		}

		return { success: true, data: result.data };
	},
	async (data) => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		actionLogger.info("User login", {
			email: data.email,
			rememberMe: data.rememberMe === "on",
			action: "suruyZodLogin",
		});

		// In production, verify credentials
		return {
			success: true,
			data: {
				token: `token_${Date.now()}`,
				email: data.email,
				loginAt: new Date().toISOString(),
			},
		};
	},
);

// Complex Zod example with refinements
const zodProductSchema = z
	.object({
		name: z.string().min(3, "Name must be at least 3 characters"),
		price: z.string().transform((val) => Number.parseFloat(val)),
		discount: z.string().transform((val) => Number.parseFloat(val || "0")),
		category: z.enum(["electronics", "clothing", "food", "other"], {
			message: "Please select a valid category",
		}),
		inStock: z.string().optional(),
	})
	.refine((data) => data.price > 0, {
		message: "Price must be greater than 0",
		path: ["price"],
	})
	.refine((data) => data.discount >= 0 && data.discount <= 100, {
		message: "Discount must be between 0 and 100",
		path: ["discount"],
	})
	.refine(
		(data) => {
			const finalPrice = data.price - (data.price * data.discount) / 100;
			return finalPrice > 0;
		},
		{
			message: "Final price must be greater than 0",
			path: ["discount"],
		},
	);

export const suruyZodAddProduct = createFormAction(
	async (formData) => {
		const data = parseFormData(formData);
		const result = zodProductSchema.safeParse(data);

		if (!result.success) {
			return {
				success: false,
				errors: result.error.flatten().fieldErrors as Record<string, string[]>,
			};
		}

		return { success: true, data: result.data };
	},
	async (data) => {
		await new Promise((resolve) => setTimeout(resolve, 800));

		const finalPrice = data.price - (data.price * data.discount) / 100;

		actionLogger.info("Product added", {
			name: data.name,
			price: data.price,
			discount: data.discount,
			finalPrice,
			category: data.category,
			inStock: data.inStock === "on",
			action: "suruyZodAddProduct",
		});

		return {
			success: true,
			data: {
				productId: `prod_${Date.now()}`,
				name: data.name,
				price: data.price,
				discount: data.discount,
				finalPrice,
				category: data.category,
				inStock: data.inStock === "on",
			},
		};
	},
);
