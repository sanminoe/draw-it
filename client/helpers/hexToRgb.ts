export default (hex: string) => {
  let h = hex.substr(1);
  var bigint = parseInt(h, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return r + "," + g + "," + b;
};
