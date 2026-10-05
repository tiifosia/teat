// DOM Elements
const numberDisplay = document.getElementById('numberDisplay');
const minInput = document.getElementById('minInput');
const maxInput = document.getElementById('maxInput');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const presetButtons = document.querySelectorAll('.preset-btn');
const displaySection = document.querySelector('.display-section');

let history = [];
let isGenerating = false;

// Web Audio API를 활용한 효과음 (외부 파일 없이 직접 합성음 생성)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'tick') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.15); // G5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (e) {
    // 오디오 미지원 환경 예외 무시
  }
}

// 랜덤 정수 생성
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 숫자 롤링 애니메이션 생성 로직
function generateNumber() {
  if (isGenerating) return;

  const min = parseInt(minInput.value, 10);
  const max = parseInt(maxInput.value, 10);

  if (isNaN(min) || isNaN(max)) {
    alert('최솟값과 최댓값을 숫자로 입력해 주세요.');
    return;
  }

  if (min > max) {
    alert('최솟값은 최댓값보다 클 수 없습니다.');
    return;
  }

  isGenerating = true;
  generateBtn.disabled = true;
  displaySection.classList.add('active');
  copyBtn.style.display = 'none';

  const finalNumber = getRandomInt(min, max);
  const duration = 600; // 0.6초 롤링
  const startTime = Date.now();

  const rollInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    if (elapsed < duration) {
      numberDisplay.textContent = getRandomInt(min, max);
      playSound('tick');
    } else {
      clearInterval(rollInterval);
      numberDisplay.textContent = finalNumber;
      playSound('success');

      // 팝 애니메이션
      numberDisplay.classList.remove('pop');
      void numberDisplay.offsetWidth; // reflow
      numberDisplay.classList.add('pop');
      displaySection.classList.remove('active');

      // 복사 버튼 노출
      copyBtn.style.display = 'inline-block';
      copyBtn.textContent = '📋 복사하기';

      // 히스토리 추가
      addToHistory(finalNumber);

      isGenerating = false;
      generateBtn.disabled = false;
    }
  }, 40);
}

// 히스토리 추가
function addToHistory(num) {
  history.unshift(num);
  if (history.length > 20) history.pop();
  renderHistory();
}

// 히스토리 렌더링
function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = '<p class="empty-history">아직 생성된 숫자가 없습니다.</p>';
    return;
  }

  historyList.innerHTML = history
    .map(n => `<span class="history-badge">${n}</span>`)
    .join('');
}

// 복사 기능
copyBtn.addEventListener('click', () => {
  const currentNum = numberDisplay.textContent;
  if (!currentNum || currentNum === '?') return;

  navigator.clipboard.writeText(currentNum).then(() => {
    copyBtn.textContent = '✅ 복사 완료!';
    setTimeout(() => {
      copyBtn.textContent = '📋 복사하기';
    }, 1500);
  }).catch(() => {
    copyBtn.textContent = '❌ 복사 실패';
  });
});

// 프리셋 버튼 이벤트
presetButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    minInput.value = btn.dataset.min;
    maxInput.value = btn.dataset.max;
  });
});

// 이벤트 리스너 등록
generateBtn.addEventListener('click', generateNumber);
clearHistoryBtn.addEventListener('click', () => {
  history = [];
  renderHistory();
});

// 스페이스바나 엔터 키로도 생성 가능하게 지원
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    generateNumber();
  }
});
