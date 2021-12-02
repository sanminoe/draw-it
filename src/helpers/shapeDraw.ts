import type { Shape } from "../types/generic";

const penDraw = (ctx: CanvasRenderingContext2D, obj: Shape) => {
  // Render incoming pen data

  let points = obj.points;
  if (points.length < 6) {
    let p = points[0];
    ctx.beginPath();

    ctx.fillStyle = p.color as string;
    ctx.arc(p.x, p.y, Math.floor(p.size! / 2), 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    return;
  }

  ctx.beginPath();
  ctx!.lineCap = "round";
  ctx!.lineJoin = "round";
  ctx!.lineWidth = points[0].size as number;
  ctx.moveTo(points[0].x, points[0].y);
  ctx.strokeStyle = "white";

  let i = 1;
  for (i = 1; i < points.length - 2; i++) {
    const c1 = (points[i].x + points[i + 1].x) / 2;
    const c2 = (points[i].y + points[i + 1].y) / 2;

    ctx!.strokeStyle = points[i].color as string;
    ctx.quadraticCurveTo(points[i].x, points[i].y, c1, c2);
  }
};

const eraserDraw = (ctx: CanvasRenderingContext2D, obj: Shape) => {
  // Render incoming pen data
  let points = obj.points;

  if (points.length < 6) {
    let p = points[0];
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(p.x, p.y, Math.floor(p.size! / 2), 0, Math.PI * 2, false);

    ctx.fill();
    ctx.closePath();
    return;
  }

  ctx.beginPath();
  ctx!.lineCap = "round";
  ctx!.lineJoin = "round";
  ctx!.lineWidth = points[0].size as number;
  ctx.moveTo(points[0].x, points[0].y);

  let i = 1;
  for (i = 1; i < points.length - 2; i++) {
    const c1 = (points[i].x + points[i + 1].x) / 2;
    const c2 = (points[i].y + points[i + 1].y) / 2;

    ctx!.strokeStyle = "white";
    ctx.quadraticCurveTo(points[i].x, points[i].y, c1, c2);
  }
};

const rectangleDraw = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  let firstPoint = shape.points[0];
  let lastPoint = shape.points[shape.points.length - 1];
  let width = lastPoint.x - firstPoint.x;
  let height = lastPoint.y - firstPoint.y;

  ctx!.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx?.beginPath();
  if (firstPoint.filled) {
    ctx!.fillStyle = firstPoint.color as string;
    ctx?.fillRect(firstPoint.x, firstPoint.y, width, height);
  } else {
    ctx!.lineWidth = firstPoint.size as number;
    ctx!.strokeStyle = firstPoint.color as string;
    ctx?.rect(firstPoint.x, firstPoint.y, width, height);

    ctx?.stroke();
  }
  ctx?.closePath();
};

const ellipseDraw = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  const firstPoint = shape.points[0];
  const lastPoint = shape.points[shape.points.length - 1];
  ctx.lineCap = "round";

  ctx.beginPath();

  ctx.moveTo(firstPoint.x, firstPoint.y + (lastPoint.y - firstPoint.y) / 2);
  ctx.bezierCurveTo(
    firstPoint.x,
    firstPoint.y,
    lastPoint.x,
    firstPoint.y,
    lastPoint.x,
    firstPoint.y + (lastPoint.y - firstPoint.y) / 2
  );
  ctx.bezierCurveTo(
    lastPoint.x,
    lastPoint.y,
    firstPoint.x,
    lastPoint.y,
    firstPoint.x,
    firstPoint.y + (lastPoint.y - firstPoint.y) / 2
  );

  ctx.lineWidth = firstPoint.size as number;
  if (!firstPoint.filled) {
    ctx.strokeStyle = firstPoint.color as string;
    ctx?.stroke();
  } else {
    ctx.fillStyle = firstPoint.color as string;
    ctx?.fill();
  }
  ctx.closePath();
};

const lineDraw = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  const firstPoint = shape.points[0],
    lastPoint = shape.points[shape.points.length - 1];
  ctx?.beginPath();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = firstPoint.size as number;
  ctx.strokeStyle = firstPoint.color as string;
  ctx.moveTo(firstPoint.x, firstPoint.y);
  ctx.lineTo(lastPoint.x, lastPoint.y);
  ctx.stroke();
};
export { rectangleDraw, lineDraw, ellipseDraw, penDraw, eraserDraw };
