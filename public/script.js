async function searchMeals(officeCode, schoolCode, year, month) {
  try {
    const response = await fetch(`/api/meals?officeCode=${officeCode}&schoolCode=${schoolCode}&year=${year}&month=${month}`);
    const data = await response.json();

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = ""; // 기존 내용 초기화

    if (data.length === 0) {
      resultDiv.innerHTML = "<p>해당 달의 급식 정보가 없습니다.</p>";
      return;
    }

    // 날짜순으로 정렬
    data.sort((a, b) => a.date.localeCompare(b.date));

    data.forEach(meal => {
      const card = document.createElement("div");
      card.className = "meal-card"; // CSS에서 둥근 모서리 적용
      card.innerHTML = `
        <h3>${meal.date.slice(0,4)}-${meal.date.slice(4,6)}-${meal.date.slice(6,8)}</h3>
        <p>${meal.menu}</p>
      `;
      resultDiv.appendChild(card);
    });
  } catch (error) {
    console.error("급식 불러오기 오류:", error);
    document.getElementById("result").innerHTML = "<p>급식 데이터를 불러오는 중 오류 발생</p>";
  }
}
