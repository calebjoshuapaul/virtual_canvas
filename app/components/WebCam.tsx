"use client";
import { DrawingUtils, GestureRecognizer } from "@mediapipe/tasks-vision";
import React, { useEffect, useRef, RefObject, useState } from "react";

const videoConstraints = {
	facingMode: "user",
	video: true,
};

async function predictWebcam(
	videoElement: HTMLVideoElement,
	canvasElement: HTMLCanvasElement,
	lastVideoTime: number,
	gestureRecognizer: GestureRecognizer,
	setLastVideoTime: (time: number) => void,
	resCanvas: RefObject<HTMLCanvasElement>
) {
	const height = 384;
	const width = 450;

	const canvasCtx = canvasElement.getContext("2d");
	if (!canvasCtx) return;
	const drawingUtils = new DrawingUtils(canvasCtx);

	let results;
	let startTimeMs = Date.now();

	console.log(
		Math.round(lastVideoTime),
		"....",
		Math.round(videoElement.currentTime)
	);
	if (Math.round(lastVideoTime) !== Math.round(videoElement.currentTime)) {
		setLastVideoTime(Math.round(videoElement.currentTime));
		results = gestureRecognizer.recognizeForVideo(videoElement, startTimeMs);
	}
	if (results?.landmarks) {
		canvasCtx.save();
		canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
		canvasCtx.scale(1, 1);

		for (const landmarks of results.landmarks) {
			drawingUtils.drawConnectors(
				landmarks,
				GestureRecognizer.HAND_CONNECTIONS,
				{
					color: "#00FF00",
					lineWidth: 1.5,
				}
			);
			drawingUtils.drawLandmarks(landmarks, {
				color: "#FF0000",
				lineWidth: 1,
				radius: 1,
			});
		}
		const resCanvasElement = resCanvas.current;
		if (results.gestures.length > 0 && resCanvasElement) {
			resCanvasElement.height = height;
			resCanvasElement.width = width;
			const resCanvasCtx = resCanvasElement.getContext("2d");
			if (!resCanvasCtx) return;
			const categoryName = results.gestures[0][0].categoryName;
			const categoryScore = (results.gestures[0][0].score * 100).toFixed(2);
			const handedness = results.handednesses[0][0].displayName;

			resCanvasCtx.save();
			resCanvasCtx.clearRect(
				0,
				0,
				resCanvasElement.width,
				resCanvasElement.height
			);
			resCanvasCtx.scale(2, 2);
			resCanvasCtx.fillText(`GestureRecognizer: ${categoryName}`, 10, 20);
			resCanvasCtx.fillText(`Confidence: ${categoryScore}`, 10, 40);
			resCanvasCtx.fillText(`Handedness: ${handedness}`, 10, 60);
			resCanvasCtx.restore();
		}

		canvasCtx.restore();
	}

	window.requestAnimationFrame(() =>
		predictWebcam(
			videoElement,
			canvasElement,
			lastVideoTime,
			gestureRecognizer,
			setLastVideoTime,
			resCanvas
		)
	);
}

export default function WebCam({
	gestureRecognizer,
	resCanvas,
}: {
	gestureRecognizer: GestureRecognizer;
	resCanvas: RefObject<HTMLCanvasElement>;
}) {
	const camRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [lastVideoTime, setLastVideoTime] = useState(0);

	useEffect(() => {
		const startPrediction = async () => {
			if (camRef.current && canvasRef.current) {
				predictWebcam(
					camRef.current,
					canvasRef.current,
					lastVideoTime,
					gestureRecognizer,
					setLastVideoTime,
					resCanvas
				);
			}
		};

		navigator.mediaDevices
			.getUserMedia({ video: videoConstraints })
			.then((stream) => {
				if (camRef.current) {
					camRef.current.srcObject = stream;
					camRef.current.onloadedmetadata = () => {
						camRef.current?.play();
						startPrediction();
					};
				}
			})
			.catch((e) => {
				console.log(e);
			});
	}, [gestureRecognizer, resCanvas]);

	return (
		<div className="relative min-w-[450px] flex-1 max-w-[450px] h-96 border-2 scale-x-[-1] border-gray-100">
			<canvas
				ref={canvasRef}
				className="absolute w-[450px] max-w-[450px] h-96 top-0 left-0"
			></canvas>
			<video
				ref={camRef}
				className="w-full h-full"
			></video>
		</div>
	);
}
