"use server";

import {
	createFormAction,
	createSimpleAction,
	parseFormData,
	schema,
} from "@yedoma-labs/suruy-form-actions";
import { env } from "@/env";
import { actionLogger } from "@/lib/logger";

// Example 1: Using built-in schema validator (zero-dependency)
const contactSchema = schema<{
	name: string;
	email: string;
	message: string;
	priority: string;
}>({
	name: {
		type: "string",
		required: true,
		min: 2,
		max: 50,
		custom: (value: unknown) => {
			if (typeof value === "string" && !/^[a-zA-Z\s]+$/.test(value)) {
				return "Name can only contain letters and spaces";
			}
			return null;
		},
	},
	email: {
		type: "email",
		required: true,
	},
	message: {
		type: "string",
		required: true,
		min: 10,
		max: 500,
	},
	priority: {
		type: "string",
		required: true,
	},
});

export const suruySendContactMessage = createFormAction(
	async (formData) => contactSchema.safeParse(parseFormData(formData)),
	async (data) => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		actionLogger.info("Contact form submitted", {
			name: data.name,
			email: data.email,
			priority: data.priority,
			apiUrl: env.NEXT_PUBLIC_API_URL,
			action: "suruySendContactMessage",
		});

		// In production, would make actual API call
		return {
			success: true,
			data: {
				messageId: `msg_${Date.now()}`,
				submittedAt: new Date().toISOString(),
				name: data.name,
			},
		};
	},
);

// Example 2: Simple action without validation (for quick forms)
export const suruyQuickSubscribe = createSimpleAction(async (formData) => {
	const email = formData.get("email") as string;

	if (!email?.includes("@")) {
		return {
			success: false,
			errors: { email: ["Please enter a valid email address"] },
		};
	}

	await new Promise((resolve) => setTimeout(resolve, 500));

	actionLogger.info("Newsletter subscription", {
		email,
		action: "suruyQuickSubscribe",
	});

	return {
		success: true,
		data: { email, subscribedAt: new Date().toISOString() },
	};
});

// Example 3: File upload with validation
const uploadSchema = schema<{
	title: string;
	description: string;
}>({
	title: {
		type: "string",
		required: true,
		min: 3,
		max: 100,
	},
	description: {
		type: "string",
		required: false,
		max: 500,
	},
});

export const suruyUploadFile = createFormAction(
	async (formData) => {
		const data = parseFormData(formData);
		const result = uploadSchema.safeParse(data);

		if (!result.success) {
			return { success: false, errors: result.errors };
		}

		// Additional file validation
		const file = formData.get("file") as File | null;

		if (!file || file.size === 0) {
			return {
				success: false,
				errors: { file: ["Please select a file to upload"] },
			};
		}

		if (file.size > 5_000_000) {
			return {
				success: false,
				errors: { file: ["File size must be less than 5MB"] },
			};
		}

		const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
		if (!allowedTypes.includes(file.type)) {
			return {
				success: false,
				errors: { file: ["Only JPEG, PNG, GIF, and WebP images are allowed"] },
			};
		}

		return { success: true, data: { ...result.data, file } };
	},
	async (data) => {
		await new Promise((resolve) => setTimeout(resolve, 1500));

		const file = data.file as File;

		actionLogger.info("File upload", {
			title: data.title,
			description: data.description,
			fileName: file.name,
			fileSize: file.size,
			fileType: file.type,
			action: "suruyUploadFile",
		});

		// In production, upload to S3/R2/etc
		const fileUrl = `/uploads/${Date.now()}-${file.name}`;

		return {
			success: true,
			data: {
				fileUrl,
				fileName: file.name,
				fileSize: file.size,
				uploadedAt: new Date().toISOString(),
			},
		};
	},
);

// Example 4: Multi-step registration with password confirmation
const registerSchema = schema<{
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
	acceptTerms: string;
}>({
	username: {
		type: "string",
		required: true,
		min: 3,
		max: 20,
		custom: (value: unknown) => {
			if (typeof value === "string" && !/^[a-z0-9_]+$/.test(value)) {
				return "Username can only contain lowercase letters, numbers, and underscores";
			}
			return null;
		},
	},
	email: {
		type: "email",
		required: true,
	},
	password: {
		type: "string",
		required: true,
		min: 8,
		custom: (value: unknown) => {
			if (
				typeof value === "string" &&
				!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)
			) {
				return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
			}
			return null;
		},
	},
	confirmPassword: {
		type: "string",
		required: true,
	},
	acceptTerms: {
		type: "string",
		required: true,
		custom: (value: unknown) => {
			if (typeof value === "string" && value !== "on" && value !== "true") {
				return "You must accept the terms and conditions";
			}
			return null;
		},
	},
});

export const suruyRegisterUser = createFormAction(
	async (formData) => {
		const data = parseFormData(formData);
		const result = registerSchema.safeParse(data);

		if (!result.success) {
			return { success: false, errors: result.errors };
		}

		// Cross-field validation
		if (result.data.password !== result.data.confirmPassword) {
			return {
				success: false,
				errors: { confirmPassword: ["Passwords do not match"] },
			};
		}

		return { success: true, data: result.data };
	},
	async (data) => {
		await new Promise((resolve) => setTimeout(resolve, 1200));

		actionLogger.info("User registration", {
			username: data.username,
			email: data.email,
			action: "suruyRegisterUser",
		});

		// In production, create user in database
		return {
			success: true,
			data: {
				userId: `user_${Date.now()}`,
				username: data.username,
				email: data.email,
				createdAt: new Date().toISOString(),
			},
		};
	},
);

// Example 5: Dynamic form with array fields
export const suruyAddTags = createSimpleAction(async (formData) => {
	const tags = formData.getAll("tags[]") as string[];
	const category = formData.get("category") as string;

	if (!category) {
		return {
			success: false,
			errors: { category: ["Category is required"] } as Record<
				string,
				string[]
			>,
		};
	}

	if (tags.length === 0) {
		return {
			success: false,
			errors: { tags: ["At least one tag is required"] } as Record<
				string,
				string[]
			>,
		};
	}

	await new Promise((resolve) => setTimeout(resolve, 600));

	actionLogger.info("Tags added", {
		category,
		tags,
		tagCount: tags.length,
		action: "suruyAddTags",
	});

	return {
		success: true,
		data: {
			category,
			tags,
			count: tags.length,
			createdAt: new Date().toISOString(),
		},
	};
});
