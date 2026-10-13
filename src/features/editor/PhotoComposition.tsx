"use client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Group,
  Image as KImage,
  Layer,
  Rect,
  Stage,
  Text,
  Transformer,
} from "react-konva";
import Konva from "konva";
import { getFrame, HEIGHT, WIDTH } from "../frames/catalog";
import { loadImage } from "../camera/photo";
import type { BoothDocument, EditorItem } from "./types";
export interface CompositionHandle {
  exportPNG: () => Promise<Blob>;
}
interface Props {
  document: BoothDocument;
  selected?: string | null;
  interactive?: boolean;
  onSelect?: (id: string | null) => void;
  onChange?: (item: EditorItem) => void;
  onReady?: (ready: boolean) => void;
  onTextEdit?: (id: string) => void;
}
export const PhotoComposition = forwardRef<CompositionHandle, Props>(
  function PhotoComposition(
    {
      document: doc,
      selected,
      interactive = false,
      onSelect,
      onChange,
      onReady,
      onTextEdit,
    },
    ref,
  ) {
    const host = useRef<HTMLDivElement>(null);
    const stage = useRef<Konva.Stage>(null);
    const transformer = useRef<Konva.Transformer>(null);
    const [width, setWidth] = useState(320);
    const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
    const [error, setError] = useState("");
    const frame = getFrame(doc.frameId);
    const sources = [
      frame.variants[doc.layout].src,
      ...doc.photos.flatMap((p) => (p ? [p.url] : [])),
      ...doc.items.flatMap((i) => (i.src ? [i.src] : [])),
    ];
    const key = JSON.stringify(sources);
    useEffect(() => {
      if (!host.current) return;
      const resize = new ResizeObserver((entries) =>
        setWidth(Math.min(entries[0].contentRect.width, 430)),
      );
      resize.observe(host.current);
      return () => resize.disconnect();
    }, []);
    useEffect(() => {
      let cancelled = false;
      onReady?.(false);
      setError("");
      void Promise.all([
        Promise.all(
          (JSON.parse(key) as string[]).map(
            async (src) => [src, await loadImage(src)] as const,
          ),
        ),
        window.document.fonts.ready,
      ])
        .then(([entries]) => {
          if (!cancelled) {
            setImages(Object.fromEntries(entries));
            onReady?.(true);
          }
        })
        .catch(() => {
          if (!cancelled)
            setError("โหลดภาพไม่สำเร็จ กรุณากลับไปเลือกภาพอีกครั้ง");
        });
      return () => {
        cancelled = true;
      };
    }, [key, onReady]);
    useEffect(() => {
      const tr = transformer.current;
      const node = selected
        ? stage.current?.findOne((n: Konva.Node) => n.id() === selected)
        : null;
      if (tr) {
        tr.nodes(node ? [node] : []);
        tr.getLayer()?.batchDraw();
      }
    }, [selected, doc.items, images]);
    useImperativeHandle(
      ref,
      () => ({
        exportPNG: async () => {
          await window.document.fonts.ready;
          if (!stage.current || sources.some((src) => !images[src]))
            throw new Error("กำลังโหลดภาพ รอสักครู่นะ");
          const container = window.document.createElement("div");
          const copy = stage.current.clone({
            container,
            width: WIDTH,
            height: HEIGHT,
            scaleX: 1,
            scaleY: 1,
            listening: false,
          }) as Konva.Stage;
          try {
            copy.findOne(".editor-controls")?.destroy();
            copy.draw();
            const canvas = copy.toCanvas({
              pixelRatio: 1,
              x: 0,
              y: 0,
              width: WIDTH,
              height: HEIGHT,
            });
            return await new Promise<Blob>((resolve, reject) =>
              canvas.toBlob(
                (blob) =>
                  blob
                    ? resolve(blob)
                    : reject(new Error("สร้าง PNG ไม่สำเร็จ")),
                "image/png",
              ),
            );
          } finally {
            copy.destroy();
          }
        },
      }),
      [images, key],
    );
    const scale = width / WIDTH;
    const transform = (item: EditorItem, node: Konva.Node) => {
      const sx = node.scaleX(),
        sy = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange?.({
        ...item,
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        width: Math.max(32, item.width * sx),
        height: Math.max(24, item.height * sy),
        fontSize:
          item.kind === "text"
            ? Math.max(12, item.fontSize * sy)
            : item.fontSize,
      });
    };
    return (
      <div className="composition-host" ref={host} data-testid="composition">
        {error && (
          <p className="inline-notice" role="alert">
            {error}
          </p>
        )}
        <Stage
          ref={stage}
          width={width}
          height={(width * HEIGHT) / WIDTH}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) onSelect?.(null);
          }}
          onTouchStart={(e) => {
            if (e.target === e.target.getStage()) onSelect?.(null);
          }}
        >
          <Layer>
            <Rect
              width={WIDTH}
              height={HEIGHT}
              fill={frame.color}
              listening={false}
            />
            {frame.variants[doc.layout].slots.map((slot, i) => (
              <Group
                key={i}
                clipX={slot.x}
                clipY={slot.y}
                clipWidth={slot.width}
                clipHeight={slot.height}
                listening={false}
              >
                {doc.photos[i] && images[doc.photos[i]!.url] ? (
                  <KImage image={images[doc.photos[i]!.url]} {...slot} />
                ) : (
                  <Rect {...slot} fill="#e9e5ef" />
                )}
              </Group>
            ))}
            <KImage
              image={images[frame.variants[doc.layout].src]}
              width={WIDTH}
              height={HEIGHT}
              listening={false}
            />
          </Layer>
          <Layer>
            {doc.items.map((item) => {
              const common = {
                id: item.id,
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                rotation: item.rotation,
                draggable: interactive,
                onClick: () => onSelect?.(item.id),
                onTap: () => onSelect?.(item.id),
                onDblClick: () => item.kind === "text" && onTextEdit?.(item.id),
                onDblTap: () => item.kind === "text" && onTextEdit?.(item.id),
                onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
                  onChange?.({ ...item, x: e.target.x(), y: e.target.y() }),
                onTransformEnd: (e: Konva.KonvaEventObject<Event>) =>
                  transform(item, e.target),
              };
              return item.kind === "sticker" ? (
                <KImage
                  key={item.id}
                  {...common}
                  image={item.src ? images[item.src] : undefined}
                />
              ) : (
                <Text
                  key={item.id}
                  {...common}
                  height={undefined}
                  text={item.text}
                  fontSize={item.fontSize}
                  fontFamily="Noto Sans Thai"
                  fontStyle="bold"
                  fill={item.color}
                  stroke="#ffffff"
                  strokeWidth={3}
                  fillAfterStrokeEnabled
                  align="center"
                  verticalAlign="middle"
                  wrap="word"
                />
              );
            })}
          </Layer>
          {interactive && (
            <Layer name="editor-controls">
              <Transformer
                ref={transformer}
                rotateEnabled
                keepRatio
                flipEnabled={false}
                anchorSize={12}
                rotateAnchorOffset={30}
                padding={3}
                borderStroke="#ff559f"
                anchorStroke="#ff559f"
                anchorFill="#fff"
                anchorStyleFunc={(anchor) => anchor.hitStrokeWidth(32)}
                borderDash={[5, 4]}
                enabledAnchors={[
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                ]}
                boundBoxFunc={(oldBox, newBox) =>
                  Math.abs(newBox.width) < 24 || Math.abs(newBox.height) < 24
                    ? oldBox
                    : newBox
                }
              />
            </Layer>
          )}
        </Stage>
      </div>
    );
  },
);
