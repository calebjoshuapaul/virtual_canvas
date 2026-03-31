import { FilesetResolver } from "@mediapipe/tasks-vision";
import React from "react";
import VirtualCanvas from "./VirtualCanvas";

export default async function VirtualCanvasContainer() {
	const vision = await FilesetResolver.forVisionTasks("/wasm");
	return <VirtualCanvas vision={vision} />;
}
