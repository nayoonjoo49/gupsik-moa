// Helper: format date to YYYYMMDD
function fmtYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

const input = document.getElementById('school-search');
const btnSearch = document.getElementById('btn-search');
const results = document.getElementById('search-results');
const selectedSection = document.getElementById('selected-school');
const schoolName = document.getElementById('school-name');
const schoolMeta = document.getElementById('school-meta');
const monthInput = document.getElementById('month');
const mealType = document.getElementById('meal-type');
const btnLoad = document.getElementById('btn-load');
const mealsDiv = document.getElementById('meals');

let selectedSchool = null;

async function searchSchools() {
  const q = input.value.trim();
  if (!q) return;
  btnSearch.disabled = true;
  results.innerHTML = '검색 중...';
  try {
    const res = await fetch(`/api/schools?name=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('검색 실패');
    const data = await res.json();
    const items = data.map(s => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<div><strong>${s.SCHUL_NM}</strong>
        <div class="meta">${s.ATPT_OFCDC_SC_NM || ''} · ${s.SCHUL_KND_SC_NM || ''}</div></div>
        <button data-office="${s.ATPT_OFCDC_SC_CODE}" data-school="${s.SD_SCHUL_CODE}" data-name="${s.SCHUL_NM}">선택</button>`;
      div.querySelector('button').addEventListener('click', () => selectSchool(s));
      return div;
    });
    results.innerHTML = '';
    if (items.length === 0) {
      results.textContent = '검색 결과가 없습니다. 정확한 학교명을 입력해보세요.';
    } else {
      items.forEach(el => results.appendChild(el));
    }
  } catch (e) {
    results.textContent = '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  } finally {
    btnSearch.disabled = false;
  }
}

function selectSchool(s) {
  selectedSchool = s;
  schoolName.textContent = s.SCHUL_NM;
  schoolMeta.textContent = `${s.ATPT_OFCDC_SC_NM || ''} · ${s.ORG_RDNMA || ''}`;
  selectedSection.classList.remove('hidden');
  const d = new Date();
  monthInput.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
  mealsDiv.innerHTML = '';
}

async function loadMeals() {
  if (!selectedSchool) return;
  btnLoad.disabled = true;
  mealsDiv.innerHTML = '불러오는 중...';
  try {
    const ym = monthInput.value;
    if (!ym) return;
    const [y, m] = ym.split('-').map(v => parseInt(v, 10));
    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0);
    const qs = new URLSearchParams({
      office: selectedSchool.ATPT_OFCDC_SC_CODE,
      school: selectedSchool.SD_SCHUL_CODE,
      from: fmtYMD(from),
      to: fmtYMD(to),
      meal: mealType.value
    });
    const res = await fetch(`/api/meals?${qs.toString()}`);
    if (!res.ok) throw new Error('급식 조회 실패');
    const rows = await res.json();
    mealsDiv.innerHTML = '';
    if (!rows.length) {
      mealsDiv.textContent = '해당 월의 급식 정보가 없습니다.';
      return;
    }
    rows.forEach(r => {
      const div = document.createElement('div');
      const date = r.MLSV_YMD?.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
      const dishes = (r.DDISH_NM || '').replace(/<br\s*\/?>(?=\S)/gi, '\n').split('\n').filter(Boolean);
      div.className = 'meal';
      div.innerHTML = `<h3>${date} (${r.MMEAL_SC_NM || ''})</h3>
        <div class="tags">${r.CAL_INFO || ''}</div>
        <pre style="white-space:pre-wrap;margin:8px 0 0">${dishes.join('\n')}</pre>`;
      mealsDiv.appendChild(div);
    });
  } catch (e) {
    mealsDiv.textContent = '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  } finally {
    btnLoad.disabled = false;
  }
}

btnSearch.addEventListener('click', searchSchools);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchSchools(); });
btnLoad.addEventListener('click', loadMeals);
