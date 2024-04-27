import type { CSSProperties } from 'vue';

/**
 * Resolve urls from frontmatter and append with the base url
 */
export function resolveAssetUrl(url: string) {
  if (url.startsWith('/')) return import.meta.env.BASE_URL + url.slice(1);
  return url;
}

const logoUrl = './theme/ciklum-logo.png';

export function handleBackground(
  background?: string,
  backgroundSize = 'cover',
  withLogo = true,
  logoPosition: 'right' | 'left' = 'right',
): CSSProperties {
  const isColor =
    background && ['#', 'rgb', 'hsl'].some((v) => background.indexOf(v) === 0);

  let backgroundImageObj: { [key: string]: string } = {};

  if (isColor) {
    if (withLogo) {
      backgroundImageObj = {
        backgroundImage: `url("${resolveAssetUrl(logoUrl)}")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `top 3rem ${logoPosition} 3rem`,
        backgroundSize: `6rem`,
        backgroundColor: background,
      };
    } else {
      backgroundImageObj = {
        backgroundColor: background,
      };
    }
  } else if (background) {
    backgroundImageObj = {
      backgroundImage: `url("${resolveAssetUrl(background)}")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    };
    if (withLogo) {
      backgroundImageObj = {
        backgroundImage: `url("${resolveAssetUrl(logoUrl)}"), url("${resolveAssetUrl(background)}")`,
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundPosition: `top 3rem ${logoPosition} 3rem, center`,
        backgroundSize: `6rem, ${backgroundSize}`,
      };

      /*  background-image: url(img_flwr.gif), url(paper.gif);
  background-position: right bottom, left top;
  background-repeat: no-repeat, repeat; */
    }
  }

  const style = {
    background: isColor ? background : undefined,
    color: '#000000',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundColor: '#f3f3f3',
    ...backgroundImageObj,
  };

  if (!style.background) delete style.background;

  return style;
}
