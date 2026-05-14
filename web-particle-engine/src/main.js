// ====== 將 const 改為 let，讓參數可以被動態修改 ======
let RESOLUTION = 100; 
let CANVAS_SIZE = 600; 
let PARTICLE_SIZE = CANVAS_SIZE / RESOLUTION; 
let DURATION = 3000; 

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false }); 
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const sourceUpload = document.getElementById('sourceUpload');
const targetUpload = document.getElementById('targetUpload');

// 新增：取得拉桿與數值顯示的 DOM
const resInput = document.getElementById('resInput');
const resValue = document.getElementById('resValue');
const durInput = document.getElementById('durInput');
const durValue = document.getElementById('durValue');
const sizeInput = document.getElementById('sizeInput');
const sizeValue = document.getElementById('sizeValue');

let animationId = null;
let particles = [];

let currentSourceSrc = '/strong_grandpa.jpg';
let currentTargetSrc = '/target.jpg';

function easeInOut(t) {
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

function getImageData(imageSrc) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const offscreen = document.createElement('canvas');
            offscreen.width = RESOLUTION;
            offscreen.height = RESOLUTION;
            const offCtx = offscreen.getContext('2d');
            offCtx.drawImage(img, 0, 0, RESOLUTION, RESOLUTION);
            
            const imageData = offCtx.getImageData(0, 0, RESOLUTION, RESOLUTION).data;
            const pixels = [];
            
            for (let i = 0; i < imageData.length; i += 4) {
                const index = i / 4;
                const x = index % RESOLUTION;
                const y = Math.floor(index / RESOLUTION);
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
                
                pixels.push({
                    // 根據動態的 PARTICLE_SIZE 重新計算座標
                    x: x * PARTICLE_SIZE,
                    y: y * PARTICLE_SIZE,
                    color: `rgb(${r},${g},${b})`,
                    brightness: brightness
                });
            }
            resolve(pixels);
        };
        img.onerror = () => reject(new Error("圖片載入失敗"));
    });
}

async function initEngine() {
    startBtn.disabled = true;
    startBtn.innerText = "重新計算特徵矩陣中...";

    try {
        const sourcePixels = await getImageData(currentSourceSrc);
        const targetPixels = await getImageData(currentTargetSrc);

        sourcePixels.sort((a, b) => a.brightness - b.brightness);
        targetPixels.sort((a, b) => a.brightness - b.brightness);

        particles = [];
        for (let i = 0; i < sourcePixels.length; i++) {
            particles.push({
                startX: sourcePixels[i].x,
                startY: sourcePixels[i].y,
                endX: targetPixels[i].x,
                endY: targetPixels[i].y,
                color: sourcePixels[i].color
            });
        }

        startBtn.innerText = "啟動相變程序 (Start)";
        startBtn.disabled = false;
        drawFrame(0);

    } catch (error) {
        startBtn.innerText = "讀取失敗，請檢查圖檔";
    }
}

function drawFrame(progress) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const currentX = p.startX + (p.endX - p.startX) * progress;
        const currentY = p.startY + (p.endY - p.startY) * progress;
        ctx.fillStyle = p.color;
        ctx.fillRect(currentX, currentY, PARTICLE_SIZE, PARTICLE_SIZE);
    }
}

function animate(startTime) {
    const currentTime = performance.now();
    let elapsed = currentTime - startTime;
    let linearProgress = Math.min(elapsed / DURATION, 1);
    
    if (linearProgress >= 1) {
        drawFrame(1);
        startBtn.disabled = false;
        return;
    }

    const easedProgress = easeInOut(linearProgress);
    drawFrame(easedProgress);
    animationId = requestAnimationFrame(() => animate(startTime));
}

// ====== 參數設定事件監聽 ======

// 1. 監聽解析度變化
resInput.addEventListener('input', (e) => {
    resValue.innerText = e.target.value; // 即時更新數字顯示
});
resInput.addEventListener('change', (e) => {
    // 當滑鼠放開拉桿時，才重新計算 (避免拖曳時卡頓)
    RESOLUTION = parseInt(e.target.value);
    PARTICLE_SIZE = CANVAS_SIZE / RESOLUTION;
    cancelAnimationFrame(animationId);
    initEngine(); // 重新生成數萬個粒子
});

// 2. 監聽動畫長度變化
durInput.addEventListener('input', (e) => {
    durValue.innerText = e.target.value;
    DURATION = parseFloat(e.target.value) * 1000; // 轉換為毫秒
});

// 3. 監聽畫布大小變化
sizeInput.addEventListener('input', (e) => {
    CANVAS_SIZE = parseInt(e.target.value);
    sizeValue.innerText = CANVAS_SIZE;
    PARTICLE_SIZE = CANVAS_SIZE / RESOLUTION; // 重新計算粒子大小
    
    // 更新畫布實際大小
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    
    if (particles.length > 0) {
        // 重算所有粒子的座標比例
        cancelAnimationFrame(animationId);
        initEngine(); 
    }
});

// ====== 上傳圖片事件監聽 ======
sourceUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        currentSourceSrc = URL.createObjectURL(file);
        cancelAnimationFrame(animationId);
        initEngine(); 
    }
});

targetUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        currentTargetSrc = URL.createObjectURL(file);
    } else {
        currentTargetSrc = '/target.jpg';
    }
    cancelAnimationFrame(animationId);
    initEngine(); 
});

// ====== 按鈕控制 ======
startBtn.addEventListener('click', () => {
    if (particles.length === 0) return;
    startBtn.disabled = true;
    cancelAnimationFrame(animationId);
    animate(performance.now());
});

resetBtn.addEventListener('click', () => {
    cancelAnimationFrame(animationId);
    drawFrame(0);
    startBtn.disabled = false;
});

// 網頁載入時初始化
initEngine();