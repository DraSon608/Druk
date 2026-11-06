import test from 'node:test';
import assert from 'node:assert/strict';
import { translations } from '../i18n/translations';

test('translations dictionary contains all required keys for both English and Dzongkha', () => {
  const enKeys = Object.keys(translations.en) as (keyof typeof translations.en)[];
  const dzKeys = Object.keys(translations.dz) as (keyof typeof translations.dz)[];

  assert.equal(enKeys.length, dzKeys.length);

  for (const key of enKeys) {
    assert.ok(translations.dz[key], `Missing Dzongkha translation for key: ${key}`);
    assert.ok(translations.dz[key].length > 0);
  }
});

test('translations for brand and core actions match official Dzongkha terminology', () => {
  assert.equal(translations.dz.brandName, 'འབྲུག');
  assert.equal(translations.dz.navDashboard, 'གཙོ་འཛིན་བརྡ་སྟོན');
  assert.equal(translations.dz.navPos, 'ཚོང་འབྲེལ་འཕྲུལ་ཆས');
  assert.equal(translations.dz.navReports, 'རང་འགུལ་སྙན་ཞུ');
  assert.equal(translations.dz.exportPdfBtn, '📄 པི་ཌི་ཨེཕ་ཕྱིར་འདྲེན');
  assert.equal(translations.dz.exportCsvBtn, '📊 སི་ཨེས་ཝི་ཕྱིར་འདྲེན');
});
