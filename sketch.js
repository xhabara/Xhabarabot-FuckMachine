let soundFiles = ['1.mp3', '2.mp3', '3.mp3', '4.mp3'];

let sounds = [];
let numSounds = soundFiles.length;
let circleColors;
let circlePositions = [];
let circleRadius = 20;
let draggingCircle = -1;
let started = false;

let reverb;
let filter;
let distortion;

// Add a new global array to store the trails
let trails = [];

function preload() {
  for (let i = 0; i < numSounds; i++) {
    let sound = loadSound(soundFiles[i]);
    sounds.push(sound);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(24);
  noStroke();

  circleColors = [];

  for (let i = 0; i < numSounds; i++) {
    circleColors.push(color(random(10, 255), random(100, 255), random(100, 255)));
    let xPos = (width / (numSounds + 1)) * (i + 1);
    let yPos = height / 2;
    circlePositions.push(createVector(xPos, yPos));
  }

  reverb = new p5.Reverb();
  filter = new p5.LowPass();
  
  distortion = new p5.Distortion();

  document.getElementById('startButton').addEventListener('click', startGenerativeMusic);
  document.getElementById('syncButton').addEventListener('click', syncLoops);
  document.getElementById('stopButton').addEventListener('click', stopAllSounds);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // Redraw the entire canvas in every frame
  clear();
  background(300);

  // Draw the trails
  stroke(255, 10, 0); // Red color for the trails
  noFill();
  beginShape();
  for (let i = 0; i < trails.length; i++) {
    vertex(trails[i].x, trails[i].y);
  }
  endShape();

  for (let i = 0; i < numSounds; i++) {
    let pos = circlePositions[i];
    let d = dist(mouseX, mouseY, pos.x, pos.y);

    if (d < circleRadius && draggingCircle === -1) {
      fill(circleColors[i]);
    } else {
      fill(200);
    }

    ellipse(pos.x, pos.y, circleRadius * 5, circleRadius * 5);
    fill(0);
    text('FUCK' + (i + 1), pos.x, pos.y);
  }
}

function syncLoops() {
  for (let i = 0; i < numSounds; i++) {
    sounds[i].stop();
    startLoopingSound(i);
  }
}

function stopAllSounds() {
  for (let i = 0; i < numSounds; i++) {
    sounds[i].stop();
  }
}

function mousePressed() {
  for (let i = 0; i < numSounds; i++) {
    let pos = circlePositions[i];
    let d = dist(mouseX, mouseY, pos.x, pos.y);

    if (d < circleRadius) {
      draggingCircle = i;
      document.getElementById('startButton').classList.remove('noShadow');
      document.getElementById('syncButton').classList.remove('noShadow');
      document.getElementById('stopButton').classList.remove('noShadow');
      break;
    }
  }
}

function mouseDragged() {
  if (draggingCircle !== -1) {
    let newPosition = createVector(mouseX, mouseY);
    circlePositions[draggingCircle] = newPosition;
    // Add the new position to the trails array
    trails.push(newPosition);
  }
}

function mouseReleased() {
  if (draggingCircle !== -1) {
    draggingCircle = -1;
    document.getElementById('startButton').classList.add('noShadow');
    document.getElementById('syncButton').classList.add('noShadow');
    document.getElementById('stopButton').classList.add('noShadow');
    // Clear the trails array
    trails = [];
  }
}

function startGenerativeMusic() {
  if (!started) {
    started = true;
    for (let i = 0; i < numSounds; i++) {
      startLoopingSound(i);
    }
  }
}

function startLoopingSound(soundIndex) {
  let sound = sounds[soundIndex];

  function playSound() {
    let pos = circlePositions[soundIndex];
    let pan = map(pos.x, 0, width, -1, 1);
    let rate = map(pos.y, 0, height, 1.5, 0.5);
    let reverbAmount = map(pos.x, 0, width, 0, 5);
    let filterFreq = map(pos.y, 0, height, 15000, 200);
    
    let distortionAmount = map(pos.y, 0, height, 0.1, 1);
    let duration = sound.duration() * 1000 * rate;
    let randomInterval = random(500, 2000); // Random interval between 0.5 to 2 seconds

    sound.pan(pan);
    sound.rate(rate);

    reverb.process(sound, reverbAmount, 2);
    sound.connect(filter);
    filter.freq(filterFreq);

    sound.play();

    setTimeout(playSound, duration + randomInterval);
  }

  playSound();
}
