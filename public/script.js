let selectedSchool = null;

// 학교 검색
async function searchSchool() {
  const name = document.getElementById("schoolInput").value.trim();
  if (!name) return;

  try {
    const res = await fetch(`/api/schools?name=${name}`);
    const schools = await res.json();

    const schoolDiv = document.getElementById("schoolResult");
    schoolDiv.innerHTML = "";

    if (schools.length === 0) {
      schoolDiv.innerHTML = "<p>검색된 학교가 없습니다.</p>";
      return;
    }

    // 검색된 학교 리스트 표시
    schools.forEach(school => {
      const item = document.createElement("div");
      item.className = "school-item";

      // NEIS API에서 오는 데이터 키 이름 맞추기
      const schoolName = school.SCHUL_NM || school.name;
      const schoolAddr = school.ORG_RDNMA || school.address || "";

      item.innerHTML = `<strong>${schoolName}</strong> <span class="address">${schoolAddr}</span>`;

      // 클릭 시 선택
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
  }
}

function selectSchool(school) {
  selectedSchool = school;
  document.getElementById("mealControls").classList.remove("hidden");

  // 현재 달 자동 선택
  const now = new Date();
  document.getElementById("monthSelect").value = now.getMonth() + 1;

  loadMeals();
}

// 급식 불러오기
async function loadMeals() {
  if (!selectedSchool) return;
  const year = new Date().getFullYear();
  const month = document.getElementById("monthSelect").value;

  try {
    const res = await fetch(`/api/meals?officeCode=${selectedSchool.officeCode}&schoolCode=${selectedSchool.schoolCode}&year=${year}&month=${month}`);
    const meals = await res.json();

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    if (meals.length === 0) {
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
      card.innerHTML = `<h3>${dateText}</h3><p>${meal.menu}</p>`;
      resultDiv.appendChild(card);
    });
  } catch (e) {
    console.error("급식 불러오기 오류:", e);
    document.getElementById("result").innerHTML = "<p>급식 데이터를 불러오는 중 오류 발생</p>";
  }
}

// 알레르기 안내 토글
function toggleAllergy() {
  const info = document.getElementById("allergyInfo");
  info.classList.toggle("hidden");
}
