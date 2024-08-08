import React, { useState, useEffect, useRef } from "react";
import * as faceapi from 'face-api.js';

function FaceRecognition() {
    const videoHeight = 480;
    const videoWidth = 640;
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
        navigator.mediaDevices.getUserMedia({
            video: {}
        }).then(stream => {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }).catch(err => {
            console.error("Error accessing the camera: ", err);
        });
    }

    const handleVideoOnPlay = () => {
        setInterval(async () => {
            if (initializing) {
                setInitializing(false);
            }
            canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
            const displaySize = {
                width: videoWidth,
                height: videoHeight
            }
            faceapi.matchDimensions(canvasRef.current, displaySize);            
            const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            console.log(detections);
        }, 100);
    }

    return (
        <div className="ml-80 p-4">
             <div style={{ marginLeft: '20rem', padding: '1rem' }}>
                <span>{initializing ? 'Initializing' : 'Ready'}</span>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        height={videoHeight} 
                        width={videoWidth}
                        onPlay={handleVideoOnPlay}
                        style={{ textAlign: 'center' }}
                    />
                    <canvas ref={canvasRef} style={{ position: 'absolute' }} />
                </div>
            </div>
        </div>
    );
    
}

export default FaceRecognition;