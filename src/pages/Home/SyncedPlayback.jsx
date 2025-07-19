import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCameras } from "../../store/slice/cameraSlice";

const SyncedPlayback = ({ cameraId, videoRef }) => {
  // const videoRef = useRef(null);
  const [conn, setConn] = useState(null);
  const [pc, setPc] = useState(null);
  const { cameras } = useSelector((state) => state.cameras);
  const [conString, setConString] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCameras());
  }, [dispatch]);

  // useEffect(() => {
  //   const selectedCamera = cameras.find((camera) => camera.id === cameraId);
  //   setConString(selectedCamera.connectionString);
  // }, [cameraId]);

  useEffect(() => {
    // const newConn = new WebSocket(
    //   "ws://192.168.0.127:8091/eda8debf-1948-4c3d-ac10-3aae480a3c36"
    // );
    // const selectedCamera = cameras.find((camera) => camera.id === cameraId);
    // if (selectedCamera) {
    //   const newConn = new WebSocket(selectedCamera.connectionString);
    //   const newPc = new RTCPeerConnection();
    //   setConn(newConn);
    //   setPc(newPc);
    //   newConn.onopen = () =>
    //     console.log("WebSocket connected, waiting for offer");
    //   newConn.onclose = () => console.log("WebSocket connection closed");
    //   newConn.onmessage = async (evt) => {
    //     const msg = JSON.parse(evt.data);
    //     if (!msg) return console.log("Failed to parse message");
    //     switch (msg.event) {
    //       case "offer":
    //         console.log("Received offer from server");
    //         await newPc.setRemoteDescription(
    //           new RTCSessionDescription(msg.data)
    //         );
    //         const answer = await newPc.createAnswer();
    //         await newPc.setLocalDescription(answer);
    //         newConn.send(JSON.stringify({ event: "answer", data: answer }));
    //         console.log("Sent SDP answer");
    //         break;
    //       case "candidate":
    //         console.log("Received ICE candidate from server");
    //         await newPc.addIceCandidate(new RTCIceCandidate(msg.data));
    //         break;
    //       default:
    //         break;
    //     }
    //   };
    //   newPc.ontrack = (event) => {
    //     console.log("Track received:", event.track.kind);
    //     if (event.track.kind === "video" && videoRef.current) {
    //       videoRef.current.srcObject = event.streams[0];
    //     }
    //   };
    //   newPc.onicecandidate = (event) => {
    //     if (event.candidate) {
    //       newConn.send(
    //         JSON.stringify({ event: "candidate", data: event.candidate })
    //       );
    //     }
    //   };
    //   return () => {
    //     newConn.close();
    //     newPc.close();
    //   };
    // }
  }, [cameraId]);

  // useEffect(() => {
  //   if (videoRef.current) {
  //     videoRef.current.onloadedmetadata = () => {
  //       console.log("Video metadata loaded");
  //       videoRef.current
  //         .play()
  //         .catch((e) => console.log("Video playback failed", e));
  //     };
  //   }
  // }, [cameraId, videoRef]);

  return (
    <>
      {/* <video
        ref={videoRef}
        autoPlay
        loop
        muted
        style={{
          width: "100%",
          height: "100%",
          border: "0",
          objectFit: "cover", // or "contain" based on your requirement
        }}
        
      /> */}
      {/* <img style={{
        width: "100%",
        height: "100%",
        border: "0",
        objectFit: "cover", // or "contain" based on your requirement
      }} className="hoverShow" src="http://192.168.0.127:8091/eda8debf-1948-4c3d-ac10-3aae480a3c36/raw" width="640" height="480"></img> */}
    </>
  );
};

export default SyncedPlayback;
