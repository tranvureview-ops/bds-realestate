async function check() {
  const res = await fetch('http://localhost:3000/_next/static/chunks/src_app_globals_162hn9oqc8uss.css');
  const css = await res.text();
  console.log('lg:flex in css:', css.includes('lg\\:flex'));
  console.log('max-w-screen-2xl in css:', css.includes('max-w-screen-2xl'));
  console.log('animate-in in css:', css.includes('animate-in'));
  console.log('fade-in in css:', css.includes('fade-in'));
  console.log('shimmer in css:', css.includes('shimmer'));
}
check().catch(console.error);
