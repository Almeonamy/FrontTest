// import { rollup } from "rollup";
import image from '@rollup/plugin-image'
import resolve from '@rollup/plugin-node-resolve'
import typeScript from 'rollup-plugin-typescript2'
import vue from 'rollup-plugin-vue'
import {terser} from 'rollup-plugin-terser'
import replace from '@rollup/plugin-replace'
import scss from 'rollup-plugin-scss'
import clear from 'rollup-plugin-clear'
import dev from 'rollup-plugin-dev'
import escapeStringRegexp from "escape-string-regexp"
import fs from "fs-extra"
import path from "path"
import jsEntryPoints from "./jsEntryPoints"

//const htmlMjsTemplate = (options = {}) => {
//    const { template, target, prefix, attrs, replaceVars } = options
//    const scriptTagAttributes = attrs && attrs.length > 0 ? attrs : []
//    return {
//        name: "htmlMjsTemplate",

//        async generateBundle(outputOptions, bundleInfo) {
//            const bundleKeys = Object.keys(bundleInfo)

//            return new Promise(async (resolve, reject) => {
//                try {
//                    if (!target && !template) throw new Error(INVALID_ARGS_ERROR)

//                    const outputDir =
//                        outputOptions.dir || path.dirname(outputOptions.file)

//                    let targetDir = outputDir
//                    let bundleDirString = ""

//                    if (target && path.dirname(target) !== ".") {
//                        targetDir = path.dirname(target);
//                        const bundleDir = path.relative(targetDir, outputDir)
//                        bundleDirString = bundleDir && `${bundleDir}/`
//                    }

//                    // Get the target file name.
//                    const targetName = path.basename(target || template)

//                    // Add the file suffix if it isn't there.
//                    const targetFile =
//                    targetName.indexOf(".html") < 0 ? `${targetName}.html` : targetName

//                    // Read the file
//                    const buffer = await fs.readFile(template)

//                    // Convert buffer to a string and get the </body> index
//                    let tmpl = buffer.toString("utf8")
//                    if (replaceVars) {
//                        const replacePairs = Object.entries(replaceVars)
//                        replacePairs.forEach(([pattern, replacement]) => {
//                            const escapedPattern = escapeStringRegexp(pattern)
//                            const regex = new RegExp(`${escapedPattern}`, "g")
//                            tmpl = tmpl.replace(regex, replacement)
//                        })
//                    }

//                    let injected = tmpl

//                    // Inject the style tags before the head close tag
//                    const headCloseTag = injected.lastIndexOf("</head>")

//                    // // Inject the style tags before the head close tag
//                    // injected = [
//                    //     injected.slice(0, headCloseTag),
//                    //     ...bundleKeys
//                    //         .filter(f => path.extname(f) === ".css")
//                    //         .map(
//                    //             b =>
//                    //                 `<link rel="stylesheet" type="text/css" href="${prefix
//                    //                 || ""}${b}">\n`
//                    //         ),
//                    //     injected.slice(headCloseTag, injected.length),
//                    // ].join("")

//                    // Inject the modulepreload tags before the head close tag
//                    injected = [
//                        injected.slice(0, headCloseTag),
//                        ...bundleKeys
//                            .filter(f => path.extname(f) === ".mjs")
//                            .map(
//                                b =>
//                                    `    <link rel="modulepreload" href="${bundleDirString}${prefix
//                                    || ""}${b}">\n`
//                            ),
//                        injected.slice(headCloseTag, injected.length),
//                    ].join("")

//                    const bodyCloseTag = injected.lastIndexOf("</body>");

//                    // Inject the script tags before the body close tag
//                    injected = [
//                        injected.slice(0, bodyCloseTag),
//                        ...bundleKeys
//                            .filter(f => path.extname(f) === ".js")
//                            .map(
//                                b =>
//                                    `<script ${scriptTagAttributes.join(
//                                    " "
//                                    )} src="${bundleDirString}${prefix || ""}${b}"></script>\n`
//                            ),
//                        injected.slice(bodyCloseTag, injected.length),
//                    ].join("")

//                    // Inject the modules script tags before the body close tag
//                    injected = [
//                        injected.slice(0, bodyCloseTag),
//                        `<script ${scriptTagAttributes.join(
//                            " "
//                        )} type="module" src="${bundleDirString}${prefix || ""}${bundleKeys[0]}"></script>\n`,
//                        injected.slice(bodyCloseTag, injected.length),
//                    ].join("")

//                    // write the injected template to a file
//                    const finalTarget = path.join(targetDir, targetFile);
//                    await fs.ensureFile(finalTarget)
//                    await fs.writeFile(finalTarget, injected)
//                    resolve();
//                } catch (e) {
//                    reject(e);
//                }
//            });
//        },
//    };
//}


const rootFolder = 'wwwroot';
const jsOutputFolder = path.join(rootFolder, 'js', 'build');
const cssOutputFolder = path.join(rootFolder, 'css', 'build');

const commonPlugins = [
    image(),
    resolve({
        mainFields: ['browser', 'module', 'main', ],
        browser: true,
    }),
    scss({
        output: path.join(cssOutputFolder, 'bundle.css')
    }),
    vue(),
    //htmlMjsTemplate({
    //    template: 'src/template.html',
    //    target: 'index.html',
    //    attrs: ['async', 'defer'],
    //}),
    typeScript({
        tsconfig: "tsconfig.json"
    }),
    replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
]

const devPlugins = [
    //dev({
    //    open: true,
    //    dirs: ['./build'],
    //    openPage: './build/index.html',
    //    contentBase: './build',
    //    host: 'localhost',
    //    port: 10001,
    //}),
]

const prodPlugins = [
    clear({
        targets: [jsOutputFolder, cssOutputFolder]
    }),
    terser(),
]

const config = {
    input: jsEntryPoints,
    output: {
        dir: jsOutputFolder,
        format: 'esm',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
    }
}

const getConfig = () => {
    if ( process.env.NODE_ENV == 'development' ) {
        config.plugins = [...commonPlugins, ...devPlugins]
    } else {
        config.plugins = [...commonPlugins, ...prodPlugins]
    }

    return config
}

export default getConfig()
