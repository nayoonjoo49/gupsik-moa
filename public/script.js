// ====== 엘리먼트 안전하게 찾기(이름이 달라도 동작) ======
function $(id) { return document.getElementById(id); }
const inputEl         = $("schoolInput") || $("school-search");           // 둘 중 무엇이든
const schoolBox       = $("schoolResult") || $("schoolResults");          // 결과 박스 호환
const resultBox       = $("result") || $("meals");                        // 급식 출력 박스 호환
const mealControlsBox = $("mealControls") || null;                        // 있으면 사용
const monthSelectEl   = $("monthSelect") || null;
const searchForm      = $("searchForm") || null;
const searchBtn       = $("search-btn") || null;                          // 버튼 id가 있을 때만
const allergyBtn      = $("allergy-toggle") || null;
const allergyInfo     = $("allergyInfo") || null;

let selectedSchool = null;

// ====== 이벤트 연결 (폼/버튼/엔터 모두 지원) ======
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchSchool();
  });
}

if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    searchSchool();
  });
}

if (inputEl) {
  // 엔터 입력으로 검색
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchSchool();
    }
  });
}

// 알레르기 안내 토글(있을 때만)
if (allergyBtn && allergyInfo) {
  allergyBtn.addEventListener("click", () => {
    allergyInfo.classList.toggle("hidden");
  });
}

// ====== 학교 검색 ======
async function searchSchool() {
  if (!inputEl || !schoolBox) return;
  const name = inputEl.value.trim();
  if (!name) return;

  schoolBox.innerHTML = "검색 중...";

  try {
    const res = await fetch(`/api/schools?name=${encodeURIComponent(name)}`);
    const data = await res.json();

    // /api/schools 응답이 배열이거나, NEIS 원형(schoolInfo)일 수도 있음
    const schools = Array.isArray(data) ? data : (data.schoolInfo?.[1]?.row || []);
    schoolBox.innerHTML = "";

    if (!schools || schools.length === 0) {
      schoolBox.innerHTML = "<p>검색된 학교가 없습니다.</p>";
      return;
    }

    schools.forEach((school) => {
      const schoolName = school.SCHUL_NM || school.name || "";
      const schoolAddr = school.ORG_RDNMA || school.address || "";

      const item = document.createElement("div");
      item.className = "school-item";
      item.innerHTML = `<strong>${schoolName}</strong> <span class="address" style="color:#777;font-size:0.9em;margin-left:8px;">${schoolAddr}</span>`;
      item.addEventListener("click", () => {
        selectSchool({
          officeCode: school.ATPT_OFCDC_SC_CODE || school.officeCode,
          schoolCode: school.SD_SCHUL_CODE     || school.schoolCode,
          name: schoolName,
          address: schoolAddr
        });
      });
      schoolBox.appendChild(item);
    });
  } catch (e) {
    console.error("학교 검색 오류:", e);
    schoolBox.innerHTML = "<p>학교 검색 중 오류 발생</p>";
  }
}

function selectSchool(school) {
  selectedSchool = school;

  // 월 선택 UI가 있으면 노출 + 현재 달로 맞추기
  if (mealControlsBox) {
    mealControlsBox.classList.remove("hidden");
  }
  if (monthSelectEl) {
    const now = new Date();
    monthSelectEl.value = now.getMonth() + 1;
    monthSelectEl.onchange = loadMeals;
  }

  loadMeals();
}

// ====== 급식 불러오기 (한 달치) ======
async function loadMeals() {
  if (!selectedSchool || !resultBox) return;

  const now   = new Date();
  const year  = now.getFullYear();
  const month = monthSelectEl ? monthSelectEl.value : (now.getMonth() + 1);

  resultBox.innerHTML = "<p>급식 불러오는 중...</p>";

  try {
    // 백엔드가 단순화된 배열 형태를 주는 버전(/api/meals?officeCode=...&schoolCode=...&year=...&month=...) 기준
    const url = `/api/meals?officeCode=${encodeURIComponent(selectedSchool.officeCode)}&schoolCode=${encodeURIComponent(selectedSchool.schoolCode)}&year=${year}&month=${month}`;
    const res = await fetch(url);
    const data = await res.json();

    // /api/meals가 간소화 배열([ {date, menu, image?} ])이거나,
    // NEIS 원형(mealServiceDietInfo)일 수 있음 → 통일된 배열로 변환
    let meals = [];
    if (Array.isArray(data)) {
      meals = data.map(row => ({
        date: row.date || row.MLSV_YMD,
        menu: row.menu || (row.DDISH_NM ? row.DDISH_NM.replace(/<br\s*\/?>/gi, ", ") : ""),
        image: row.image || row.MLSV_FGR || null
      }));
    } else if (data?.mealServiceDietInfo?.[1]?.row) {
      meals = data.mealServiceDietInfo[1].row.map(item => ({
        date: item.MLSV_YMD,
        menu: item.DDISH_NM ? item.DDISH_NM.replace(/<br\s*\/?>/gi, ", ") : "",
        image: item.MLSV_FGR || null
      }));
    }

    resultBox.innerHTML = "";

    if (!meals || meals.length === 0) {
      resultBox.innerHTML = "<p>해당 월의 급식이 없습니다.</p>";
      return;
    }

    meals.sort((a, b) => String(a.date).localeCompare(String(b.date)));

    meals.forEach(meal => {
      const y = String(meal.date).slice(0, 4);
      const m = parseInt(String(meal.date).slice(4, 6));
      const d = parseInt(String(meal.date).slice(6, 8));
      const dateText = `${y}년 ${m}월 ${d}일`;

      const card = document.createElement("div");
      card.className = "meal-card";

      // 사진이 있을 때만 이미지 태그 추가 (문구 없음)
      const imgHTML = meal.image && String(meal.image).trim() !== ""
        ? `<img src="${meal.image}" alt="" class="meal-img">`
        : "";

      card.innerHTML = `
        <h3>${dateText}</h3>
        <p>${meal.menu || ""}</p>
        ${imgHTML}
      `;
      resultBox.appendChild(card);
    });
  } catch (e) {
    console.error("급식 불러오기 오류:", e);
    resultBox.innerHTML = "<p>급식 데이터를 불러오는 중 오류 발생</p>";
  }
}

// ✅ 어디서든 엔터 누르면 검색 실행
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchSchool();
  }
});
