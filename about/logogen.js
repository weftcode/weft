console.log(`<svg version="1.1"
     width="150" height="150"
     xmlns="http://www.w3.org/2000/svg">\n`);

const color = "tomato";
const margin = 5;
const width = 20;

const size = width * 7;

let data = [
  `M ${margin} ${margin}`,
  `l 0 ${size - width * 1.5}`,
  `a ${width * 1.5} ${width * 1.5} 0 1 0 ${width * 3} 0`,
  `l 0 ${width * 3 - size}`,
  `a ${width * 0.5} ${width * 0.5} 0 0 1 ${width} 0`,
  `l 0 ${size - width * 3}`,
  `a ${width * 1.5} ${width * 1.5} 0 1 0 ${width * 3} 0`,
  `l 0 ${width * 1.5 - size}`,
  `l ${-width} 0`,
  `l 0 ${size - width * 1.5}`,
  `a ${width * 0.5} ${width * 0.5} 0 0 1 ${-width} 0`,
  `l 0 ${width * 3 - size}`,
  `a ${width * 1.5} ${width * 1.5} 0 1 0 ${-width * 3} 0`,
  `l 0 ${size - width * 3}`,
  `a ${width * 0.5} ${width * 0.5} 0 0 1 ${-width} 0`,
  `l 0 ${width * 1.5 - size}`,
  `Z`,
];

console.log(`<path d="${data.join(" ")}" fill="${color}" />\n`);

console.log(`</svg>`);
