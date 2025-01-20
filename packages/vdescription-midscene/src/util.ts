export type IDescription = {
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  text?: string;
  description?: string;
};

export function addCanvasTag(canvas: HTMLCanvasElement, id: string) {
  canvas.setAttribute('midscene-description-ref', id);
}

export function showInfo(info: IDescription[], ca: HTMLCanvasElement) {
  info.forEach(item => {
    const div = document.createElement('div');
    div.style.top = item.rect.y + 'px';
    div.style.left = item.rect.x + 'px';
    div.style.width = item.rect.width + 'px';
    div.style.height = item.rect.height + 'px';
    div.style.position = 'absolute';
    div.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
    div.style.fontSize = '10px';
    div.innerHTML = item.text;

    ca.parentNode.appendChild(div);
  });
}

export function addInfoScript(info: IDescription[], id: string) {
  const script = document.createElement('script');
  script.type = 'text/json';
  script.setAttribute('midscene-description-id', id);
  script.innerHTML = JSON.stringify(info);
  document.body.appendChild(script);
}
