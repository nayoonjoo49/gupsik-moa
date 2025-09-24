import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { officeCode, schoolCode, meal = 2 } = req.query;

  if (!officeCode || !schoolCode) {
    return res.status(400).json({ error: "필수 파라미터가 없습니다." });
  }

  const NEIS_KEY = process.env.NEIS_KEY;

  // 오늘 날짜 구하기 (YYYYMMDD)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const date = `${year}${month}${day}`;

  try {
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${NEIS_KEY}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MMEAL_SC_CODE=${meal}&MLSV_YMD=${date}`;
    console.log("NEIS 호출 URL:", url);

    const response = await fetch(url);
    const data = await response.json();

    if (!data.mealServiceDietInfo || !data.mealServiceDietInfo[1]) {
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
