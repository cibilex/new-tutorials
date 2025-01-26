# Tailwind v4
- [Installation](https://tailwindcss.com/docs/installation/using-vite) is easier than from the old way. (If you want to use sass you need to install postcss)

1. **Variables**:
```css
@use "tailwindcss";


@theme{
    --color-ilex-light: color-mix(in hsl, hsl(300 0 0), coral 80%);
    --font-poppins: Poppins, sans-serif;
    --animate-fade-in-scale: fade-in-scale 0.3s ease-out;
    @keyframes fade-in-scale {
      0% {
        opacity: 0;
        transform: scale(0.95);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

}

.red{
    color:var(--color-ilex-light)
}
```
```jsx
function App(){
  return <div className="font-poppins animate-fade-in-scale"> // font will be poppins and use animation
  <div className="bg-ilex-light">hi world</div> // bg will be ilex-light
  <div className="red">hi world</div> // text color will be ilex-light
  </div>
}
```
- dynamic utility values:
     1. `grid-cols-23` `text-40`
     2. `<div data-current class="opacity-75 data-current:opacity-100"></div>` : if data-current is true the style will be used.
- Container queries is supported out of the box.
```html
<div class="@container">
  <div class="grid grid-cols-1 @sm:grid-cols-3 @lg:grid-cols-4">
    <!-- ... -->
  </div>
</div>
```
- not: flag `not-hover: `
- 