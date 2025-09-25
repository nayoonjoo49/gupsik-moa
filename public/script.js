let selectedSchool = null;

// 학교 검색
async function searchSchool() {
  const name = document.getElementById("schoolInput").value.trim();
  if (!name) return;

  const schoolDiv = document.getElementById("schoolResult");
  schoolDiv.innerHTML = "검색 중...";

  try {
    const res = await fetch(`/api/schools?name=${encodeURIComponent(name)}`);
    const data = await res.json();

    // ✅ API 응답이 배열이면 그대로 schools, 아니면 schoolInfo 안에서 꺼냄
    const schools = Array.isArray(data) ? data : (data.schoolInfo?.[1]?.row || []);

    schoolDiv.innerHTML = "";

    if (!schools || schools.length === 0) {
      schoolDiv.innerHTML = "<p>검색된 학교가 없습니다.</p>";
      return;
    }

    schools.forEach(school => {
      const item = document.createElement("div");
      item.className = "school-item";

      const schoolName = school.SCHUL_NM || school.name;
      const schoolAddr = school.ORG_RDNMA || school.address || "";

      item.innerHTML = `<strong>${schoolName}</strong> <span class="address">${schoolAddr}</span>`;

      item.onclick = () => selectSchool({
        officeCode: school.ATPT_OFCDC_SC_CODE,
        schoolCode: school.SD_SCHUL_CODE,
        name: schoolName,
        address: schoolAddr
      });

      schoolDiv.appendChild(item);
    });
  } catch (e) {
    console.error("학교 검색 오류:", e);
    schoolDiv.innerHTML = "<p>학교 검색 중 오류 발생</p>";
  }
}

function selectSchool(school) {
  selectedSchool = school;
  document.getElementById("mealControls").classList.remove("hidden");

  const now = new Date();
  document.getElementById("monthSelect").value = now.getMonth() + 1;

  loadMeals();
}

// 급식 불러오기
async function loadMeals() {
  if (!selectedSchool) return;
  const year = new Date().getFullYear();
  const month = document.getElementById("monthSelect").value;

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "급식 불러오는 중...";

  try {
    const res = await fetch(`/api/meals?officeCode=${selectedSchool.officeCode}&schoolCode=${selectedSchool.schoolCode}&year=${year}&month=${month}`);
    const meals = await res.json();

    resultDiv.innerHTML = "";

    if (!meals || meals.length === 0) {
      resultDiv.innerHTML = "<p>해당 월의 급식이 없습니다.</p>";
      return;
    }

    meals.sort((a, b) => a.date.localeCompare(b.date));

    meals.forEach(meal => {
      const y = meal.date.slice(0, 4);
      const m = parseInt(meal.date.slice(4, 6));
      const d = parseInt(meal.date.slice(6, 8));
      const dateText = `${y}년 ${m}월 ${d}일`;

      const card = document.createElement("div");
      card.className = "meal-card";

      const imgHTML = meal.image ? `<img src="${meal.image}" alt="급식 사진" class="meal-img">` : "";

      card.innerHTML = `
        <h3>${dateText}</h3>
        <p>${meal.menu}</p>
        ${imgHTML}
      `;

      resultDiv.appendChild(card);
    });
  } catch (e) {
    console.error("급식 불러오기 오류:", e);
    resultDiv.innerHTML = "<p>급식 데이터를 불러오는 중 오류 발생</p>";
  }
}

// 알레르기 안내 토글
function toggleAllergy() {
  const info = document.getElementById("allergyInfo");
  info.classList.toggle("hidden");
}

// ✅ 엔터 입력 시 검색 실행
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchSchool();
  }
});
