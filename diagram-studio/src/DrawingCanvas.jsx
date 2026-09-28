import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';

const DrawingCanvas = forwardRef(function DrawingCanvas({ scene, name }, ref) {
  const [api, setApi] = useState(null);

  useImperativeHandle(ref, () => ({
    fit() {
      api?.scrollToContent(scene.elements, { fitToViewport: true, viewportZoomFactor: 1 });
    },
  }), [api, scene]);

  useEffect(() => {
    if (!api || !scene.elements.length) return;
    const frame = requestAnimationFrame(() => {
      api.scrollToContent(scene.elements, { fitToViewport: true, viewportZoomFactor: 1 });
    });
    return () => cancelAnimationFrame(frame);
  }, [api, scene]);

  return (
    <Excalidraw
      initialData={scene}
      excalidrawAPI={setApi}
      viewModeEnabled
      zenModeEnabled
      gridModeEnabled={false}
      theme="light"
      name={name}
      UIOptions={{
        canvasActions: {
          changeViewBackgroundColor: false,
          clearCanvas: false,
          export: false,
          loadScene: false,
          saveAsImage: false,
          saveToActiveFile: false,
          toggleTheme: false,
        },
      }}
    />
  );
});

export default DrawingCanvas;
