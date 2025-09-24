document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('school-search');
  const searchBtn = document.getElementById('search-btn');
  const resultsDiv = document.getElementById('meal-results');

  async function searchSchool() {
    const schoolName = searchInput.value.trim();
    if (!schoolName) return;

    try {
      const schoolRes = await fetch(`/api/schools?name=${encodeURIComponent(schoolName)}`);
      const schoolData = await schoolRes.json();
      if (!schoolData || schoolData.length === 0) {
        resultsDiv.innerHTML = "<p>학교를 찾을 수 없습니다.</p>";
        return;
      }

      const { ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE } = schoolData[0];

      // 점심 고정
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
      resultsDiv.innerHTML = "<p>오류가 발생했습니다.</p>";
      console.error(err);
    }
  }

  // 버튼 클릭
  searchBtn.addEventListener('click', searchSchool);

  // 엔터키 입력
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchSchool();
  });
});
