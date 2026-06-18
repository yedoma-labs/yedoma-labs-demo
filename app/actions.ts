"use server";

import { z } from "zod";
import { actionLogger } from "@/lib/logger";
import { env } from "../env";

// Define validation schemas
const contactSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	message: z.string().min(10, "Message must be at least 10 characters"),
});

const newsletterSchema = z.object({
	email: z.string().email("Invalid email address"),
});

// Server action return type (matches sir-forms ServerActionResult)
type ActionResult<T = unknown> = {
	success: boolean;
	errors?: Record<string, string[]>;
	data?: T;
	message?: string;
};

// Contact form server action
export async function submitContactForm(
	data: Record<string, unknown>,
): Promise<ActionResult> {
	const formData = {
		name: String(data.name || ""),
		email: String(data.email || ""),
		message: String(data.message || ""),
	};

	// Validate
	const result = contactSchema.safeParse(formData);
	if (!result.success) {
		return {
			success: false,
			errors: result.error.flatten().fieldErrors,
		};
	}

	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Use environment variables (validated by bylyt-env-guard)
	const apiUrl = env.NEXT_PUBLIC_API_URL;
	const isDemoMode = env.DEMO_MODE;

	if (isDemoMode) {
		actionLogger.info("Demo mode: Form submission", {
			data: result.data,
			apiUrl,
			action: "submitContactForm",
		});

		return {
			success: true,
			message: `Thanks ${result.data.name}! In demo mode, form data logged to console.`,
			data: {
				submittedAt: new Date().toISOString(),
				name: result.data.name,
			},
		};
	}

	// In production, would make actual API call
	// await fetch(`${apiUrl}/contact`, {
	//   method: 'POST',
	//   body: JSON.stringify(result.data),
	// })

	return {
		success: true,
		message: `Thanks ${result.data.name}! We'll be in touch soon.`,
		data: {
			submittedAt: new Date().toISOString(),
			name: result.data.name,
		},
	};
}

// Newsletter signup action
export async function subscribeNewsletter(
	data: Record<string, unknown>,
): Promise<ActionResult> {
	const formData = {
		email: String(data.email || ""),
	};

	const result = newsletterSchema.safeParse(formData);
	if (!result.success) {
		return {
			success: false,
			errors: result.error.flatten().fieldErrors,
		};
	}

	await new Promise((resolve) => setTimeout(resolve, 500));

	actionLogger.info("Newsletter subscription", {
		email: result.data.email,
		action: "subscribeNewsletter",
	});

	return {
		success: true,
		message: "Subscribed successfully!",
	};
}
