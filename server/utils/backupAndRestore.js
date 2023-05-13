import { spawn } from "child_process";

let DB_URL =
  "mongodb+srv://KishanVinciis:toomuchfun@cluster0.hxk5t.mongodb.net/mongoDB?retryWrites=true&w=majority";

const dbBackupTask = () => {
  console.log("dbBackup function called!");
  const backupProcess = spawn("mongodump", [
    `--uri=${DB_URL}`,
    `--db=mongoDB`,
    `--username=KishanVinciis`,
    `--password=toomuchfun`,
    `--archive=./vancii.gzip`,
    "--gzip",
  ]);
  backupProcess.on("exit", (code, signal) => {
    if (code) console.log("Backup process exited with code ", code);
    else if (signal)
      console.error("Backup process was killed with singal ", signal);
    else console.log("Successfully backedup the database");
  });
};

// currently not working
export const dbRestore = () => {
  console.log("dbrestore function called!");
  const restoreProcess = spawn("mongorestore", [
    `--db=balllllllllll`,
    `--archive=./vancii.gzip`,
    "--gzip",
  ]);
  restoreProcess.on("exit", (code, signal) => {
    if (code) console.log("Restore process exited with code ", code);
    else if (signal)
      console.error("Restore process was killed with singal ", signal);
    else console.log("Successfully restore the database");
  });
};
export default dbBackupTask;
