const questions = [
  {
    type: "input",
    name: "name",
    message: "What is the name of your project?",
    default: "my-site",
  },
  {
    type: "list",
    name: "template",
    message: "What type of project is this?",
    choices: ["blog", "portfolio"],
  },
  {
    type: "list",
    name: "gitinit",
    message: "Would you like to initialize a git repository?",
    choices: ["yes", "no"],
  },
];

export default questions;
