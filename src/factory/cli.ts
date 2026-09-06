import {STAGES, type StageName} from './schema/episode';
import {STAGE_RUNNERS, runUntil} from './stages/run';
import {hasGate, readMeta, resolveEpisodeDir} from './paths';
import {runQa} from './qa/checks';

const usage = () => {
  process.stderr.write(`Before It Was Famous factory

Usage:
  pnpm factory <stage> --episode <slug>
  pnpm factory run --episode <slug> --until <stage>
  pnpm factory status --episode <slug>

Stages:
  ${STAGES.join(' → ')}

Human gates (files in episodes/<slug>/):
  FACT_APPROVED      required before script (production)
  NARRATION_LOCKED   required before storyboard (production)
  PUBLISH_GO         required before publish — publish still refuses to post

Never auto-publishes. No social APIs.
`);
};

const flag = (args: string[], name: string): string | undefined => {
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0 && args[idx + 1]) {
    return args[idx + 1];
  }
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  return eq ? eq.slice(name.length + 3) : undefined;
};

const main = async () => {
  const args = process.argv.slice(2);
  const cmd = args[0];
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    usage();
    process.exit(cmd ? 0 : 1);
  }

  if (cmd === 'status') {
    const slug = flag(args, 'episode');
    if (!slug) {
      throw new Error('--episode is required');
    }
    const meta = readMeta(slug);
    const report = {
      slug,
      dir: resolveEpisodeDir(slug),
      meta,
      gates: {
        FACT_APPROVED: hasGate(slug, 'factApproved'),
        NARRATION_LOCKED: hasGate(slug, 'narrationLocked'),
        PUBLISH_GO: hasGate(slug, 'publishGo'),
      },
      qa: runQa(slug),
    };
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  const slug = flag(args, 'episode') ?? process.env.FACTORY_EPISODE;
  if (!slug) {
    throw new Error('--episode <slug> is required');
  }

  if (cmd === 'run') {
    const until = (flag(args, 'until') ?? 'qa') as StageName;
    if (!STAGES.includes(until)) {
      throw new Error(`Unknown --until ${until}`);
    }
    await runUntil(slug, until);
    process.stdout.write(`OK ${slug} through ${until}\n`);
    return;
  }

  if (cmd === 'karaoke') {
    await STAGE_RUNNERS.render(slug);
    return;
  }

  if (!(cmd in STAGE_RUNNERS)) {
    usage();
    throw new Error(`Unknown command ${cmd}`);
  }

  const result = await STAGE_RUNNERS[cmd as StageName](slug);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
};

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
