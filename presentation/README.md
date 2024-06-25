# Welcome to Ciklum template for [Slidev](https://github.com/slidevjs/slidev)!

To start the slide show:

- Fork the [repo](https://gitlab.ciklum.net/js-community/events/slidev-template-2024) and create your presentation (`slides.md`) based on the template
  - Do not push to the original repository!
- This repo uses [Corepack](https://nodejs.org/api/corepack.html), to enable it run `corepack enable`.
- `pnpm install`
- `pnpm run dev`
- visit http://localhost:3030
- You can also deploy the app easily to Netlify as the project already contains deployment configuration. But you can deploy it elsewhere without much extra effort as well.

Edit the [slides.md](./slides.md) to see the changes.

Learn more about Slidev on [documentations](https://sli.dev/).

## Example

You can see the [presentation template in action here](https://cheery-piroshki-f43374.netlify.app/1)

## Why to use Slidev over poverpoint?

- It can be coded, rather than composed in an Powerpoint
- you can easily add the following to the presentation
  - HTML, CSS, Javascript
  - Code examples with steps and highlights
  - Inline typescript code editor
  - Iframes
  - Mermaid diagrams

## Template slides/layouts

- There are following layouts prepared for Ciklum presentations:
  - centered
  - default (same as if you don't define any)
  - iframe
  - image-bottom-right
  - image-right (top right)
  - intro (section for name and date included)
  - thank you
  - two columns (can have also full width section above `::top::` and below `::bottom::` the columns)
- Any custom Ciklum slide can have background
  - If you want to add our own background image use it as `background: ./test.png` and add the image into `public` root folder

## Customization

Slides/layouts presented in the `slides.md` are approved by Ciklum branding department. If you make your custom slides, make sure they are approved as well. Especially for public presentations.

You can create own custom slides by adding them to `theme/layouts/` folder.
You can also adjust/add more global CSS in `theme/styles/layouts.css`
