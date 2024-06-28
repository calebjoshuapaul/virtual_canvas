"use client";

import { useEffect, useRef, useState } from "react";
import { GestureRecognizer, HandLandmarker } from "@mediapipe/tasks-vision";

import WebCam from "./WebCam";

export default function VirtualCanvas({ vision }: { vision: any }) {
	const resCanvas = useRef<HTMLCanvasElement>(null);
	const [gestureRecognizer, setGestureRecognizer] =
		useState<GestureRecognizer>();

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
		<div className="flex gap-2 flex-wrap">
			<canvas
				ref={resCanvas}
				className="border-2 border-gray-100 flex-1 h-96 w-[450px] max-w-[450px] bg-gray-50"
			/>
			{gestureRecognizer && (
				<WebCam
					resCanvas={resCanvas}
					gestureRecognizer={gestureRecognizer}
				/>
			)}
		</div>
	);
}
