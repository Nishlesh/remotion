import {existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {FORBIDDEN_WIDTH, HEIGHT, WIDTH} from '../../engine/constants';
import {spokenWords} from '../copy/engine';
import {hasGate, isFixture, readJson, readMeta, resolveEpisodeDir} from '../paths';
import {
  qaReportSchema,
  timestampsSchema,
  type QaIssue,
  type QaReport,
  type ScriptDoc,
  type TimestampsDoc,
} from '../schema/episode';
import {dimensionGate, durationGate} from './durationGate';
import {which} from '../karaoke/burn';

const issue = (code: string, severity: QaIssue['severity'], message: string): QaIssue => ({
  code,
  severity,
  message,
});

const probeVideo = (
  path: string,
): {width: number; height: number; duration: number} | null => {
  const ffprobe = which('ffprobe');
  if (!ffprobe || !existsSync(path)) {
    return null;
  }
  const result = spawnSync(
    ffprobe,
    [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height:format=duration',
      '-of',
      'json',
      path,
    ],
    {encoding: 'utf8'},
  );
  if (result.status !== 0) {
    return null;
  }
  const json = JSON.parse(result.stdout) as {
    streams?: {width?: number; height?: number}[];
    format?: {duration?: string};
  };
  const stream = json.streams?.[0];
  return {
    width: stream?.width ?? 0,
    height: stream?.height ?? 0,
    duration: Number(json.format?.duration ?? 0),
  };
};

export const compareWords = (
  spoken: string,
  stamps: TimestampsDoc,
): QaIssue[] => {
  const scriptWords = spokenWords(spoken);
  const stampWords = stamps.lines.flatMap((line) => line.words.map((w) => w.word));
  const issues: QaIssue[] = [];
  if (scriptWords.length !== stampWords.length) {
    issues.push(
      issue(
        'timestamp_word_count',
        'fail',
        `Spoken has ${scriptWords.length} words; timestamps have ${stampWords.length}. Do not rewrite spoken words.`,
      ),
    );
  }
  const n = Math.min(scriptWords.length, stampWords.length);
  for (let i = 0; i < n; i++) {
    if (scriptWords[i] !== stampWords[i]) {
      issues.push(
        issue(
          'timestamp_word_mismatch',
          'fail',
          `Word ${i} differs: script "${scriptWords[i]}" vs timestamp "${stampWords[i]}".`,
        ),
      );
      break;
    }
  }
  return issues;
};

export const runQa = (slug: string): QaReport => {
  const dir = resolveEpisodeDir(slug);
  const issues: QaIssue[] = [];
  const fixture = isFixture(slug);
  const meta = readMeta(slug);

  if (!hasGate(slug, 'factApproved') && !fixture) {
    issues.push(issue('fact_approved', 'fail', 'FACT_APPROVED gate file is missing.'));
  }

  const scriptPath = join(dir, 'script.json');
  const tsPath = join(dir, 'audio', 'timestamps.json');
  let durationSec: number | undefined;
  if (existsSync(tsPath)) {
    const stamps = timestampsSchema.parse(readJson(tsPath));
    durationSec = stamps.totalDuration;
    const gate = durationGate(stamps.totalDuration, {fixture});
    if (!gate.ok) {
      issues.push(issue(gate.code, 'fail', gate.message));
    }
    if (existsSync(scriptPath)) {
      const script = readJson<ScriptDoc>(scriptPath);
      issues.push(...compareWords(script.spoken, stamps));
    }
  } else {
    issues.push(issue('timestamps_missing', 'fail', 'audio/timestamps.json is missing.'));
  }

  const stillsDir = join(dir, 'stills');
  if (!existsSync(stillsDir) || readdirSync(stillsDir).filter((f) => !f.startsWith('.')).length === 0) {
    const pubStills = join(dir, '..', '..', 'public', 'episodes', slug, 'stills');
    const pubGen = join(dir, '..', '..', 'public', 'episodes', slug, 'generate');
    const hasPublic =
      (existsSync(pubStills) && readdirSync(pubStills).length > 0) ||
      (existsSync(pubGen) && readdirSync(pubGen).length > 0);
    if (!hasPublic) {
      issues.push(issue('stills_missing', 'fail', 'No stills in episode stills/.'));
    }
  }

  const finalCandidates = [
    join(dir, 'render', 'final.mp4'),
    join(dir, 'render', 'assemble.mp4'),
    join(dir, 'package', `${slug}.mp4`),
  ];
  const videoPath = finalCandidates.find((p) => existsSync(p));
  let width: number | undefined;
  let height: number | undefined;
  if (videoPath) {
    const probe = probeVideo(videoPath);
    if (probe) {
      width = probe.width;
      height = probe.height;
      durationSec = probe.duration || durationSec;
      const dim = dimensionGate(probe.width, probe.height);
      if (!dim.ok) {
        issues.push(issue(dim.code, 'fail', dim.message));
      }
      const dur = durationGate(probe.duration, {fixture});
      if (!dur.ok) {
        issues.push(issue(dur.code, 'fail', dur.message));
      }
      if (probe.width === FORBIDDEN_WIDTH) {
        issues.push(issue('width_1088', 'fail', 'NEVER 1088×1920.'));
      }
    }
  }

  const licensesPath = join(dir, 'licenses.json');
  if (!existsSync(licensesPath) && !fixture) {
    issues.push(issue('licenses_missing', 'warn', 'licenses.json missing.'));
  }

  if (meta.kind === 'production' && !hasGate(slug, 'narrationLocked')) {
    issues.push(
      issue('narration_locked', 'fail', 'NARRATION_LOCKED gate file is missing.'),
    );
  }

  const fails = issues.filter((i) => i.severity === 'fail');
  const report: QaReport = qaReportSchema.parse({
    slug,
    ok: fails.length === 0,
    durationSec,
    width: width ?? WIDTH,
    height: height ?? HEIGHT,
    issues,
  });
  return report;
};
