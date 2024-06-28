"use client";

import { useEffect, useState } from "react";
import { GestureRecognizer, HandLandmarker } from "@mediapipe/tasks-vision";

import WebCam from "./WebCam";

export default function VirtualCanvas({ vision }: { vision: any }) {
	const [gestureRecognizer, setGestureRecognizer] =
		useState<GestureRecognizer>();
	const [enablePredictions, setEnablePredictions] = useState<Boolean>(false);

	useEffect(() => {
		(async () => {
			const res = await GestureRecognizer.createFromOptions(vision, {
				baseOptions: {
					modelAssetPath:
						"https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
					delegate: "GPU",
				},
				numHands: 2,
				runningMode: "VIDEO",
			});
			setGestureRecognizer(res);
		})();
	}, [vision]);

	return (
		<>
			<div className="grid grid-cols-2 grid-rows-1 h-[380px] gap-2 w-full ">
				<canvas
					width={"100%"}
					height={"100%"}
					className="border-2 border-gray-100 flex-1 h-full w-full bg-gray-50"
				/>
				{gestureRecognizer && (
					<WebCam
						gestureRecognizer={gestureRecognizer}
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
