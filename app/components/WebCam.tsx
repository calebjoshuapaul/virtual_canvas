"use client";
import { DrawingUtils, GestureRecognizer } from "@mediapipe/tasks-vision";
import React, { useEffect, useRef, useCallback } from "react";

const videoConstraints = {
	facingMode: "user",
	video: true,
};

async function predictWebcam(
	videoElement: HTMLVideoElement,
	canvasElement: HTMLCanvasElement,
	lastVideoTime: number,
	gestureRecognizer: GestureRecognizer
) {
	const canvasCtx = canvasElement.getContext("2d");
	if (!canvasCtx) return;
	const drawingUtils = new DrawingUtils(canvasCtx);

	let results;
	let startTimeMs = Date.now();

	if (lastVideoTime !== videoElement.currentTime) {
		lastVideoTime = videoElement.currentTime;
		results = await gestureRecognizer.recognizeForVideo(
			videoElement,
			startTimeMs
		);
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
		canvasCtx.restore();
	}

	window.requestAnimationFrame(() =>
		predictWebcam(videoElement, canvasElement, lastVideoTime, gestureRecognizer)
	);
}

export default function WebCam({
	gestureRecognizer,
	enablePredictions,
}: {
	gestureRecognizer: GestureRecognizer;
	enablePredictions: Boolean;
}) {
	const camRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	let lastVideoTime = -1;

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({
				video: videoConstraints,
			})
			.then((stream) => {
				if (camRef.current) {
					camRef.current.srcObject = stream;
					camRef.current.onloadedmetadata = () => {
						camRef.current?.play();
					};
				}
			})
			.catch((e) => {
				console.log(e);
			});
	}, []);

	useEffect(() => {
		if (enablePredictions && camRef.current && canvasRef.current) {
			predictWebcam(
				camRef.current,
				canvasRef.current,
				lastVideoTime,
				gestureRecognizer
			);
		}
	}, [enablePredictions, gestureRecognizer, lastVideoTime]);

	return (
		<div className="relative w-full h-full border-2 scale-x-[-1] border-gray-100 ">
			<canvas
				ref={canvasRef}
				width={"100%"}
				height={"100%"}
				className="absolute h-full w-full top-0 left-0"
			></canvas>
			<video
				ref={camRef}
				width={"100%"}
				height={"100%"}
				className="flex-1 h-full w-full"
			></video>
		</div>
	);
}
