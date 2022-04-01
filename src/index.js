#!/usr/bin/env node
import express from "express";
import fs from "fs";
import path from "path";
import { program } from "commander";
import inquirer from "inquirer";
import simpleGit from "simple-git";
import chalk from "chalk";
import shell from "shelljs";
import emoji from "node-emoji";
import ora from "ora";
import matter from "gray-matter";
import { marked } from "marked";
import glob from "glob";
import questions from "./project-questions";

const options = {
  baseDir: path.resolve(),
};
const git = simpleGit(options);
const creatingProjectLoader = ora(
  `Loading ${chalk.green("Please wait while we are creating your project...")}`
);
const dependencyLoaderText = ora(
  `${chalk.green("Installing the required dependencies...")}`
);

program
  .name("snabb")
  .version("1.0.0")
  .description("A CLI Tool to create, build and deploy static webpages");

//  Create Project
program
  .command("create")
  .alias("c")
  .description("Create new project")
  .action(() => {
    inquirer.prompt(questions).then(async (answers) => {
      const { name, template, gitinit } = answers;

      creatingProjectLoader.start();
      const dir = `./${name}`;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      try {
        const git_init = gitinit === "yes" ? "&& git init" : "";
        await git.clone(
          "https://github.com/varshashinde003/templates.git/",
          dir,
          ["--filter=blob:none", "--sparse"]
        );
        shell.exec(
          `cd ${name} && git sparse-checkout init --cone && git sparse-checkout add ${template} && cd ${template} && mv * ../ && cd ../ && rm -rf ${template}`
        );
        shell.exec(`cd ${dir} && rm -rf .git`);
        creatingProjectLoader.stop();
        console.log(
          chalk.green(
            `${emoji.get("heavy_check_mark")} Project created successfully!`
          )
        );
        if (git_init) {
          dependencyLoaderText.start();
          shell.exec(`cd ${dir} && rm -rf .git`);
          dependencyLoaderText.stop();
          console.log(
            chalk.green(
              `${emoji.get(
                "heavy_check_mark"
              )} Initialized git repository successfully!\n`
            )
          );
        }
        console.log(chalk.yellow("Next Steps:"));
        console.log(
          chalk.yellow(
            `${emoji.get("arrow_right")}  cd ${name}\n${emoji.get(
              "arrow_right"
            )}  snabb start\n`
          )
        );
        console.log(chalk.yellow(`Create something wonderful with snabb!\n `));
      } catch (error) {
        creatingProjectLoader.stop();
        console.log(chalk.red(`${emoji.get("x")} ${error.message}`));
        process_exit(1);
      }
    });
  });

// Start Project
program
  .command("start")
  .alias("s")
  .name("Start Project")
  .action(async () => {
    const app = express();
    const port = 3000;

    const configPath = path.join(path.resolve(), "config.js");
    const config = await import(configPath);
    const outPath = path.join(path.resolve(), "build");
    const publicPath = path.join(path.resolve(), "public");
    const layoutsPath = path.join(path.resolve(), "layouts");
    const contentPath = path.join(path.resolve(), "content");

    const allPostsHtml = [];

    app.use(express.static(outPath));
    app.use(express.static(publicPath));

    const readFile = (filename) => {
      const rawFile = fs.readFileSync(filename, "utf8");
      const parsed = matter(rawFile);
      const html = marked(parsed.content);
      return { ...parsed, html };
    };

    const saveFile = async (filename, elements) => {
      const dir = path.dirname(filename);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      fs.writeFileSync(filename, elements);
    };

    const templatize = (
      template,
      { title, date, description, content, siteHeading, siteName, path }
    ) =>
      template
        .replace(/{siteName}/g, siteName)
        .replace(/{siteHeading}/g, siteHeading)
        .replace(/<!-- PUBLISH_DATE -->/g, date)
        .replace(/<!-- TITLE -->/g, title)
        .replace(/<!-- DESCRIPTION -->/g, description)
        .replace(/<!-- CONTENT -->/g, content);

    const templatizeListItem = (
      template,
      { title, date, description, content, siteHeading, siteName, path }
    ) =>
      template
        .replace(/{siteName}/g, siteName)
        .replace(/{siteHeading}/g, siteHeading)
        .replace(/{date}/g, date)
        .replace(/{title}/g, title)
        .replace(/{description}/g, description)
        .replace(/{content}/g, content)
        .replace(/{path}/g, path);

    const getOutFileName = (filename, outPath) => {
      const baseDir = path.basename(filename);
      const newFileName = baseDir.replace(".md", ".html");
      return path.join(outPath, newFileName);
    };

    const processFile = async (filename, template, outPath, config) => {
      const file = readFile(filename);
      const ListTemplate = fs.readFileSync(
        path.join(layoutsPath, "/postListLayout.html"),
        "utf8"
      );

      const outFilename = getOutFileName(filename, outPath);

      const templatized = templatize(template, {
        title: file.data.title,
        date: file.data.date,
        description: file.data.description,
        content: file.html,
        siteHeading: config.default.name,
        siteName: config.default.name,
      });

      const listTemplatized = templatizeListItem(ListTemplate, {
        title: file.data.title,
        date: file.data.date,
        description: file.data.description,
        path: filename + ".html",
      });

      allPostsHtml.push(listTemplatized);

      const indexPath = path.join(outPath, "/index.html");

      fs.readFile(indexPath, "utf8", function (err, data) {
        if (err) {
          return console.log(err);
        }
        var result = data.replace(/{posts}/g, allPostsHtml.join(""));

        fs.writeFile(indexPath, result, "utf8", function (err) {
          if (err) return console.log(err);
        });
      });

      // const indexTemplate = fs.readFileSync(
      //   path.join(outPath, "/index.html"),
      //   "utf8"
      // );

      // indexTemplate.replace(/{posts}/g, allPostsHtml.join(""));

      await saveFile(outFilename, templatized);

      shell.exec(`cp -a ${publicPath}/* ${outPath}/`);

      app.get("/", (req, res) => {
        res.render("index");
      });
    };

    const main = () => {
      const commonTemplate = fs.readFileSync(
        path.join(path.resolve(), "/layouts/template.html"),
        "utf8"
      );

      const postTemplate = fs.readFileSync(
        path.join(layoutsPath, "postLayout.html"),
        "utf8"
      );

      const HomePage = path.join(contentPath, "index.md");
      const postFiles = glob.sync(path.join(contentPath, "posts/*.md"));

      if (HomePage) processFile(HomePage, commonTemplate, outPath, config);

      if (postFiles.length) {
      }

      if (postFiles.length > 0)
        postFiles.forEach((filename) =>
          processFile(filename, postTemplate, outPath, config)
        );

      const server = app.listen(port, () => {
        console.log(
          `Local Development Server Started on  ${chalk.cyan(
            `http://localhost:${port}`
          )}`
        );
      });
    };

    main();
  });

program.parse(process.argv);