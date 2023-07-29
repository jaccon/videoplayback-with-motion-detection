// JavaScript code

const video = document.getElementById('video');
const webcam = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let handModel;
let prevKeypoints = null;
let punchCount = 0; // Variable to store the punch count
const punchThreshold = 70; // Adjust this value as needed for punch detection
const animationImage = document.getElementById('animationImage');
const punchCountElement = document.getElementById('punchCount');

// Load the handpose model
handpose.load().then(model => {
  handModel = model;
  detectHand();
});

// Access the webcam and stream video
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    webcam.srcObject = stream;
    webcam.play();
  })
  .catch(err => console.error('Error accessing webcam:', err));

function calculateDistance(p1, p2) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function detectPunch(keypoints) {
  // Calculate distance between initial hand position (keypoint index 0) and current position (keypoint index 9)
  const distance = calculateDistance(keypoints[0], keypoints[9]);
  return distance > punchThreshold;
}

function checkPunchCount() {
  if (punchCount >= 1000) {
    animationImage.style.display = 'block';
    animationImage.style.left = 'calc(100% + 200px)'; /* Adjust the distance of cross as needed */
  }
}

function moveSpaceshipToRight() {
  animationImage.style.display = 'block';
  animationImage.style.left = '0';
}

function detectHand() {
  handModel.estimateHands(webcam).then(results => {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (results.length === 0) {
      console.log('No hand detected');
      // If there's no hand, pause the video playback
      video.pause();
      prevKeypoints = null;
    } else {
      console.log('Hand detected');
      const keypoints = results[0].landmarks;

      // Calculate hand movement
      if (prevKeypoints) {
        const movement = calculateDistance(keypoints[4], prevKeypoints[4]);
        console.log('Hand movement:', movement);

        // Detect a punch-like movement and play the video
        if (detectPunch(keypoints)) {
          video.play();
          punchCount++; // Increment the punch count
          punchCountElement.textContent = `Point(s): ${punchCount}`; // Update the h1 element
          checkPunchCount(); // Check if the punch count reaches 1000 for animation
        } else {
          moveSpaceshipToRight(); // Move the spaceship when a hand is detected
        }
      }
      prevKeypoints = keypoints;

      // Draw hand keypoints on the canvas
      keypoints.forEach(point => {
        const [x, y] = point;
        context.beginPath();
        context.arc(x, y, 5, 0, 2 * Math.PI);
        context.fillStyle = 'red';
        context.fill();
      });
    }
    requestAnimationFrame(detectHand);
  });
}
