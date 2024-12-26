- Although the viewport size can change, the vw and vh sizes do not. As a result, elements sized to be 100vh tall will bleed out of the viewport.use `dvh` instead of `vh` and `dvw` instead of `vw`
this [blogs](https://web.dev/blog/viewport-units) explains this issue in detail.


- According to the HTML specification, <p> elements cannot be nested inside other <p> elements. Browsers automatically close the first <p> tag when they encounter another <p>, which makes the nesting invalid
- css combinators: `~` `>` `+`