import { FilesetResolver } from "@mediapipe/tasks-vision";
import React from "react";
import VirtualCanvas from "./VirtualCanvas";

export default async function VirtualCanvasContainer() {
	const vision = await FilesetResolver.forVisionTasks(
		"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
	);
	return <VirtualCanvas vision={vision} />;
}
