"use client";
import React, { RefObject } from "react";

export default function WebCam({
	camRef,
	canvasRef,
}: {
	camRef: RefObject<HTMLVideoElement>;
	canvasRef: RefObject<HTMLCanvasElement>;
}) {
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
