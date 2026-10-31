import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import {
  fixVercelRuntime,
  nodeRuntimeFromEngines,
  readTargetRuntime
} from './fix-vercel-runtime.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpDirs: string[] = [];

function writeVcConfig(root: string, relativeDir: string, runtime: string) {
  const dir = path.join(root, relativeDir);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, '.vc-config.json');
  fs.writeFileSync(file, JSON.stringify({ runtime, handler: 'entry.mjs' }));
  return file;
}

afterEach(() => {
  while (tmpDirs.length > 0) {
    const dir = tmpDirs.pop();
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('nodeRuntimeFromEngines', () => {
  it('mapea 22.x a nodejs22.x', () => {
    expect(nodeRuntimeFromEngines('22.x')).toBe('nodejs22.x');
  });

  it('rechaza engines.node vacío', () => {
    expect(() => nodeRuntimeFromEngines(undefined)).toThrow(/no parseable/);
  });
});

describe('readTargetRuntime', () => {
  it('lee engines.node 24.x del package.json del repo', () => {
    expect(readTargetRuntime(path.join(repoRoot, 'package.json'))).toBe('nodejs24.x');
  });
});

describe('fixVercelRuntime', () => {
  it('reescribe nodejs18.x y nodejs20.x a nodejs22.x y deja edge', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fix-vercel-runtime-'));
    tmpDirs.push(root);
    const render = writeVcConfig(root, '_render.func', 'nodejs18.x');
    const legacy = writeVcConfig(root, 'nested/api.func', 'nodejs20.x');
    const edge = writeVcConfig(root, '_middleware.func', 'edge');

    const result = fixVercelRuntime(root, 'nodejs22.x');

    expect(result).toEqual({ scanned: 2, rewritten: 2, target: 'nodejs22.x' });
    expect(JSON.parse(fs.readFileSync(render, 'utf8')).runtime).toBe('nodejs22.x');
    expect(JSON.parse(fs.readFileSync(legacy, 'utf8')).runtime).toBe('nodejs22.x');
    expect(JSON.parse(fs.readFileSync(edge, 'utf8')).runtime).toBe('edge');
  });

  it('no reescribe si ya está en el target', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fix-vercel-runtime-'));
    tmpDirs.push(root);
    writeVcConfig(root, '_render.func', 'nodejs22.x');

    const result = fixVercelRuntime(root, 'nodejs22.x');
    expect(result).toEqual({ scanned: 1, rewritten: 0, target: 'nodejs22.x' });
  });

  it('scanned 0 si no hay funciones', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fix-vercel-runtime-'));
    tmpDirs.push(root);
    expect(fixVercelRuntime(path.join(root, 'missing'), 'nodejs22.x').scanned).toBe(0);
  });
});
