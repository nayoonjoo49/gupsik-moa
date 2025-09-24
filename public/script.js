document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('school-search');
  const searchBtn = document.getElementById('search-btn');
  const confirmBtn = document.getElementById('confirm-btn');
  const resultsDiv = document.getElementById('meal-results');
  const schoolResult = document.getElementById('school-result');
  const allergyToggle = document.getElementById('allergy-toggle');
  const allergyInfo = document.getElementById('allergy-info');

  let selectedSchool = null;

  // 알레르기 안내 토글
  allergyToggle.addEventListener('click', () => {
    allergyInfo.classList.toggle('hidden');
  });

  // 학교 검색
  searchBtn.addEventListener('click', async () => {
    const schoolName = searchInput.value.trim();
    if (!schoolName) return;

    try {
      const schoolRes = await fetch(`/api/schools?name=${encodeURIComponent(schoolName)}`);
      const schoolData = await schoolRes.json();
      if (!schoolData || schoolData.length === 0) {
        schoolResult.innerHTML = "<p>학교를 찾을 수 없습니다.</p>";
        confirmBtn.classList.add('hidden');
        return;
      }

      selectedSchool = schoolData[0];
      schoolResult.innerHTML = `<p>검색된 학교: <strong>${selectedSchool.SCHUL_NM}</strong></p>`;
      confirmBtn.classList.remove('hidden');
    } catch (err) {
      schoolResult.innerHTML = "<p>검색 중 오류가 발생했습니다.</p>";
      console.error(err);
    }
  });

  // 확인 버튼 → 급식 출력
  confirmBtn.addEventListener('click', async () => {
    if (!selectedSchool) return;

    const { ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE } = selectedSchool;

    try {
      // 점심 고정 (meal=2)
      const mealRes = await fetch(`/api/meals?officeCode=${ATPT_OFCDC_SC_CODE}&schoolCode=${SD_SCHUL_CODE}&meal=2`);
      const mealData = await mealRes.json();

      if (!mealData || mealData.length === 0) {
        resultsDiv.innerHTML = "<p>급식 정보가 없습니다.</p>";
        return;
      }

      resultsDiv.innerHTML = mealData.map(day =>
        `<div class="card">
           <h3>${day.date}</h3>
           <p>${day.menu}</p>
         </div>`
      ).join('');
    } catch (err) {
      resultsDiv.innerHTML = "<p>급식을 불러오는 중 오류가 발생했습니다.</p>";
      console.error(err);
    }
  });
});
