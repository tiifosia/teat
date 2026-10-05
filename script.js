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
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = themeToggleBtn.querySelector('.theme-icon');
const themeLabel = themeToggleBtn.querySelector('.theme-label');

let history = [];
let isGenerating = false;

// 1. 테마 관리 (기본: 다크 모드)
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('teat-theme', theme);

  if (theme === 'dark') {
    themeIcon.textContent = '🌙';
    themeLabel.textContent = '다크 모드';
  } else {
    themeIcon.textContent = '☀️';
    themeLabel.textContent = '라이트 모드';
  }
}

// 저장된 테마 불러오기 (기본값 dark)
const savedTheme = localStorage.getItem('teat-theme') || 'dark';
applyTheme(savedTheme);

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
});

// 2. Web Audio API를 활용한 효과음
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
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.18); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.28);
    }
  } catch (e) {
    // 오디오 미지원 환경 예외 무시
  }
}

// 3. 랜덤 정수 생성
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 4. 번호 생성 로직
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
  const duration = 600;
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

      // 팝업 애니메이션
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

// 5. 히스토리 관리
function addToHistory(num) {
  history.unshift(num);
  if (history.length > 20) history.pop();
  renderHistory();
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = '<p class="empty-history">아직 생성된 숫자가 없습니다.</p>';
    return;
  }

  historyList.innerHTML = history
    .map(n => `<span class="history-badge">${n}</span>`)
    .join('');
}

// 6. 클립보드 복사
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

// 7. 프리셋 클릭
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

// 스페이스바 단축키 지원
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    generateNumber();
  }
});
