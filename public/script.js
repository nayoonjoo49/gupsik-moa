data.forEach(meal => {
  const y = meal.date.slice(0, 4);   // 연도
  const m = meal.date.slice(4, 6);   // 월
  const d = meal.date.slice(6, 8);   // 일

  // 2025년 09월 10일 → 2025년 9월 10일 (앞의 0 제거)
  const dateText = `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;

  const card = document.createElement("div");
  card.className = "meal-card";
  card.innerHTML = `
    <h3>${dateText}</h3>
    <p>${meal.menu}</p>
  `;
  resultDiv.appendChild(card);
});
