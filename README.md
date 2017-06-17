# svg-react-transformer

Transform SVG into JSX or React component modules.

🚧 🚧 **EXPERIMENTAL! WORK IN PROGRESS!** 🚧 🚧

## What about other modules that do similar things?

There are many, many npm packages for converting SVGs to React components.
Webpack loaders, Browserify transforms, CLIs, Gulp plugins, etc.
They are all addressing the same problem but formatting their output differently.
However, their APIs are too specialized for them to share logic, so they all end up reimplementing the same thing in different ways.

There are only a few steps here:
1. Optimize the SVG with SVGO.
2. Transform the SVG to JSX (or a React element).
3. Plug the JSX into a React component module.

Then you need an API that allows the user to configure these steps; that is, to specify SVGO plugins or control the React component output.

Turns out the first step ("Optimize the SVG with SVGO.") is not really a problem to be solved.
SVGO works on its own.
You just need to expose its options.

The second step ("Transform the SVG to JSX (or a React element).") is reimplemented in a hundred different ways.
But this problem should be outsourced to another, more low-level package, because transforming HTML and XML to React components is not a problem specific to SVG.

The third step ("Plug the JSX into a React component module.") is not really a problem to be solved, because we have template literals and other means of templating.

So (as long as you outsource the second step), *there is actually no problem to be solved, just an API to provide.*

That's the goal of this package: provide an API to accomplish those steps without unnecessarily reimplementing functionality that (should) belong to other packages.
