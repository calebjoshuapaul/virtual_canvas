"use client";

import { useEffect, useState } from "react";
import { HandLandmarker, WasmFileset } from "@mediapipe/tasks-vision";

import WebCam from "./WebCam";

export default function VirtualCanvas({ vision }: { vision: WasmFileset }) {
	const [handLandmarker, setHandLandMarker] = useState<HandLandmarker>();
	const [enablePredictions, setEnablePredictions] = useState<Boolean>(false);

	useEffect(() => {
		(async () => {
			const res = await HandLandmarker.createFromOptions(vision, {
				baseOptions: {
					modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
					delegate: "GPU",
				},
				numHands: 2,
				runningMode: "VIDEO",
			});
			setHandLandMarker(res);
		})();
	}, [vision]);

	return (
		<>
			<div className="grid grid-cols-2 grid-rows-1 gap-2 w-full h-full">
				<canvas
					width={"100%"}
					height={"100%"}
					className="border-2 border-gray-100 flex-1 h-full w-full bg-gray-50"
				/>
				{handLandmarker && (
					<WebCam
						handLandmarker={handLandmarker}
						enablePredictions={enablePredictions}
					/>
				)}
			</div>
			<button
				className="border-2 border-gray-100 p-2 hover:bg-gray-50/30"
				onClick={() => setEnablePredictions(!enablePredictions)}
			>
				{enablePredictions ? "Disable Predictions" : "Enable Predictions"}
			</button>
		</>
	);
}
