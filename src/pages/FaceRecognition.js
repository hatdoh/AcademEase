import React, { useState, useEffect, useRef } from "react";
import { db } from '../config/firebase';
import * as faceapi from 'face-api.js';

function FaceRecognition() {
    const [initializing, setInitializing] = useState(true);
    const videoRef = useRef();
    const canvasRef = useRef();

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = process.env.PUBLIC_URL + '/models';
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            ]);
            startVideo();
        }
        loadModels();
    }, []);

    const startVideo = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: {}
            }).then(stream => {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }).catch(err => {
                console.error("Error accessing the camera: ", err);
                alert("Error accessing the camera: " + err.message);
            });
        } else {
            alert("getUserMedia is not supported by your browser or device.");
            console.error("getUserMedia is not supported by your browser or device.");
        }
    }
    

    const handleVideoOnPlay = () => {
        const updateCanvasSize = () => {
            const video = videoRef.current;
            const displaySize = {
                width: video.videoWidth,
                height: video.videoHeight
            };
            faceapi.matchDimensions(canvasRef.current, displaySize);
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
        };

        setInterval(async () => {
            if (initializing) {
                setInitializing(false);
            }
            
            const video = videoRef.current;
            updateCanvasSize();

            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            const resizedDetections = faceapi.resizeResults(detections, {
                width: video.videoWidth,
                height: video.videoHeight
            });

            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);

            resizedDetections.forEach(detection => {
                const { x, y, width, height } = detection.detection.box;
                ctx.strokeStyle = "#00FF00"; // Green box color
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);

                // Replace the score with "Unknown"
                ctx.fillStyle = "#00FF00"; // Green text color
                ctx.font = "20px Arial";
                ctx.fillText("Unknown", x, y - 10);
            });

        }, 100);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
            <span>{initializing ? 'Initializing' : 'Ready'}</span>
            <div style={{ position: 'relative', width: '100%', maxWidth: '100%', textAlign: 'center' }}>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    onPlay={handleVideoOnPlay}
                    style={{ width: '100%', height: 'auto' }}
                />
                <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
            </div>
        </div>
    );
}

export default FaceRecognition;
