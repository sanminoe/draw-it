export default (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  x: number,
  y: number
) => {
  ctx.beginPath();
  ctx.moveTo(startX, startY + (y - startY) / 2);
  ctx.bezierCurveTo(startX, startY, x, startY, x, startY + (y - startY) / 2);
  ctx.bezierCurveTo(x, y, startX, y, startX, startY + (y - startY) / 2);
  ctx.closePath();
};
