# Babel 

Babel 是一个 JavaScript 编译器。 主要用于将 ECMAScript 2015+ 代码转换为向后兼容的 JavaScript 代码，以便能够在当前和旧版本的浏览器或其他环境中运行。

Babel 能做的事情：

* 转换语法
* 添加目标环境所缺失的功能（通过第三方 polyfill 库，例如 core-js）
* 源代码转换（codemods-code modifications)
* 更多功能可以参考官网： https://babeljs.io/videos

## 插件

* babel-cli: Babel 的命令行工具，允许在终端中使用 Babel 进行代码转换。
* babel-core: Babel 的核心库，负责将 ES6+ 代码转换为向后兼容的 JavaScript 代码。
* babel-loader: 用于在 Webpack 中集成 Babel 的加载器，使得在打包过程中可以自动转换代码。
* babel-polyfills: 提供对新 JavaScript 特性的支持，使得旧环境也能运行使用了这些新特性的代码。
* @babel/preset-env: 根据设置的目标环境，把转换到目标环境需要处理的内容，告诉 ``Babel``，然后 ``Babel`` 会自动地进行转换。

## polyfills 与 preset-env 的区别

* babel-polyfills 是一个包含了所有新特性实现的库，适用于需要支持旧浏览器的项目。
* @babel/preset-env 是一个配置工具，可以根据目标环境自动选择需要转换的新特性，从而减少不必要的代码转换和体积增加。

## @babel/preset-env

包含一个 ``useBuiltIns``  选项，优化使用 ``core-js`` 全局版本的方式。如果使用 ``useBuiltIns`` 选项，你需要去设置 ``corejs`` 选项，告诉 Babel 你使用的是 ``core-js`` 的哪个版本。

> 重要：建议指定所使用的 ``core-js`` 次要版本，例如 ``corejs: '3.48'``，而不是 ``corejs: 3``，因为 ``corejs: 3`` 将不会注入在 ``core-js`` 次要版本中添加的模块。

* ``useBuiltIns: 'entry'``



