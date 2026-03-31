import { FilesetResolver } from "@mediapipe/tasks-vision";
import React from "react";
import VirtualCanvas from "./VirtualCanvas";

export default async function VirtualCanvasContainer() {
	const basePath =
		process.env.NODE_ENV === "development"
			? ""
			: "/virtual_canvas";
	const vision = await FilesetResolver.forVisionTasks(`${basePath}/wasm`);
	return <VirtualCanvas vision={vision} />;
}
