const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor() { this.value = ''; this.children = []; this.events = {}; this.hidden = false; this.classList = { contains: () => false }; }
  set innerHTML(value) { this.html = value; this.children = []; }
  get innerHTML() { return this.html || ''; }
  appendChild(child) { this.children.push(child); }
  insertAdjacentHTML(_, html) { this.html = (this.html || '') + html; }
  addEventListener(name, callback) { this.events[name] = callback; }
  querySelector() { return null; }
}

function boot(search = '') {
  const department = new Element(), doctor = new Element();
  const appointment = new Element();
  appointment.querySelector = selector => selector.includes('name="department"') ? department : selector.includes('name="doctor"') ? doctor : null;
  const keyword = new Element(), filterDepartment = new Element(), specialization = new Element();
  const finder = new Element();
  finder.querySelector = selector => selector.includes('keyword') ? keyword : selector.includes('specialization') ? specialization : filterDepartment;
  finder.reset = () => { keyword.value = filterDepartment.value = specialization.value = ''; };
  const results = new Element(), count = new Element(), more = new Element(), reset = new Element(), actions = new Element(), home = new Element();
  more.querySelector = () => new Element();
  const selectors = new Map([
    ['[data-doctor-finder-form]', finder], ['[data-doctor-results]', results], ['[data-doctor-results-count]', count],
    ['[data-doctor-load-more]', more], ['[data-doctor-results-actions]', actions], ['[data-doctor-finder-reset]', reset],
    ['[data-doctors-carousel] .doctors-preview__grid', home],
  ]);
  const context = vm.createContext({ URLSearchParams, URL,
    window: { location: { search, href: 'https://example.test/appointment.html' }, addEventListener() {} },
    document: { body: null, querySelector: selector => selectors.get(selector) || null,
      querySelectorAll: selector => selector === '.appointment-banner__form, [data-appointment-form]' ? [appointment] : [],
      createElement: () => new Element() },
  });
  for (const file of ['departments.js', 'doctors.js', 'main.js', 'forms.js']) vm.runInContext(fs.readFileSync(`assets/js/${file}`, 'utf8'), context);
  const records = JSON.parse(vm.runInContext('JSON.stringify(hospitalDoctors)', context));
  return { context, records, department, doctor, keyword, filterDepartment, specialization, results, count, more, reset, actions, home };
}

const site = boot();
assert.equal(site.records.length, 44);
assert.equal(new Set(site.records.map(d => d.name)).size, 44);
assert.equal((site.home.innerHTML.match(/<article /g) || []).length, 44);
assert.equal((site.results.innerHTML.match(/<article /g) || []).length, 10);
site.more.events.click();
assert.equal((site.results.innerHTML.match(/<article /g) || []).length, 30);
site.more.events.click();
assert.equal((site.results.innerHTML.match(/<article /g) || []).length, 44);
assert.equal(site.actions.hidden, true);

// Every brochure entry is searchable and its booking URL preserves its department and name.
for (const record of site.records) {
  site.keyword.value = record.name;
  site.keyword.events.input();
  assert(site.results.innerHTML.includes(`<h3>${record.name}</h3>`), record.name);
  const prefilled = boot('?' + new URLSearchParams({ doctor: record.name, department: record.department }));
  assert.equal(prefilled.department.value, record.department);
  assert.equal(prefilled.doctor.value, record.name);
  assert(prefilled.doctor.children.some(option => option.value === record.name && option.textContent.includes(record.qualifications)));
  const href = /doctor-search-card__book" href="([^"]+)"/.exec(prefilled.results.innerHTML)[1].replace(/&amp;/g, '&');
  assert.equal(new URL(href, 'https://example.test').searchParams.get('doctor'), record.name);
}
site.reset.events.click();
site.specialization.value = 'Dental Surgery';
site.specialization.events.change();
assert.equal(site.count.textContent, '2 doctors found');
assert(site.results.innerHTML.includes('BDS, MDS'));
assert(!site.results.innerHTML.includes('MBBS'));
site.reset.events.click();
site.keyword.value = 'no such doctor';
site.keyword.events.input();
assert.equal(site.count.textContent, '0 doctors found');
assert.equal(site.results.innerHTML, '');
site.department.value = 'Dermatology';
site.department.events.change();
assert(site.doctor.children.some(option => option.value === 'Dr. Chandan'));
assert.equal(site.doctor.value, '');
site.department.value = 'Physiotherapy';
site.department.events.change();
assert.equal(site.doctor.disabled, true);
assert(!site.home.innerHTML.includes('Available Today'));
const departments = JSON.parse(vm.runInContext('JSON.stringify(hospitalDepartments)', site.context));
assert.equal(departments.length, 24);
for (const department of departments) {
  assert(site.department.children.some(option => option.value === department));
  const selected = boot('?' + new URLSearchParams({ department }));
  assert.equal(selected.department.value, department);
}
for (const [department, doctor] of [['Cardiac Surgery', 'Dr. Kunal Kumar'], ['Laparoscopic Surgery', 'Dr. Manish Kumar']]) {
  const selected = boot('?' + new URLSearchParams({ department, doctor }));
  assert.equal(selected.department.value, department);
  assert.equal(selected.doctor.value, doctor);
  assert(selected.doctor.children.some(option => option.value === doctor));
}
assert(!site.department.children.some(option => option.value === 'Kidney Transplant'));
const departmentPage = fs.readFileSync('departments.html', 'utf8');
assert.equal((departmentPage.match(/data-department>/g) || []).length, 24);
assert.equal((departmentPage.match(/data-facility>/g) || []).length, 0);
for (const department of departments) {
  const encoded = department.replace(/&/g, '&amp;');
  assert(departmentPage.includes(`<h3>${encoded}</h3>`), department);
}
for (const file of fs.readdirSync('.').filter(file => file.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  assert(html.indexOf('assets/js/departments.js') < html.indexOf('assets/js/doctors.js'), file);
  assert(html.indexOf('assets/js/doctors.js') < html.indexOf('assets/js/main.js'), file);
}
console.log('Passed: 24 department cards, no facility cards, department dropdowns, surgical booking selections and script order.');
console.log('Passed: 44 brochure entries, homepage cards, search, filters, pagination, all booking links/prefills, dropdown degrees and unassigned departments.');
