import { SyntheticEvent, useEffect, useRef, useState } from "react";
import drawOval from "../../../helpers/drawOval";
import { rgbToHex } from "../../../helpers/rgbToHex";
import ButtonsSection from "../../Components/ButtonsSection/ButtonsSection";
import style from "./RoomPage.module.css";
// import socketIOClient from "socket.io-client";

import { BsGithub } from "react-icons/bs";

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
type History = DrawingData[];

function RoomPage() {
  // Canvas state
  let [data, setData] = useState<DrawingData[]>([]);

  // Tools settings
  let [tool, setTool] = useState("pen");
  let [toolSize, setToolSize] = useState(10);
  const [toolColor, setToolColor] = useState("#000000");
  let [isFilled, setIsFilled] = useState(false);

  // Drawing history
  const [historyData, setHistoryData] = useState<History[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

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
      ctx.arc(p.x, p.y, Math.floor(ctx.lineWidth / 2), 0, Math.PI * 2, false);
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
    ctx.beginPath();
    drawOval(ctx!, firstPoint.x, firstPoint.y, lastPoint.x, lastPoint.y);
    ctx.lineWidth = firstPoint.size as number;
    if (!firstPoint.filled) {
      ctx.strokeStyle = firstPoint.color as string;
      ctx?.stroke();
    } else {
      // ctx.lineWidth = firstPoint.height as number;
      ctx.fillStyle = firstPoint.color as string;
      ctx?.fill();
    }
    ctx.closePath();
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

  // const fillToolHandler = (
  //   ctx: CanvasRenderingContext2D,
  //   startX: number,
  //   startY: number,
  //   startR: number,
  //   startG: number,
  //   startB: number
  // ) => {};

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    setData([]);
  };

  const handlerOverlayMouseDown = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    let mousePos = getMousePosition(e);
    let ctx = overlayRef.current?.getContext("2d");
    let orCtx = canvasRef.current?.getContext("2d");
    if (tool === "picker") {
      let color = colorPickerTool(orCtx as CanvasRenderingContext2D, mousePos);
      setTool("pen");
      setToolColor(color);
    } else {
      isDrawing.current = true;

      let shape = {
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
      };

      if (shape.tool === "pen") {
        penToolRender(ctx!, shape);

        penToolRender(orCtx!, shape);
      } else if (tool === "eraser") {
        penToolRender(ctx!, shape);
        ctx!.strokeStyle = "white";

        penToolRender(orCtx!, shape);
      } else if (tool === "rectangle") {
        rectToolRender(ctx!, shape);
      } else if (tool === "ellipse") {
        ellipseToolRender(ctx!, shape);
        ctx!.lineWidth = toolSize;
      } else if (tool === "line") {
        lineToolRender(ctx!, shape);
      }

      setData([...data, shape]);
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

    let lastShape = data[data.length - 1];
    lastShape.points = lastShape.points.concat([
      {
        x: mousePos.x,
        y: mousePos.y,
        color: toolColor,
        size: toolSize,
        filled: isFilled,
      },
    ]);
    if (tool === "pen") {
      penToolRender(ctx!, lastShape);
      penToolRender(orCtx!, lastShape);

      ctx?.stroke();
    } else if (tool === "eraser") {
      penToolRender(ctx!, lastShape);
      ctx!.strokeStyle = "white";
      ctx?.stroke();

      penToolRender(orCtx!, lastShape);
    } else if (tool === "rectangle") {
      rectToolRender(ctx!, lastShape);
    } else if (tool === "ellipse") {
      ellipseToolRender(ctx!, lastShape);
      ctx!.lineWidth = toolSize;
    } else if (tool === "line") {
      lineToolRender(ctx!, lastShape);
    }
    renderToolPreview(ctx!, mousePos);
    setData(data.concat());
  };

  const render = () => {
    // let overCtx = overlayRef.current?.getContext("2d");
    // overCtx?.clearRect(0, 0, overCtx.canvas.width, overCtx.canvas.height);

    let ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < data.length; i++) {
      const shape = data[i];

      if (shape.tool === "pen") {
        penToolRender(ctx!, shape);
        ctx?.stroke();
      } else if (shape.tool === "eraser") {
        penToolRender(ctx!, shape);
        ctx?.stroke();
      } else if (tool === "rectangle") {
        rectToolRender(ctx!, shape);
      } else if (tool === "ellipse") {
        ellipseToolRender(ctx!, shape);
      } else if (tool === "line") {
        lineToolRender(ctx!, shape);
      }
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
      penToolRender(ctx!, lastShape);
      if (lastShape.points.length > 5) {
        ctx?.stroke();
      }
    } else if (tool === "eraser") {
      if (lastShape.points.length > 5) {
        ctx?.stroke();
      }
    } else if (tool === "rectangle") {
      rectToolRender(ctx!, lastShape);
    } else if (tool === "ellipse") {
      ellipseToolRender(ctx!, lastShape);
    } else if (tool === "line") {
      lineToolRender(ctx!, lastShape);
    } else {
      return;
    }
  };
  const handlerOverlayMouseLeave = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!isDrawing.current) {
      return;
    }

    let mousePos = getMousePosition(e);
    let lastShape = data[data.length - 1];
    lastShape.points = lastShape.points.concat([
      {
        x: mousePos.x,
        y: mousePos.y,
        color: toolColor,
        size: toolSize,
        filled: isFilled,
      },
    ]);

    isDrawing.current = false;
    let overCtx = overlayRef.current?.getContext("2d");
    overCtx?.clearRect(0, 0, overCtx.canvas.width, overCtx.canvas.height);

    let ctx = canvasRef.current?.getContext("2d");

    if (tool === "pen") {
      if (lastShape.points.length > 5) {
        ctx?.stroke();
      }
    } else if (tool === "eraser") {
      ctx?.stroke();
    } else if (tool === "rectangle") {
      rectToolRender(ctx!, lastShape);
    } else if (tool === "ellipse") {
      ellipseToolRender(ctx!, lastShape);
    } else if (tool === "line") {
      lineToolRender(ctx!, lastShape);
    }
    setData(data.concat());
  };

  const undoHandler = () => {
    //
  };

  useEffect(() => {
    let ctx = canvasRef.current?.getContext("2d");
    ctx!.globalCompositeOperation =
      tool === "eraser" ? "destination-out" : "source-over";
  }, [tool]);

  useEffect(() => {
    // let socket = socketIOClient("http://localhost:3001");
  }, []);
  return (
    <div className={style.Wrapper}>
      <div>
        <div className={style.ToolsOptions}>
          <div>
            <span>Fill</span>
            <input
              type="checkbox"
              name="color"
              id="color"
              value={String(isFilled)}
              onClick={() => setIsFilled(!isFilled)}
            />
          </div>

          {/* <div>
            <button onClick={undoHandler}>Undo</button>
            <button>Redo</button>
          </div> */}
        </div>
        <div className={style.Canvases}>
          <ButtonsSection
            onClick={(v: string) => setTool(v)}
            tool={tool}
            onClearCanvas={clearCanvas}
            onSetColor={setToolColor}
            color={toolColor}
          />
          <div className={style.CanvasWrapper}>
            <canvas
              ref={overlayRef}
              id={style.overlay}
              width={950}
              height={500}
              onMouseMove={handlerOverlayMouseMove}
              onMouseDown={handlerOverlayMouseDown}
              onMouseUp={handlerOverlayMouseUp}
              onMouseLeave={handlerOverlayMouseLeave}
            />

            <canvas
              className={style.canvas}
              ref={canvasRef}
              width={950}
              height={500}
            />
          </div>
          <div className={style.sizeWrapper}>
            <div>
              <input
                className={style.sizeInput}
                type="range"
                min="1"
                max="100"
                value={toolSize}
                onChange={(e) => setToolSize(+e.currentTarget.value)}
              />
              {/* <p>Size</p> */}
            </div>
          </div>
        </div>
      </div>
      <div className="linkGithub">
        <a
          href="https://github.com/sanminoe/draw-it"
          style={{ color: "white" }}
        >
          By Sanminoe {<BsGithub />}
        </a>
      </div>
    </div>
  );
}

export default RoomPage;
