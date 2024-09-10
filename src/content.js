import { YoutubeTranscript } from 'youtube-transcript';

let speedChangeCount = 0;
let transcript = [];
let lastProcessedIndex = -1;
let isEnabled = true;
let intervalId = null;
let targetWPS = 3; // Default value

function controlSpeed() {
    const video = document.querySelector('video');

    if (video) {
        function setPlaybackSpeed(targetSpeed) {
            // Round to nearest 0.25
            targetSpeed = Math.round(targetSpeed * 4) / 4;
            // Apply ceiling and bottom cap
            targetSpeed = Math.max(0.75, Math.min(targetSpeed, 2));

            const currentSpeed = video.playbackRate;
            const steps = 4;
            const stepDuration = 500; // 500ms = 0.5 seconds
            const speedDifference = targetSpeed - currentSpeed;
            const speedIncrement = speedDifference / steps;

            function changeSpeedGradually(step) {
                if (step <= steps) {
                    const newSpeed = currentSpeed + speedIncrement * step;
                    video.playbackRate = newSpeed;
                    console.log(`Speed changed to ${newSpeed.toFixed(2)}x. Step ${step}/${steps}`);
                    setTimeout(() => changeSpeedGradually(step + 1), stepDuration);
                } else {
                    speedChangeCount++;
                    console.log(`Speed change complete. New speed: ${targetSpeed.toFixed(2)}x. Total changes: ${speedChangeCount}`);
                }
            }

            changeSpeedGradually(1);
        }

        // Fetch transcript
        function fetchTranscript() {
            const videoId = new URLSearchParams(window.location.search).get('v');
            if (!videoId) {
                console.log('Could not find video ID');
                return;
            }

            YoutubeTranscript.fetchTranscript(videoId)
                .then(result => {
                    transcript = result;
                    console.log('Transcript fetched successfully');
                })
                .catch(error => console.log('Error fetching transcript:', error));
        }

        // Process upcoming transcript segments and adjust speed
        function processUpcomingTranscript() {
            if (!isEnabled) return; // Stop processing if disabled

            const currentTime = video.currentTime;
            let segmentIndex = transcript.findIndex(segment => currentTime < segment.offset);

            if (segmentIndex !== -1 && segmentIndex > lastProcessedIndex) {
                const segments = [];
                while (segments.length < 6 && segmentIndex < transcript.length) {
                    const segment = transcript[segmentIndex];
                    const wordCount = segment.text.split(/\s+/).length;
                    if (wordCount >= 4) {
                        segments.push(segment);
                    } else {
                        console.log(`Skipped segment: "${segment.text}" (${wordCount} words)`);
                    }
                    segmentIndex++;
                }

                if (segments.length === 6) {
                    const totalDuration = segments[5].offset + segments[5].duration - segments[0].offset;
                    const totalWords = segments.reduce((sum, segment) => sum + segment.text.split(/\s+/).length, 0);
                    const wordsPerSecond = totalWords / totalDuration;

                    // Use the targetWPS variable here
                    const newSpeed = targetWPS / wordsPerSecond;
                    setPlaybackSpeed(newSpeed);

                    console.log(`Upcoming 6 segments at ${segments[0].offset.toFixed(2)}s:`);
                    segments.forEach(segment => {
                        console.log(`  Offset: ${segment.offset.toFixed(2)}s, Text: "${segment.text}"`);
                    });
                    console.log(`Total Words/Second: ${wordsPerSecond.toFixed(2)}, Target Speed: ${newSpeed.toFixed(2)}x`);

                    lastProcessedIndex = segmentIndex - 1;
                }
            }
        }

        // Call fetchTranscript after a short delay to ensure the page has fully loaded
        setTimeout(fetchTranscript, 2000);

        // Set up interval to check current time, process transcript, and adjust speed
        intervalId = setInterval(processUpcomingTranscript, 100);  // Check every 100ms

        console.log('YouTube Speed Controller and Transcript Analyzer active');
    } else {
        console.log('No video found on this page');
    }
}

function stopController() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    const video = document.querySelector('video');
    if (video) {
        video.playbackRate = 1;
    }
    console.log('YouTube Speed Controller deactivated');
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "update") {
        isEnabled = request.isEnabled;
        targetWPS = request.targetWPS;

        if (isEnabled) {
            if (!intervalId) {
                controlSpeed();
            }
            console.log(`YouTube Speed Controller activated with target WPS: ${targetWPS}`);
        } else {
            stopController();
        }
    }
});

// Check initial state
chrome.storage.sync.get(['isEnabled', 'targetWPS'], function (data) {
    isEnabled = data.isEnabled !== false;
    targetWPS = data.targetWPS || 3; // Use stored value or default to 3
    if (isEnabled) {
        controlSpeed();
    }
});

if (document.readyState === 'complete') {
    if (isEnabled) controlSpeed();
} else {
    window.addEventListener('load', function () {
        if (isEnabled) controlSpeed();
    });
}