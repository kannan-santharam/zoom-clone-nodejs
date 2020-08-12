const socket = io("/");
const videoPanel = document.getElementById("video-panel");
const videoBox = document.createElement("video");
const peers = {};
videoBox.muted = true;
const userPeer = new Peer(undefined, {
    host: "/",
    port: "3001"
});
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(videoBox, stream);
    userPeer.on('call', call =>{
        call.answer(stream);
        const video = document.createElement("video");
        call.on('stream', userVideoStream =>{
            addVideoStream(video,userVideoStream);
        })
    })
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });
});
userPeer.on("open", id => {
    socket.emit("join-room", ROOM_ID, id);
})


socket.on('user-disconnect', userId => {
    if(peers[userId]){
        peers[userId].close()
    }
    console.log('user-disconnected ', userId);
})
function connectToNewUser(userId, stream){
    const callUser = userPeer.call(userId,stream);
    const userVideo = document.createElement("video");
    callUser.on('stream',userVideoStream =>{
        addVideoStream(userVideo, userVideoStream);
    });
    callUser.on('close',() =>{
        userVideo.remove();
    });
    peers[userId] = callUser;
}
function addVideoStream(video, stream) {

    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    });

    videoPanel.append(video);
}