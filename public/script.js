const form = document.getElementById("searchForm");
const input = document.getElementById("schoolInput");
const schoolResults = document.getElementById("schoolResults");
const mealsDiv = document.getElementById("meals");

// ✅ form 제출 이벤트 (검색 버튼 클릭 시)
form.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSearch();
});

// ✅ 엔터키 입력 이벤트 (검색창에 커서 있을 때)
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSearch();
  }
});

async function handleSearch() {
  const query = input.value.trim();
  if (!query) return;

  schoolResults.innerHTML = "검색 중...";

  try {
    const response = await fetch(`/api/schools?name=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data.schoolInfo) {
      schoolResults.innerHTML = "학교를 찾을 수 없습니다.";
      return;
    }

    const schools = data.schoolInfo[1].row;
    schoolResults.innerHTML = "";

    schools.forEach((school) => {
      const div = document.createElement("div");
      div.className = "school-item";
      div.innerHTML = `
        <strong>${school.SCHUL_NM}</strong><br>
        <span style="color: gray; font-size: 14px;">${school.ORG_RDNMA}</span>
      `;
      div.addEventListener("click", () => loadMeals(school));
      schoolResults.appendChild(div);
    });
  } catch (error) {
    schoolResults.innerHTML = "학교 검색 오류 발생";
    console.error(error);
  }
}

async function loadMeals(school) {
  mealsDiv.innerHTML = "급식 정보를 불러오는 중...";

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  try {
    const response = await fetch(
      `/api/meals?code=${school.SD_SCHUL_CODE}&office=${school.ATPT_OFCDC_SC_CODE}&year=${year}&month=${month}`
    );
    const data = await response.json();

    if (!data.mealServiceDietInfo) {
      mealsDiv.innerHTML = "급식 정보가 없습니다.";
      return;
    }

    const meals = data.mealServiceDietInfo[1].row;
    mealsDiv.innerHTML = "";

    meals.forEach((meal) => {
      const dateStr = meal.MLSV_YMD;
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const formattedDate = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;

      const mealDiv = document.createElement("div");
      mealDiv.className = "meal-card";

      // ✅ 사진이 있을 때만 표시
      let imgHTML = "";
      if (meal.MLSV_FGR && meal.MLSV_FGR.trim() !== "") {
        imgHTML = `<img src="${meal.MLSV_FGR}" alt="급식 사진" class="meal-img">`;
      }

      mealDiv.innerHTML = `
        <h3>${formattedDate}</h3>
        <p>${meal.DDISH_NM.replace(/<br\/>/g, ", ")}</p>
        ${imgHTML}
      `;

      mealsDiv.appendChild(mealDiv);
    });
  } catch (error) {
    mealsDiv.innerHTML = "급식 불러오기 오류 발생";
    console.error(error);
  }
}
