"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import {
	DrawingUtils,
	GestureRecognizer,
	GestureRecognizerResult,
	NormalizedLandmark,
} from "@mediapipe/tasks-vision";

import WebCam from "./WebCam";

const lastVideoTimeM = 0;

interface WasmFileset {
	/** The path to the Wasm loader script. */
	wasmLoaderPath: string;
	/** The path to the Wasm binary. */
	wasmBinaryPath: string;
	/** The optional path to the asset loader script. */
	assetLoaderPath?: string;
	/** The optional path to the assets binary. */
	assetBinaryPath?: string;
}
function drawHandsOnVideo(
	ctx: CanvasRenderingContext2D,
	canvasElement: HTMLCanvasElement,
	landmarks: NormalizedLandmark[][]
) {
	const drawingUtils = new DrawingUtils(ctx);

	ctx.save();
	ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
	ctx.scale(1, 1);

	for (const landmark of landmarks) {
		drawingUtils.drawConnectors(landmark, GestureRecognizer.HAND_CONNECTIONS, {
			color: "#00FF00",
			lineWidth: 1.5,
		});
		drawingUtils.drawLandmarks(landmark, {
			color: "#FF0000",
			lineWidth: 1,
			radius: 1,
		});
	}

	ctx.restore();
}

function drawResultsOnCanvas(
	ctx: CanvasRenderingContext2D,
	canvasElement: HTMLCanvasElement,
	results: GestureRecognizerResult
) {
	if (results.gestures.length < 1) return;
	const categoryName = results.gestures[0][0].categoryName;
	const categoryScore = (results.gestures[0][0].score * 100).toFixed(2);
	const handedness = results.handedness[0][0].displayName;

	ctx.save();
	ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
	ctx.scale(1, 1);

	ctx.fillText(`GestureRecognizer: ${categoryName}`, 10, 20);
	ctx.fillText(`Confidence: ${categoryScore}`, 10, 40);
	ctx.fillText(`Handedness: ${handedness}`, 10, 60);

	ctx.restore();
}

const predictWebcam = (
	gestureRecognizer: GestureRecognizer,
	videoElement: HTMLVideoElement,
	canvasElement: HTMLCanvasElement,
	resCanvasElement: HTMLCanvasElement,
	lastVideoTime: number = lastVideoTimeM
) => {
	const canvasCtx = canvasElement?.getContext("2d");
	if (!canvasCtx) return;

	const resCanvasCtx = resCanvasElement.getContext("2d");
	if (!resCanvasCtx) return;

	let startTimeMs = Date.now();

	const results = gestureRecognizer.recognizeForVideo(
		videoElement,
		startTimeMs
	);

	if (results && results?.landmarks) {
		drawHandsOnVideo(canvasCtx, canvasElement, results.landmarks);
		drawResultsOnCanvas(resCanvasCtx, resCanvasElement, results);
	}

	window.requestAnimationFrame(() =>
		predictWebcam(
			gestureRecognizer,
			videoElement,
			canvasElement,
			resCanvasElement,
			lastVideoTime
		)
	);
};

export default function VirtualCanvas({ vision }: { vision: WasmFileset }) {
	const camRef = useRef<HTMLVideoElement>(null);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const resCanvasRef = useRef<HTMLCanvasElement>(null);

	const [gestureRecognizer, setGestureRecognizer] =
		useState<GestureRecognizer>();
	const [isCamMounted, setIsCamMounted] = useState(false);

	useEffect(() => {
		if (
			camRef.current &&
			canvasRef.current &&
			resCanvasRef.current &&
			isCamMounted &&
			gestureRecognizer
		) {
			predictWebcam(
				gestureRecognizer,
				camRef.current,
				canvasRef.current,
				resCanvasRef.current
			);
		}
	}, [isCamMounted, gestureRecognizer]);

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

	useEffect(() => {
		if (camRef) {
			navigator.mediaDevices
				.getUserMedia({ video: { facingMode: "user" } })
				.then((stream) => {
					if (camRef.current) {
						camRef.current.srcObject = stream;
						camRef.current.onloadedmetadata = () => {
							setIsCamMounted(true);
							camRef.current?.play();
							//Start gesture predict function
						};
					}
				})
				.catch((e) => {
					console.log(e);
				});
		}
	}, [camRef]);

	if (gestureRecognizer === undefined) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex gap-2 flex-wrap">
			<Suspense
				fallback={<div>Loading...</div>}
				key={"resCanvas"}
			>
				<canvas
					ref={resCanvasRef}
					className="border-2 border-gray-100 flex-1 h-96 w-[450px] max-w-[450px] bg-gray-50"
				/>
			</Suspense>
			<Suspense
				fallback={<div>Loading...</div>}
				key={"webCam"}
			>
				<WebCam
					camRef={camRef}
					canvasRef={canvasRef}
				/>
			</Suspense>
		</div>
	);
}
