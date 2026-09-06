import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {FPS, HEIGHT, WIDTH} from '../../engine/constants';
import {burnKaraoke, writeAssFile} from '../karaoke/burn';
import {
  publicEpisodeDir,
  readJson,
  readMeta,
  repoRoot,
  resolveEpisodeDir,
  writeJson,
} from '../paths';
import {timestampsSchema} from '../schema/episode';
import {buildRemotionSpec, syncPublicAssets} from './assets';
import {durationGate} from '../qa/durationGate';
import {isFixture} from '../paths';

export const renderStage = async (slug: string) => {
  const dir = resolveEpisodeDir(slug);
  const root = repoRoot();
  const spec = existsSync(join(dir, 'remotion.json'))
    ? (readJson(join(dir, 'remotion.json')) as ReturnType<typeof buildRemotionSpec>)
    : buildRemotionSpec(slug);
  writeJson(join(dir, 'remotion.json'), spec);
  syncPublicAssets(slug);

  const stamps = timestampsSchema.parse(
    readJson(join(dir, 'audio', 'timestamps.json')),
  );
  const gate = durationGate(stamps.totalDuration, {fixture: isFixture(slug)});
  if (!gate.ok) {
    throw new Error(gate.message);
  }

  const renderDir = join(dir, 'render');
  mkdirSync(renderDir, {recursive: true});
  const assPath = join(renderDir, 'karaoke.ass');
  writeAssFile(assPath, stamps);

  const remotion = join(root, 'node_modules', '.bin', 'remotion');
  const assemble = join(renderDir, 'assemble.mp4');
  const compositionId = spec.compositionId;
  const timeout = process.env.REMOTION_TIMEOUT ?? '180000';

  if (!existsSync(remotion)) {
    writeJson(join(renderDir, 'skipped.json'), {
      reason: 'Remotion CLI not installed. Run pnpm install, then: pnpm exec remotion render ' +
        `${compositionId} ${assemble} --timeout=${timeout}`,
      compositionId,
      width: WIDTH,
      height: HEIGHT,
      fps: FPS,
    });
    return {
      skipped: true,
      assemble: null,
      final: null,
      assPath,
      command: `pnpm exec remotion render ${compositionId} ${assemble} --timeout=${timeout}`,
    };
  }

  const result = spawnSync(
    remotion,
    [
      'render',
      compositionId,
      assemble,
      `--timeout=${timeout}`,
      `--props=${JSON.stringify({episodeId: spec.id, title: spec.title, spec})}`,
    ],
    {encoding: 'utf8', cwd: root},
  );
  if (result.status !== 0) {
    const fallback = spawnSync(
      remotion,
      ['render', compositionId, assemble, `--timeout=${timeout}`],
      {encoding: 'utf8', cwd: root},
    );
    if (fallback.status !== 0) {
      throw new Error(fallback.stderr || result.stderr || 'Remotion render failed');
    }
  }

  const finalPath = join(renderDir, 'final.mp4');
  const burned = burnKaraoke({
    inputMp4: assemble,
    assPath,
    outputMp4: finalPath,
  });
  if (!burned.ok) {
    writeJson(join(renderDir, 'karaoke-skipped.json'), {reason: burned.reason});
  }

  writeJson(join(dir, 'meta.json'), {...readMeta(slug), status: 'render'});
  return {
    skipped: false,
    assemble,
    final: burned.ok ? burned.output : assemble,
    assPath,
    publicDir: publicEpisodeDir(slug),
  };
};
