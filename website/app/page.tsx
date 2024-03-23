"use client";
import { useRef, useEffect, useState } from "react";

import MD5 from "md5";

async function urlToFile(url: string, filename: string, mimeType: string) {
  const response = await fetch(url);
  const data = await response.blob();
  return new File([data], filename, { type: mimeType });
}

export default function Home() {
  const videoRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  const [videoAvailable, setVideoAvailable] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [progress, setProgress] = useState({
    token: 0,
    upload: 0,
    scan: 0,
  });

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = function () {
              setVideoAvailable(true);
              videoRef.current.play();
            };
          }
        })
        .catch(function (err) {
          console.log("An error occurred: " + err);
        });
    }
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(
        videoRef.current,
        0,
        0,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight
      );
      const imgSrc = canvasRef.current.toDataURL("image/png").toString();

      videoRef.current.srcObject.getVideoTracks().forEach((track: any) => {
        track.stop();
      });

      startSequance(imgSrc);
    }
  };

  async function startSequance(imgSrc: string) {
    setCapturedImage(imgSrc);

    setProgress({
      scan: 0,
      token: 0,
      upload: 0,
    });

    const { hash } = await generateToken((n) =>
      setProgress({ ...progress, token: Math.min((n / 1000) * 100, 90) })
    );
    setProgress({ ...progress, token: 100 });

    await uploadImage(imgSrc);

    await keepCheckingScan(hash);

    setTimeout(() => {
      window.open(
        "https://rnm.franceagrimer.fr/prix?FRUITS-ET-LEGUMES",
        "_blank"
      );
    }, 1000);
  }

  const uploadImage = async (capturedImage: string) => {
    const file = await urlToFile(capturedImage, "image.png", "image/png");

    const timer = setInterval(() => {
      console.log("hello");
      setProgress((p) => ({
        ...p,
        upload: Math.min(90, p.upload + Math.random() * 10 + 1),
      }));
    }, 50);

    return new Promise((r) => {
      setTimeout(() => {
        clearInterval(timer);
        setProgress((p) => ({ ...p, upload: 100 }));
        r(null);
      }, 2000);
    });
  };

  const keepCheckingScan = (hash: string) => {
    const timer = setInterval(() => {
      console.log("hello");
      setProgress((p) => ({
        ...p,
        scan: Math.min(90, p.scan + Math.random() * 10 + 1),
      }));
    }, 100);

    return new Promise((r) => {
      setTimeout(() => {
        clearInterval(timer);
        setProgress((p) => ({ ...p, scan: 100 }));
        r(null);
      }, 3000);
    });
  };

  return (
    <div className="flex text-zinc-900  items-center justify-center h-dvh  md:h-screen w-full p-4 md:px-0 ">
      <div className="container  shadow-lg overflow-hidden bg-white/90  rounded-lg h-full  w-full flex flex-col md:flex-row justify-between ">
        <div className="flex-1 h-full flex flex-col shadow-md py-4 px-12">
          <h1 className="text-center text-xl md:text-3xl font-bold text-zinc-600 uppercase">
            Upload Image
          </h1>

          <div className="flex-1 flex overflow-hidden relative flex-col items-center justify-center my-4 md:my-12 w-full border-zinc-400 border-4 border-dashed rounded-xl ">
            <video
              hidden={!!capturedImage}
              className="absolute inset-0 w-full h-full"
              ref={videoRef}
            />

            <img
              className={
                "absolute object-fill  inset-0 w-full h-full " +
                (progress.scan < 100 ? "animate-pulse" : "")
              }
              hidden={!capturedImage}
              src={capturedImage!}
              alt=""
            />

            <canvas
              className="absolute inset-0 w-full h-full"
              ref={canvasRef}
              style={{ display: "none" }}
            />

            {!videoAvailable && !capturedImage && (
              <button className="relative text-white px-12 py-0.5 text-lg  overflow-hidden bg-blue-600 rounded-lg">
                <input
                  className="opacity-0 absolute z-10 inset-0"
                  type="file"
                  accept="image/*;capture=camera"
                  onChange={(event: any) => {
                    if (event.target.files.length > 0) {
                      debugger;
                      const file = event.target.files[0];
                      const imageUrl = URL.createObjectURL(file);

                      startSequance(imageUrl);
                    }
                  }}
                />
                Browse
              </button>
            )}
          </div>

          {videoAvailable && (
            <button
              onClick={captureImage}
              className="mt-2 mx-auto bg-blue-700 rounded-full text-white px-6 py-1 text-lg"
            >
              Capture
            </button>
          )}
        </div>

        <div className="flex flex-col space-y-12 justify-center  p-12 py-6  md:max-w-md bg-black/5 w-full">
          <Step name="Generating Token" progress={progress.token} />
          <Step name="Uploading Image" progress={progress.upload} />
          <Step name="Scanning" progress={progress.scan} />
        </div>
      </div>
    </div>
  );
}

function Step(props: { name: string; progress: number }) {
  return (
    <div className="flex w-full items-start space-x-6">
      <CircleProgress
        className="size-6 text-blue-700"
        progress={props.progress}
      />
      <h2 className="font-bold text-nowrap flex-1">{props.name}</h2>

      {props.progress > 99 && (
        <svg
          className="size-6 text-blue-700"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </div>
  );
}

function CircleProgress({ progress, className }: any) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = ((100 - progress) / 100) * circumference;

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="100"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 100 100"
      style={{ overflow: "visible" }} // Add this line
    >
      <circle
        className="text-zinc-300"
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        strokeWidth="20"
      />
      <circle
        className=""
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        strokeWidth="20"
        strokeDasharray={circumference}
        strokeDashoffset={progress > 99 ? 0 : progressOffset}
      />
    </svg>
  );
}

function generateToken(
  fct: (nonce: number) => void
): Promise<{ hash: string; timestamp: number; nonce: number }> {
  let nonce = 0;
  let timestamp = Date.now();

  return new Promise((resolve, reject) => {
    function attempt() {
      const data = `${timestamp}${nonce}`;
      const hash = MD5(data);
      if (/^([abc]{4})/.test(hash)) {
        // confirm("Token generated: " + hash);
        resolve({ hash, timestamp, nonce });
      } else {
        nonce++;
        fct(nonce);
        console.log(nonce, hash);
        setTimeout(attempt);
      }
    }
    attempt();
  });
}
