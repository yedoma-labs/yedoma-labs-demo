"use server";

import { actionLogger } from "@/lib/logger";

type ActionResult<T = unknown> = {
	success: boolean;
	errors?: Record<string, string[]>;
	data?: T;
	message?: string;
};

// Demo: useServerAction - simple server action
export async function incrementLikes(data: {
	count: number;
}): Promise<ActionResult<{ count: number }>> {
	await new Promise((resolve) => setTimeout(resolve, 500));

	return {
		success: true,
		data: {
			count: data.count + 1,
		},
	};
}

// Demo: Optimistic updates
export async function addTodoOptimistic(data: {
	text: string;
}): Promise<ActionResult> {
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Simulate random failures for demo
	if (Math.random() > 0.8) {
		actionLogger.warn("Simulated failure for rollback demo", {
			text: data.text,
			action: "addTodoOptimistic",
		});
		return {
			success: false,
			message: "Simulated failure - this tests rollback!",
		};
	}

	actionLogger.info("Todo added", {
		text: data.text,
		action: "addTodoOptimistic",
	});

	return {
		success: true,
		message: "Todo added successfully",
		data: { text: data.text, timestamp: new Date().toISOString() },
	};
}
