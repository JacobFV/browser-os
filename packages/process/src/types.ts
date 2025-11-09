export type Pid = string;

export interface ProcessStreams {
  stdin: WritableStream<string>;
  stdout: WritableStream<string>; // Commands write to stdout
  stderr: WritableStream<string>; // Commands write to stderr
}

export interface CommandHandler {
  name: string;
  description?: string;
  execute: (
    args: string[],
    streams: ProcessStreams,
    cwd: string,
    env: Record<string, string>
  ) => Promise<number>; // Returns exit code
}

