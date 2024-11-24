export function setupFullscreen(idOrElement: string | HTMLElement) {
    const element = idOrElement instanceof HTMLElement ?
        idOrElement :
        document.getElementById(idOrElement);
    element.ondblclick = () => {
        if (document.fullscreenElement === element)
            document.exitFullscreen();
        else
            element.requestFullscreen();
    };
}
