import type { Metadata } from "next";
import "./globals.css";
import YakutianNight from "./components/YakutianNight";

export const metadata: Metadata = {
	title: "Yedoma Labs Demo",
	description:
		"Comprehensive demo of Yedoma Labs TypeScript ecosystem for Next.js",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<YakutianNight />
				{children}
			</body>
		</html>
	);
}
