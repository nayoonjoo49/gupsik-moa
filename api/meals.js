import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { officeCode, schoolCode, meal, year, month } = req.query;

  if (!officeCode || !schoolCode || !year || !month) {
    return res.status(400).json({ error: "필수 파라미터(officeCode, schoolCode, year, month)가 없습니다." });
  }

  const NEIS_KEY = process.env.NEIS_KEY;

  // 이번 달의 시작일과 마지막일 구하기
  const startDate = `${year}${month.padStart(2, '0')}01`;
  const lastDay = new Date(year, month, 0).getDate(); // 마지막 날짜
  const endDate = `${year}${month.padStart(2, '0')}${String(lastDay).padStart(2, '0')}`;

  try {
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${NEIS_KEY}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MMEAL_SC_CODE=${meal}&MLSV_FROM_YMD=${startDate}&MLSV_TO_YMD=${endDate}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.mealServiceDietInfo) {
      return res.status(200).json([]);
    }

    const meals = data.mealServiceDietInfo[1].row.map(item => ({
      date: item.MLSV_YMD,
      menu: item.DDISH_NM.replace(/<br\s*\/?>/gi, ', ')
    }));

    res.status(200).json(meals);
  } catch (err) {
    console.error("API 호출 오류:", err);
    res.status(500).json({ error: "급식 데이터를 불러오는 중 오류 발생" });
  }
}
