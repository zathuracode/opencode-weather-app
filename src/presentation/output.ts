import { stdout } from "node:process";

export interface Output {
  print(message: string): void;
}

export const consoleOutput: Output = {
  print(message: string): void {
    stdout.write(`${message}\n`);
  },
};
