// Simple verification of tenGod calculation
// 己土 element properties
const jiProps = { element: '土', polarity: 'yin' };

// Test cases
const tests = [
  { stem: '癸', props: { element: '水', polarity: 'yin' } },
  { stem: '甲', props: { element: '木', polarity: 'yang' } },
  { stem: '壬', props: { element: '水', polarity: 'yang' } }
];

// Wu Xing control cycle
const CONTROLS = { 土: '水' };

console.log('己土 day stem analysis:');
tests.forEach(({ stem, props }) => {
  const relation = jiProps.element === props.element ? 'same' :
    CONTROLS[jiProps.element] === props.element ? 'controls' :
    CONTROLS[props.element] === jiProps.element ? 'controlled-by' :
    props.element === '木' && jiProps.element === '土' ? 'controlled-by' : 'other';

  const samePol = jiProps.polarity === props.polarity;

  let tenGod = '';
  if (relation === 'controls') {
    tenGod = samePol ? '偏財' : '正財';
  } else if (relation === 'controlled-by') {
    tenGod = samePol ? '七殺' : '正官';
  }

  console.log(`  ${stem} (${props.element}, ${props.polarity}): relation=${relation}, samePol=${samePol} → ${tenGod}`);
});
