export function getContrastColor(hexcolor: string) {
    hexcolor = hexcolor.replace("#", "");

    let { r, g, b } = hexToRGB(hexcolor);

    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (yiq >= 128) ? 'black' : '#ebebeb';
}

function hexToRGB(hexcolor: string): { r: number, g: number, b: number } {
    var r = parseInt(hexcolor.substring(0, 2), 16);
    var g = parseInt(hexcolor.substring(2, 4), 16);
    var b = parseInt(hexcolor.substring(4, 6), 16);
    return { r, g, b };
}