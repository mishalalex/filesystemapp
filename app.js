const fs = require("fs/promises");
(async () => {
  // commands
  const CREATE_NEW_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to file";

  // command file functions
  // 1. function to create a new file at the given location
  const createNewFile = async (path) => {
    try {
      const existingFileHandler = await fs.open(path, "r");
      existingFileHandler.close();
      return console.log(`File ${path} already exists.`);
    } catch (e) {
      const newFileHandler = await fs.open(path, "w");
      newFileHandler.close();
      console.log("The new file is created.");
    }
  };

  // 2. function to delete a file at the given location
  const deleteFile = async (path) => {
    try {
      await fs.unlink(path);
      return console.log("File was successfully deleted.");
    } catch (e) {
      if (e.code === "ENOENT") {
        console.error(`No file found at ${path}`);
      } else {
        console.log("Couldn't delete the file due to error: ");
        console.error(e);
      }
    }
  };

  // 3. function to rename a file at the given location
  const renameFile = async (oldFilePath, newFilePath) => {
    try {
      console.log(`Renaming ${oldFilePath} to ${newFilePath}`);
      await fs.rename(oldFilePath, newFilePath);
      return console.log("File was successfully renamed.");
    } catch (e) {
      if (e.code === "ENOENT") {
        console.log(
          "No file at this path to rename or the destination doesn't exist"
        );
      } else {
        console.log("Couldn't rename the file due to error: ");
        console.log(e);
      }
    }
  };

  // 4. function to add contents to a file at the given location
  const addToFile = async (path, content) => {
    try {
      await fs.appendFile(path, content);
      console.log(`Adding content to ${path}.`);
      console.log(`Content: ${content}.`);
    } catch (e) {
      console.log("Couldn't add to the file due to error: ");
      console.error(e);
    }
  };

  // code to read the commands from the command.txt file
  const commandFileHandler = await fs.open("command.txt", "r");
  commandFileHandler.on("change", async () => {
    const size = (await commandFileHandler.stat()).size;
    const buff = Buffer.alloc(size);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;
    await commandFileHandler.read(buff, offset, length, position);

    const command = buff.toString("utf-8");

    if (command.includes(CREATE_NEW_FILE)) {
      const filePath = command.substring(CREATE_NEW_FILE.length + 1);
      createNewFile(filePath);
    }

    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }

    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(" to ");
      const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx);
      const newFilePath = command.substring(_idx + 4);
      renameFile(oldFilePath, newFilePath);
    }

    if (command.includes(ADD_TO_FILE)) {
      const _idx = command.indexOf(" this content: ");
      const path = command.substring(ADD_TO_FILE.length + 1, _idx);
      const content = command.substring(_idx + 15);
      addToFile(path, content);
    }
  });

  // code to watch the command.txt file for changes
  const watcher = fs.watch("command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
