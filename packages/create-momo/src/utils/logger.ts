import { intro, log, outro, spinner } from "@clack/prompts";
import color from "picocolors";

export const logger = {
  info: (msg: string) => log.info(color.cyan(msg)),
  success: (msg: string) => log.success(color.green(msg)),
  warn: (msg: string) => log.warn(color.yellow(msg)),
  error: (msg: string) => log.error(color.red(msg)),
  step: (msg: string) => log.step(msg),
  title: (msg: string) => intro(color.bgCyan(color.black(` ${msg} `))),
  end: (msg: string = "Done!") => outro(color.green(msg)),
};

export const createSpinner = (initialMsg: string) => {
  const s = spinner();
  s.start(initialMsg);
  return {
    start: (msg: string) => s.start(msg),
    stop: (msg: string) => s.stop(color.green(msg)),
    message: (msg: string) => s.message(msg),
  };
};
