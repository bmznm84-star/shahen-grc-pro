
(function(){
  const themeBtn = document.getElementById('themeBtn');
  if(themeBtn){
    const applyTheme = (t)=>{
      if(t==='dark'){ document.documentElement.classList.add('dark'); localStorage.theme='dark'; }
      else { document.documentElement.classList.remove('dark'); localStorage.theme='light'; }
    };
    applyTheme(localStorage.theme || 'dark');
    themeBtn.onclick = ()=> applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
  }
  const levelSelect = document.getElementById('levelSelect');
  const levelLabel = document.getElementById('levelLabel');
  let level = localStorage.level || 'sector';
  if(levelSelect){ levelSelect.value = level; levelLabel.textContent = levelSelect.selectedOptions[0].textContent; }
  levelSelect && (levelSelect.onchange = (e)=>{ level = e.target.value; localStorage.level = level; levelLabel.textContent = e.target.selectedOptions[0].textContent; render(); });

  async function loadData(){ const res = await fetch('data/data.json?_=' + Date.now()); return await res.json(); }
  let charts = {};
  function bar(ctx, labels, data){ return new Chart(ctx, { type: 'bar', data: { labels, datasets: [{ data }]}, options: { responsive: true, scales: { y: { beginAtZero:true, max: 100 }}}}); }
  function radar(ctx, labels, data){ return new Chart(ctx, { type: 'radar', data: { labels, datasets: [{ data }]}, options: { responsive: true, scales: { r: { beginAtZero:true, max:100 }}}}); }
  function doughnut(ctx, labels, data){ return new Chart(ctx, { type:'doughnut', data:{ labels, datasets:[{ data }]}, options:{ responsive:true }}); }
  function renderHeat(el, items){
    el.innerHTML = items.map(v=>`<div class="rounded-lg p-2 border text-xs" style="background:${['#fee2e2','#fecaca','#fdba74','#bef264','#86efac'][v.level-1]}">${v.code}</div>`).join('');
  }
  function renderList(id, arr){ const el = document.getElementById(id); if(!el) return; el.innerHTML = arr.map(x=>`<li class="flex items-center justify-between"><span>${x.title}</span><span class="text-xs text-gray-500">${x.note||''}</span></li>`).join(''); }
  function renderMatrix(el, data){
    el.innerHTML = ''; const cats = ['KPI','KRI','KCI'];
    cats.forEach(cat=>{
      const blk = document.createElement('div');
      blk.innerHTML = `<div class="font-bold mb-2">${cat}</div>` + data.filter(d=>d.type===cat).map(d=>`<div class="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800"><span>${d.name}</span><span class="text-xs chip">${d.value}${d.unit||''}</span></div>`).join('');
      el.appendChild(blk);
    });
  }
  function renderAssuranceRows(tbody, items){ tbody.innerHTML = items.map(r=>`<tr><td class="py-1">${r.item}</td><td>${r.priority}</td><td>${r.owner}</td><td>${r.quarter}</td><td><span class="chip">${r.status}</span></td></tr>`).join(''); }
  async function render(){
    const d = await loadData(); const L = d[localStorage.level || 'sector'];
    // KPIs
    const emp = document.getElementById('employees'); emp && (emp.textContent = L.kpis.employees.toLocaleString('ar-EG'));
    const saud = document.getElementById('saudization'); saud && (saud.textContent = L.kpis.saudization);
    const shList = document.getElementById('shipmentList'); if(shList){ shList.innerHTML = Object.entries(L.shipments).map(([k,v])=>`<div class="chip justify-between"><span>${k}</span><span class="font-bold">${v}</span></div>`).join(''); }
    const inc = document.getElementById('incidents'); const incBar = document.getElementById('incidentBar'); if(inc){ inc.textContent = L.kri.incidents; incBar && (incBar.style.width = Math.min(100, L.kri.incidents_index) + '%'); }
    // Charts
    const vuca = document.getElementById('vucaChart')?.getContext('2d'); if(vuca){ charts.vuca && charts.vuca.destroy(); charts.vuca = bar(vuca, ['تقلب','عدم يقين','تعقيد','غموض'], [L.vuca.volatility,L.vuca.uncertainty,L.vuca.complexity,L.vuca.ambiguity]); }
    const uoc = document.getElementById('uocRadar')?.getContext('2d'); if(uoc){ charts.uoc && charts.uoc.destroy(); charts.uoc = radar(uoc, L.uoc.labels, L.uoc.values); }
    const perf = document.getElementById('perfQuad')?.getContext('2d'); if(perf){ charts.perf && charts.perf.destroy(); charts.perf = doughnut(perf, ['فعالية','كفاءة','استجابة','مرونة'], [L.performance.effectiveness,L.performance.efficiency,L.performance.responsiveness,L.performance.resilience]); }
    const mind = document.getElementById('mindsetRadar')?.getContext('2d'); if(mind){ charts.mind && charts.mind.destroy(); charts.mind = radar(mind, ['تعاون','استقرارية','مساءلة','رؤية','تنوع تخصصات','استباقية'], L.mindset); }
    // Heat
    const heat = document.getElementById('maturityHeat'); heat && renderHeat(heat, d.maturity_grid);
    // Matrix + Assurance
    const kkk = document.getElementById('kkkMatrix'); kkk && renderMatrix(kkk, L.metrics_matrix);
    const assure = document.querySelector('#assuranceTable tbody'); assure && renderAssuranceRows(assure, L.assurance);
    // Strategy / Performance
    renderList('learnList', L.learn); renderList('alignList', L.align);
    const okc = document.getElementById('okcChart')?.getContext('2d'); if(okc){ charts.okc && charts.okc.destroy(); charts.okc = bar(okc, L.okc.labels, L.okc.values); }
    renderList('performList', L.perform); renderList('reviewList', L.review);
    const kpiC = document.getElementById('kpiChart')?.getContext('2d'); if(kpiC){ charts.kpi && charts.kpi.destroy(); charts.kpi = bar(kpiC, L.kpi.labels, L.kpi.values); }
    const kriC = document.getElementById('kriChart')?.getContext('2d'); if(kriC){ charts.kri && charts.kri.destroy(); charts.kri = bar(kriC, L.kri_detail.labels, L.kri_detail.values); }
    const kciC = document.getElementById('kciChart')?.getContext('2d'); if(kciC){ charts.kci && charts.kci.destroy(); charts.kci = bar(kciC, L.kci.labels, L.kci.values); }
    // Risks
    const riskBody = document.querySelector('#riskTable tbody'); riskBody && (riskBody.innerHTML = L.risks.map(r=>`<tr><td class="py-1">${r.name}</td><td>${r.p}</td><td>${r.i}</td><td>${r.rating}</td><td>${r.when}</td></tr>`).join(''));
    // Obligations & Assurance
    const oblBody = document.querySelector('#oblTable tbody'); oblBody && (oblBody.innerHTML = L.obligations.map(o=>`<tr><td class="py-1">${o.title}</td><td>${o.reg}</td><td>${o.due}</td><td>${o.type}</td><td>${o.status}</td></tr>`).join(''));
    const assureBody = document.querySelector('#assureTable tbody'); assureBody && renderAssuranceRows(assureBody, L.assurance);
    // IACM / BCM
    renderList('iacmList', L.iacm); renderList('bcmList', L.bcm);
    // Stakeholders
    const stakeBody = document.querySelector('#stakeTable tbody'); stakeBody && (stakeBody.innerHTML = L.stakeholders.map(s=>`<tr><td class="py-1">${s.name}</td><td>${s.priority}</td><td>${s.expect}</td><td>${s.channel}</td><td>${s.owner}</td></tr>`).join(''));
    // Maturity table
    const matBody = document.querySelector('#maturityTable tbody'); matBody && (matBody.innerHTML = d.maturity_details.map(m=>`<tr><td class="py-1">${m.comp}</td><td>${m.item}</td><td>${m.current}</td><td>${m.target}</td><td>${m.target-m.current}</td></tr>`).join(''));
    // Data preview
    const pre = document.getElementById('jsonPreview'); pre && (pre.textContent = JSON.stringify(d, null, 2));
  }
  render();
})();