window.addEventListener('load', function() {
    const canvas = document.querySelector('.canvas-widget canvas');
    const AspectRatio = 1.8

    let width = window.innerWidth;
        let height = window.innerHeight;

        if (width / height > AspectRatio) {
            width = height * AspectRatio;
        } else {
            height = width / AspectRatio;
        }

    if (canvas) {
        canvas.width = 1080;  
        canvas.height = 600;  
    }

    canvas.style.width = width + "px";
    canvas.style.height =  height + "px";
    canvas.style.margin =  0;
    canvas.margin =  "0px";

});
window.addEventListener('resize', function() {
    const canvas = document.querySelector('.canvas-widget canvas');
    const AspectRatio = 1.8

    let width = window.innerWidth;
        let height = window.innerHeight;
        if (width / height > AspectRatio) {
            width = height * AspectRatio;
        } else {
            height = width / AspectRatio;
        }

    if (canvas) {
        canvas.width = 1080; 
        canvas.height = 600; 
        
    }
    canvas.style.width = width + "px";
    canvas.style.height =  height + "px";
    canvas.style.margin = 0 ;
    canvas.margin =  "0px";

});


    let countdownInterval;
    let gameStarted = false;

    function startCountdown(durationInMinutes) {
        const countdownDisplay = document.getElementById('countdown');
        let timeLeft = durationInMinutes * 60;

        countdownInterval = setInterval(function() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;

            countdownDisplay.innerHTML = `${minutes} minutes ${seconds} seconds`;

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                endGame('You Lost!');
                
            }
         
            timeLeft--;
        }, 1000);
    }

    function resetCountdown() {
        clearInterval(countdownInterval);
        document.getElementById('countdown').innerHTML = '';
    }

    function exitPage() {
        window.close();
    }

    function startGame() {
    if (!gameStarted) {
        resetCountdown();
        startCountdown(1); // Change the duration as needed (in minutes)
        gameStarted = true;
        hidePreGameDisplay(); // Hide pre-game display on game start
        showMainCanvas(); // Show the main canvas
       
    }
    }

    
    window.endGame = function(message) {
        const countdownDisplay = document.getElementById('countdown');
        const gameResultDisplay = document.getElementById('gameResult');
        const resultMessage = document.getElementById('resultMessage');
        const exitButton = document.getElementById('exitBtn');
        const restartButton = document.getElementById('restartBtn');

        countdownDisplay.style.display = 'none';
        gameResultDisplay.style.display = 'block';
        exitButton.style.display = 'block';
        restartButton.style.display = 'block';
        resultMessage.innerHTML = message; 

        clearInterval(countdownInterval);
    }




    function restartGame() {
        resetCountdown();
        window.location.reload();
    }

    function hidePreGameDisplay() {
        const preGameDisplay = document.getElementById('preGameDisplay');
        preGameDisplay.style.display = 'none';
    }

    function showMainCanvas() {
        const mainCanvas = document.getElementById('main-canvas');
        mainCanvas.style.display = 'block';
    }

    window.onload = function() {
        // Show pre-game display when the window loads
        const preGameDisplay = document.getElementById('preGameDisplay');
        preGameDisplay.style.display = 'block';
    };
