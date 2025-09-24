export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const { name } = req.query;
    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }
    const key = process.env.NEIS_KEY;
    if (!key) {
      res.status(500).json({ error: 'Server not configured: NEIS_KEY missing' });
      return;
    }
    const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${encodeURIComponent(key)}&Type=json&pIndex=1&pSize=100&SCHUL_NM=${encodeURIComponent(name)}`;
    const resp = await fetch(url);
    const json = await resp.json().catch(() => null);
    const rows = json?.schoolInfo?.[1]?.row || [];
    const slim = rows.map(r => ({
      SCHUL_NM: r.SCHUL_NM,
      SCHUL_KND_SC_NM: r.SCHUL_KND_SC_NM,
      ATPT_OFCDC_SC_CODE: r.ATPT_OFCDC_SC_CODE,
      ATPT_OFCDC_SC_NM: r.ATPT_OFCDC_SC_NM,
      SD_SCHUL_CODE: r.SD_SCHUL_CODE,
      ORG_RDNMA: r.ORG_RDNMA,
    }));
    res.status(200).json(slim);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
}
