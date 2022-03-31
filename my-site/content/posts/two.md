---
title: How I built ‘flyyta’
date: 1580587200000
description: The reason I built flyyta was to stop myself from repeating the same typographic styles in every project. Learn more about how I did it in the post.
---

### What is flyyta?

flyyta is a css library and react component that aims to make web typography simple. The reason I built it is because I've noticed that I start almost every static website off with the same set of themes or typographic rules, so I decided to build a tiny library that I can just plug into my next project easily. Since I mostly only work on react applications or plain ol' static websites I made a react component and a css library.

### Goals

The goal with flyyta was not to be an end all of styling it's supposed to be a very minimal stater that can support your regular styling. For a single theme the minified css file comes in at only `1.8kb` which I think is quite amazing.

It also strives to make customization as easy as possible offering more than 15 different variables you can work with.

### How it works

I built flyyta.css using scss for variables and customization (because of css custom properties' comparatively low browser support). This was the first project I used scss in and I have to say the workflow with the live sass compiler in VS Code is very smooth and the dev experience was very enjoyable.

Since this was my first ever npm package I decided to go with something simple for the react component so I decided to use `create-react-library` which made it extremely easy to build and publish the component. For the styling and customization I decided to go with emotion as I wanted something simple yet powerful that could be dynamically themed.

### Customization

Customization was very simple to implement in the css library because all the user had to do was change the scss variables at the top of the file and the rest would be managed by the power of scss. For the react component however it was a bit more complex.

The way I decided to go about it was to allow the user to add an optional `theme` prop to their `<flyyta>` component. It takes an object that allows them to change the variables and if any properties are excluded they revert to the default.

### flyyta vs flyyta.css

Which one is for you? I would personally recommend the css library for almost all people. Even if you are using a react project, for most cases the css library is good enough. The only cases where I would recommend the react component is when your project already uses emotion or if you are planning to do a lot of dynamic theming (like more than two themes).

### My process

For the css library my process was very simple, all I did was first of all create the html file with all the content i wanted to style and then I started off working on `flyyta.light.scss` . Since I use VS code the compiling was very simple with the amazing Live Sass compiler plugin (highly recommend it).

For the react component however the process was a bit more complicated but as I mentioned above emotion and create-react-library really do help out, especially if you're a beginner like me.


