document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('school-search');
  const searchBtn = document.getElementById('search-btn');
  const schoolResult = document.getElementById('school-result');
  const mealContainer = document.getElementById('meal-container');
  const mealResults = document.getElementById('meal-results');
  const monthSelect = document.getElementById('month');
  const allergyToggle = document.getElementById('allergy-toggle');
  const allergyInfo = document.getElementById('allergy-info');

  let selectedSchool = null;

  // 알레르기 안내 토글
  allergyToggle.addEventListener('click', () => {
    allergyInfo.classList.toggle('hidden');
  });

  // 검색 버튼
  searchBtn.addEventListener('click', async () => {
    const schoolName = searchInput.value.trim();
    if (!schoolName) return;

    try {
      const schoolRes = await fetch(`/api/schools?name=${encodeURIComponent(schoolName)}`);
      const schoolData = await schoolRes.json();

      if (!schoolData || schoolData.length === 0) {
        schoolResult.innerHTML = "<p>학교를 찾을 수 없습니다.</p>";
        return;
      }

      // 결과 표시
      schoolResult.innerHTML = schoolData.map(school => `
        <div class="school-item" data-code="${school.SD_SCHUL_CODE}" data-office="${school.ATPT_OFCDC_SC_CODE}">
          <div class="school-name">${school.SCHUL_NM}</div>
          <div class="school-addr">${school.ORG_RDNMA}</div>
        </div>
      `).join('');

      // 학교 클릭 이벤트
      document.querySelectorAll('.school-item').forEach(item => {
        item.addEventListener('click', () => {
          selectedSchool = {
            name: item.querySelector('.school-name').innerText,
            office: item.dataset.office,
            code: item.dataset.code
          };

          setupMonthSelect();
          loadMeals();
          mealContainer.classList.remove('hidden');
        });
      });

    } catch (err) {
      schoolResult.innerHTML = "<p>검색 중 오류가 발생했습니다.</p>";
      console.error(err);
    }
  });

  // 월 선택 UI 생성
  function setupMonthSelect() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    monthSelect.innerHTML = '';
    for (let m = 1; m <= 12; m++) {
      const opt = document.createElement('option');
      opt.value = m;
      opt.text = `${m}월`;
      if (m === currentMonth) opt.selected = true;
      monthSelect.appendChild(opt);
    }
    monthSelect.addEventListener('change', loadMeals);
  }

  // 급식 불러오기
  async function loadMeals() {
    if (!selectedSchool) return;
    const month = monthSelect.value;
    const now = new Date();
    const year = now.getFullYear();

    try {
      const mealRes = await fetch(`/api/meals?officeCode=${selectedSchool.office}&schoolCode=${selectedSchool.code}&meal=2&year=${year}&month=${month}`);
      const mealData = await mealRes.json();

      if (!mealData || mealData.length === 0) {
        mealResults.innerHTML = "<p>급식 정보가 없습니다.</p>";
        return;
      }

      mealResults.innerHTML = mealData.map(day => `
        <div class="card">
          <h3>${day.date}</h3>
          <p>${day.menu}</p>
        </div>
      `).join('');
    } catch (err) {
      mealResults.innerHTML = "<p>급식을 불러오는 중 오류가 발생했습니다.</p>";
      console.error(err);
    }
  }
});
