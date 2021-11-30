import { SyntheticEvent, useEffect, useRef, useState } from "react";
import drawOval from "../../../helpers/drawOval";
import hexToRgb from "../../../helpers/hexToRgb";
import { rgbToHex } from "../../../helpers/rgbToHex";
import ButtonsSection from "../../Components/ButtonsSection/ButtonsSection";
import style from "./RoomPage.module.css";

type Point = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  size?: number;
  filled?: boolean;
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

  let isDrawing = useRef<Boolean>(false);

  let overlayRef = useRef<HTMLCanvasElement>(null);
  let canvasRef = useRef<HTMLCanvasElement>(null);

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

  const renderToolPreview = (
    ctx: CanvasRenderingContext2D,
    mousePosition: Point
  ) => {
    ctx?.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx?.arc(mousePosition.x, mousePosition.y, toolSize / 2, 0, 2 * Math.PI);
    ctx?.stroke();
    ctx?.closePath();
  };

  const penToolRender = (ctx: CanvasRenderingContext2D, obj: DrawingData) => {
    // Render incoming pen data
    let points = obj.points;
    if (points.length < 6) {
      let p = points[0];
      ctx.beginPath();
      ctx.fillStyle = p.color as string;
      ctx.arc(p.x, p.y, p.size! / 2, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
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

      ctx!.strokeStyle = points[i].color as string;
      ctx.quadraticCurveTo(points[i].x, points[i].y, c1, c2);
    }
  };

  const rectToolRender = (
    ctx: CanvasRenderingContext2D,
    shape: DrawingData
  ) => {
    let firstPoint = shape.points[0];
    let lastPoint = shape.points[shape.points.length - 1];
    let width = lastPoint.x - firstPoint.x;
    let height = lastPoint.y - firstPoint.y;
    ctx!.lineJoin = "miter";
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
  const ellipseToolRender = (
    ctx: CanvasRenderingContext2D,
    shape: DrawingData
  ) => {
    const firstPoint = shape.points[0];
    const lastPoint = shape.points[shape.points.length - 1];

    drawOval(ctx!, firstPoint.x, firstPoint.y, lastPoint.x, lastPoint.y);
    if (!firstPoint.filled) {
      ctx.lineWidth = firstPoint.height as number;
      ctx.strokeStyle = firstPoint.color as string;
      ctx?.stroke();
    } else {
      ctx.fillStyle = firstPoint.color as string;
      ctx?.fill();
    }
  };

  const lineToolRender = (
    ctx: CanvasRenderingContext2D,
    shape: DrawingData
  ) => {
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
  interface MouseCords {
    x: number;
    y: number;
  }
  const colorPickerTool = (
    ctx: CanvasRenderingContext2D,
    mousePosition: MouseCords
  ): string => {
    const imageData = ctx.getImageData(
      mousePosition.x,
      mousePosition.y,
      1,
      1
    ).data;

    return rgbToHex(imageData[0], imageData[1], imageData[2]);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    setData([]);
  };

  const handlerOverlayMouseDown = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    let mousePos = getMousePosition(e);
    if (tool === "picker") {
      let color = colorPickerTool(
        canvasRef.current?.getContext("2d") as CanvasRenderingContext2D,
        mousePos
      );
      console.log(color);
      setTool("pen");
      setToolColor(color);
    } else {
      isDrawing.current = true;

      setData([
        ...data,
        {
          tool,
          points: [
            {
              x: mousePos.x,
              y: mousePos.y,
              color: toolColor,
              size: toolSize,
              filled: isFilled,
            },
          ],
        },
      ]);
    }
  };

  const handlerOverlayMouseMove = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    let ctx = overlayRef.current?.getContext("2d");
    let orCtx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let mousePos = getMousePosition(e);
    // Tool preview
    renderToolPreview(ctx!, mousePos);
    if (!isDrawing.current && tool !== "picker") {
      return;
    }

    let lastLine = data[data.length - 1];
    if (tool !== "picker") {
      lastLine.points = lastLine.points.concat([
        {
          x: mousePos.x,
          y: mousePos.y,
          color: toolColor,
          size: toolSize,
          filled: isFilled,
        },
      ]);
    }
    if (tool === "pen") {
      penToolRender(ctx!, lastLine);

      ctx?.stroke();
      penToolRender(orCtx!, lastLine);
    } else if (tool === "eraser") {
      penToolRender(ctx!, lastLine);
      ctx!.strokeStyle = "white";
      ctx?.stroke();

      penToolRender(orCtx!, lastLine);
    } else if (tool === "rectangle") {
      rectToolRender(ctx!, lastLine);
    } else if (tool === "ellipse") {
      ellipseToolRender(ctx!, lastLine);
    } else if (tool === "line") {
      lineToolRender(ctx!, lastLine);
    }
    renderToolPreview(ctx!, mousePos);
    if (tool !== "picker") {
      setData(data.concat());
    }
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

    renderToolPreview(overCtx!, getMousePosition(e));

    if (tool === "pen") {
      ctx?.stroke();
    } else if (tool === "eraser") {
      ctx?.stroke();
    } else if (tool === "rectangle") {
      rectToolRender(ctx!, lastShape);
    } else if (tool === "ellipse") {
      ellipseToolRender(ctx!, lastShape);
    } else if (tool === "line") {
      lineToolRender(ctx!, lastShape);
    }
  };

  useEffect(() => {
    let ctx = canvasRef.current?.getContext("2d");
    ctx!.globalCompositeOperation =
      tool === "eraser" ? "destination-out" : "source-over";
  }, [tool]);
  return (
    <div className={style.Wrapper}>
      <ButtonsSection
        onClick={(v: string) => setTool(v)}
        tool={tool}
        onClearCanvas={clearCanvas}
        onSetColor={setToolColor}
        color={toolColor}
      />

      <div>
        <div className={style.ToolsOptions}>
          <label>
            <span>Size</span>
            <input
              type="range"
              min="1"
              max="100"
              value={toolSize}
              onChange={(e) => setToolSize(+e.currentTarget.value)}
            />
          </label>

          <label>
            <span>Fill</span>
            <input
              type="checkbox"
              name="color"
              id="color"
              value={String(isFilled)}
              onClick={() => setIsFilled(!isFilled)}
            />
          </label>
        </div>
        <div className={style.Canvases}>
          <canvas
            ref={overlayRef}
            id={style.overlay}
            width={700}
            height={500}
            onMouseMove={handlerOverlayMouseMove}
            onMouseDown={handlerOverlayMouseDown}
            onMouseUp={handlerOverlayMouseUp}
          />

          <canvas
            className={style.canvas}
            ref={canvasRef}
            width={700}
            height={500}
            // onMouseMove={handlerOnMove}
            // onMouseDown={handlerOnMouseDown}
            // onMouseUp={handlerMouseUp}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
