export const initializeDragImage = () => {
  var dragIcon = document.createElement('div');
  dragIcon.id = 'drag-image';
  dragIcon.style.height = '100%';
  dragIcon.style.width = '100%';
  dragIcon.style.background = `url(/icons/BoxIcons.png) no-repeat 0.027027% 0.027027%`;
  dragIcon.style.backgroundSize = '3700%';
  dragIcon.style.backgroundPosition = '100% 100%'
  var div = document.createElement('div');
  div.id = 'drag-image-container'
  div.appendChild(dragIcon);
  const dimension = window.outerWidth / 24 - 4;
  div.style.height = `${dimension}px`;
  div.style.width = `${dimension}px`;
  div.style.position = 'absolute';
  div.style.top = '-500px';
  document.querySelector('body')?.appendChild(div);
};
