"use client";

import { createStore } from "@yedoma-labs/ichchi-state";
import { useEffect, useState } from "react";
import { storeLogger } from "./clientLogger";

export interface FormState {
	submissionCount: number;
	lastSubmittedName: string | null;
	recentSubmissions: Array<{
		timestamp: string;
		name: string;
	}>;
}

const initialState: FormState = {
	submissionCount: 0,
	lastSubmittedName: null,
	recentSubmissions: [],
};

export const formStore = createStore<FormState>(initialState, {
	devtools: typeof window !== "undefined",
	name: "FormStore",
	...(typeof window !== "undefined" && {
		persist: {
			key: "yedoma-labs-demo-state",
			storage: window.localStorage,
		},
	}),
});

// Custom React hook for the store
export const useFormState = () => {
	const [state, setState] = useState(formStore.getState());

	useEffect(() => {
		storeLogger.debug("Subscribing to store");
		const unsubscribe = formStore.subscribe((newState) => {
			storeLogger.debug("Store updated", { newState });
			setState(newState);
		});
		return () => {
			storeLogger.debug("Unsubscribing from store");
			unsubscribe();
		};
	}, []);

	return state;
};

// Actions
export const incrementSubmissionCount = () => {
	formStore.setState((state) => ({
		submissionCount: state.submissionCount + 1,
	}));
};

export const recordSubmission = (name: string) => {
	storeLogger.info("Recording form submission", { name });
	const currentState = formStore.getState();
	storeLogger.debug("Current state before update", { currentState });

	formStore.setState((state) => {
		const newState = {
			lastSubmittedName: name,
			submissionCount: state.submissionCount + 1,
			recentSubmissions: [
				{ timestamp: new Date().toISOString(), name },
				...state.recentSubmissions.slice(0, 4), // Keep last 5
			],
		};
		storeLogger.debug("Updated state", { newState });
		return newState;
	});

	storeLogger.debug("State after update", { state: formStore.getState() });
};

export const resetFormState = () => {
	formStore.setState(initialState);
};
