"use client";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { HandLandmarker } from "@mediapipe/tasks-vision";
import React, { useEffect, useRef } from "react";

const videoConstraints = {
	facingMode: "user",
	video: true,
};

function drawPoint(ctx: any, x: any, y: any, r: any, color: any) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}

async function predictWebcam(
	videoElement: HTMLVideoElement,
	canvasElement: HTMLCanvasElement,
	lastVideoTime: number,
	handLandmarker: HandLandmarker
) {
	const canvasCtx = canvasElement.getContext("2d");
	if (!canvasCtx) return;

	let results;
	let startTimeMs = performance.now();

	if (lastVideoTime !== videoElement.currentTime) {
		lastVideoTime = videoElement.currentTime;
		results = await handLandmarker.detectForVideo(videoElement, startTimeMs);
	}

	if (results?.landmarks) {
		canvasCtx.save();
		canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

		console.log(results);
		for (const landmarks of results.landmarks) {
			// drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
			// 	color: "#00FF00",
			// 	lineWidth: 5,
			// 	radius: 5,
			// 	visibilityMin: 5,
			// });
			// drawLandmarks(canvasCtx, landmarks, {
			// 	color: "#FF0000",
			// 	lineWidth: 2,
			// 	visibilityMin: 50,
			// });
			for (let i = 0; i < landmarks.length; i++) {
				drawPoint(
					canvasCtx,
					landmarks[i].x * canvasElement.width,
					landmarks[i].y * canvasElement.height,
					1,
					"#00FF00"
				);
			}
		}
		canvasCtx.restore();
	}

	window.requestAnimationFrame(() =>
		predictWebcam(videoElement, canvasElement, lastVideoTime, handLandmarker)
	);
}

export default function WebCam({
	handLandmarker,
	enablePredictions,
}: {
	handLandmarker: HandLandmarker;
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
				handLandmarker
			);
		}
	}, [enablePredictions, handLandmarker, lastVideoTime]);

	return (
		<div className="relative w-full h-full border-2 border-gray-100 ">
			<canvas
				ref={canvasRef}
				width={"100%"}
				height={"100%"}
				className="absolute h-full w-full top-0 left-0 bg-white/50"
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
