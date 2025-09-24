export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const { office, school, from, to, meal } = req.query;
    if (!office || !school || !from || !to) {
      res.status(400).json({ error: 'Missing params' });
      return;
    }
    const key = process.env.NEIS_KEY;
    if (!key) {
      res.status(500).json({ error: 'Server not configured: NEIS_KEY missing' });
      return;
    }
    const params = new URLSearchParams({
      KEY: key,
      Type: 'json',
      pIndex: '1',
      pSize: '100',
      ATPT_OFCDC_SC_CODE: office,
      SD_SCHUL_CODE: school,
      MLSV_FROM_YMD: from,
      MLSV_TO_YMD: to,
    });
    if (meal) params.set('MMEAL_SC_CODE', meal);
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?${params.toString()}`;
    const resp = await fetch(url);
    const json = await resp.json().catch(() => null);
    const rows = json?.mealServiceDietInfo?.[1]?.row || [];
    const slim = rows.map(r => ({
      MLSV_YMD: r.MLSV_YMD,
      MMEAL_SC_NM: r.MMEAL_SC_NM,
      DDISH_NM: r.DDISH_NM,
      CAL_INFO: r.CAL_INFO,
      NTR_INFO: r.NTR_INFO,
    }));
    res.status(200).json(slim);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
}
