import fs from 'node:fs';
import path from 'node:path';
import json2toml, { type Options } from 'json2toml';

/**
 * Generates a TOML file from a JSON object.
 *
 * @param data - The JSON object to convert to TOML.
 * @param filePath - The absolute path to the TOML file.
 * @param formatterOpts {@link Options} - Optional formatter options.
 *
 * @throws Will throw an error if the provided filePath is not absolute,
 *         or if an error occurs during file system operations.
 */
export const generateToml = (
  data: object,
  filePath: string,
  formatterOpts?: Options
): void => {
  // Ensure that the provided path is absolute.
  if (!path.isAbsolute(filePath)) {
    throw new Error(
      `The provided file path must be absolute. Received: ${filePath}`
    );
  }

  const tomlContent = json2toml(data, formatterOpts);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, tomlContent, 'utf-8');
};
