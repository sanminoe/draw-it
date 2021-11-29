import { SyntheticEvent, useEffect, useRef, useState } from "react";
import drawOval from "../../../helpers/drawOval";
import hexToRgb from "../../../helpers/hexToRgb";
import style from "./RoomPage.module.css";

type Point = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
};
interface DrawingData {
  tool: string;
  points: Point[];
}
function RoomPage() {
  let [tool, setTool] = useState("pen");
  let [toolSize, setToolSize] = useState(10);
  let [data, setData] = useState<DrawingData[]>([]);
  const [toolColor, setToolColor] = useState("#000000");
  let [isFilled, setIsFilled] = useState(false);
  const [toolOpacity, setToolOpacity] = useState(1);

  let isDrawing = useRef<Boolean>(false);

  let overlayRef = useRef<HTMLCanvasElement>(null);
  let canvasRef = useRef<HTMLCanvasElement>(null);

  const handlerOnMouseDown = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ): void => {
    isDrawing.current = true;
    const mousePos = getMousePosition(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (tool === "pen") {
      ctx?.beginPath();
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";
      ctx!.lineWidth = toolSize;
      ctx?.moveTo(mousePos.x, mousePos.y);
    } else if (tool === "eraser") {
      ctx?.beginPath();
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";
      ctx!.lineWidth = toolSize;
      ctx?.moveTo(mousePos.x, mousePos.y);
    }
    setData([...data, { tool, points: [{ x: mousePos.x, y: mousePos.y }] }]);
  };

  const handlerOnMove = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ): void => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current!.getContext("2d");
    const mousePos = getMousePosition(e);

    if (tool === "pen") {
      // data.map((d) => {
      //   render(ctx!, d);
      // });
      let color = `rgba(${hexToRgb(toolColor)},${toolOpacity})`;
      ctx!.strokeStyle = color;
      ctx?.lineTo(mousePos.x, mousePos.y);
      ctx!.globalCompositeOperation = "source-over";
      ctx!.stroke();
    } else if (tool === "eraser") {
      ctx?.lineTo(mousePos.x, mousePos.y);
      ctx?.stroke();
    }

    let lastLine = data[data.length - 1];

    lastLine.points = lastLine.points.concat([
      { x: mousePos.x, y: mousePos.y },
    ]);
    setData(data.concat());
  };

  const handlerMouseUp = (e: SyntheticEvent<HTMLCanvasElement, MouseEvent>) => {
    const ctx = canvasRef.current!.getContext("2d");
    ctx?.stroke();

    isDrawing.current = false;
  };

  const getMousePosition = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    let x =
      e.nativeEvent.clientX - canvasRef.current!.getBoundingClientRect().left;
    let y =
      e.nativeEvent.clientY - canvasRef.current!.getBoundingClientRect().top;
    return {
      x,
      y,
    };
  };

  const render = (ctx: CanvasRenderingContext2D, obj: DrawingData) => {
    // Render incoming data
    let points = obj.points;
    if (points.length < 6) {
      let p = points[0];
      ctx.beginPath();
      ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx!.lineCap = "round";
    ctx!.lineJoin = "round";
    ctx!.lineWidth = 30;

    ctx.moveTo(points[0].x, points[0].y);

    let i = 1;

    for (i = 1; i < points.length - 2; i++) {
      const c1 = (points[i].x + points[i + 1].x) / 2;
      const c2 = (points[i].y + points[i + 1].y) / 2;

      ctx.quadraticCurveTo(points[i].x, points[i].y, c1, c2);
    }
    ctx.stroke();
  };

  useEffect(() => {
    let ctx = canvasRef.current?.getContext("2d");
    ctx!.globalCompositeOperation =
      tool === "eraser" ? "destination-out" : "source-over";
  }, [tool]);

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    setData([]);
  };

  const handlerOverlayMouseDown = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    let mousePos = getMousePosition(e);
    isDrawing.current = true;

    setData([...data, { tool, points: [{ x: mousePos.x, y: mousePos.y }] }]);
  };

  const handlerOverlayMouseMove = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!isDrawing.current) {
      return;
    }
    let ctx = overlayRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let mousePos = getMousePosition(e);
    let lastLine = data[data.length - 1];
    if (tool === "rectangle") {
      let width = mousePos.x - lastLine.points[0].x;
      let height = mousePos.y - lastLine.points[0].y;

      ctx?.beginPath();
      if (isFilled) {
        ctx?.fillRect(
          lastLine.points[0].x,
          lastLine.points[0].y,
          width,
          height
        );
      } else {
        ctx?.rect(lastLine.points[0].x, lastLine.points[0].y, width, height);
        ctx!.lineWidth = toolSize;
        ctx?.stroke();
      }
      ctx?.closePath();

      lastLine.points = lastLine.points.concat([
        { x: mousePos.x, y: mousePos.y, width, height },
      ]);
    } else if (tool === "ellipse") {
      drawOval(
        ctx!,
        lastLine.points[0].x,
        lastLine.points[0].y,
        mousePos.x,
        mousePos.y
      );

      if (!isFilled) {
        ctx!.lineWidth = toolSize;
        ctx?.stroke();
      } else {
        ctx?.fill();
      }

      lastLine.points = lastLine.points.concat([
        { x: mousePos.x, y: mousePos.y },
      ]);
    } else if (tool === "line") {
      ctx?.beginPath();
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";
      ctx!.lineWidth = toolSize;
      ctx?.moveTo(lastLine.points[0].x, lastLine.points[0].y);
      ctx?.lineTo(mousePos.x, mousePos.y);
      ctx?.stroke();
      lastLine.points = lastLine.points.concat([
        { x: mousePos.x, y: mousePos.y },
      ]);
    }

    setData(data.concat());
  };
  const handlerOverlayMouseUp = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    // Render to the main canvas
    isDrawing.current = false;
    let overCtx = overlayRef.current?.getContext("2d");
    overCtx?.clearRect(0, 0, overCtx.canvas.width, overCtx.canvas.height);
    let ctx = canvasRef.current?.getContext("2d");
    let lastShape = data[data.length - 1];
    let firstPoint = lastShape.points[0];
    let lastPoint = lastShape.points[lastShape.points.length - 1];

    if (tool === "rectangle") {
      ctx?.beginPath();
      ctx!.lineJoin = "miter";
      ctx!.lineCap = "butt";
      if (isFilled) {
        ctx!.fillRect(
          firstPoint.x,
          firstPoint.y,
          lastPoint.width!,
          lastPoint.height!
        );
      } else {
        ctx!.lineWidth = toolSize;
        ctx!.rect(
          firstPoint.x,
          firstPoint.y,
          lastPoint.width!,
          lastPoint.height!
        );
        ctx!.stroke();
      }
      ctx!.closePath();
    } else if (tool === "ellipse") {
      drawOval(ctx!, firstPoint.x, firstPoint.y, lastPoint.x, lastPoint.y);
      if (!isFilled) {
        ctx!.lineWidth = toolSize;
        ctx?.stroke();
      } else {
        ctx?.fill();
      }
    } else if (tool === "line") {
      ctx?.beginPath();
      ctx!.lineWidth = toolSize;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      ctx?.moveTo(firstPoint.x, firstPoint.y);
      ctx?.lineTo(lastPoint.x, lastPoint.y);
      ctx?.stroke();
    }
  };

  return (
    <div className={style.Wrapper}>
      <div className={style.ToolsButtons}>
        <button onClick={() => setTool("pen")}>Pen</button>
        <button onClick={() => setTool("eraser")}>Eraser</button>
        <button onClick={() => setTool("rectangle")}>rectangle</button>
        <button onClick={() => setTool("ellipse")}>Elipse</button>
        <button onClick={() => setTool("line")}>Line</button>
        <button onClick={() => clearCanvas()}>Clear</button>
      </div>
      <div>
        <div className={style.ToolsOptions}>
          <label>
            <span>Size</span>
            <input
              type="range"
              min="1"
              max="50"
              value={toolSize}
              onChange={(e) => setToolSize(+e.currentTarget.value)}
            />
          </label>
          <label>
            <span>Opacity</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={toolOpacity}
              onChange={(e) => setToolOpacity(+e.target.value)}
            />
          </label>
          <label>
            <span>Color</span>
            <input
              type="color"
              name="color"
              id="color"
              value={toolColor}
              onChange={(e) => setToolColor(e.target.value)}
            />
          </label>
        </div>
        <div className={style.Canvases}>
          {tool !== "pen" && tool !== "eraser" && (
            <canvas
              ref={overlayRef}
              id={style.overlay}
              width={700}
              height={500}
              onMouseMove={handlerOverlayMouseMove}
              onMouseDown={handlerOverlayMouseDown}
              onMouseUp={handlerOverlayMouseUp}
            />
          )}
          <canvas
            className={style.canvas}
            ref={canvasRef}
            width={700}
            height={500}
            onMouseMove={handlerOnMove}
            onMouseDown={handlerOnMouseDown}
            onMouseUp={handlerMouseUp}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
