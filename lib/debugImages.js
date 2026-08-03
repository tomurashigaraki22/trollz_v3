// TEMPORARY QA TOGGLE — pre-launch test to see how every page degrades when
// product/banner images fail to load, across devices. Does not touch stored
// data or uploaded files; it only corrupts the URL at render time so the
// browser 404s on it. To restore normal images, flip BREAK_IMAGES to false
// (or delete the calls to qaImg() — this file can be removed once the test
// is done).
export const BREAK_IMAGES = true;

export function qaImg(src) {
  if (!BREAK_IMAGES || !src) return src;
  return `${src}2`;
}
