import {STAGES, type StageName} from '../schema/episode';
import {discover} from './discover';
import {score} from './score';
import {research} from './research';
import {scriptStage} from './script';
import {audioStage} from './audio';
import {storyboardStage} from './storyboard';
import {assetsStage} from './assets';
import {renderStage} from './render';
import {qaStage} from './qa';
import {packageStage} from './package';
import {publishStage} from './publish';

export const STAGE_RUNNERS: Record<StageName, (slug: string) => Promise<unknown>> = {
  discover: (slug) => discover(slug),
  score: (slug) => score(slug),
  research: (slug) => research(slug),
  script: (slug) => scriptStage(slug),
  audio: (slug) => audioStage(slug),
  storyboard: (slug) => storyboardStage(slug),
  assets: (slug) => assetsStage(slug),
  render: (slug) => renderStage(slug),
  qa: (slug) => qaStage(slug),
  package: (slug) => packageStage(slug),
  publish: (slug) => publishStage(slug),
};

export const runUntil = async (slug: string, until: StageName): Promise<void> => {
  const stop = STAGES.indexOf(until);
  if (stop < 0) {
    throw new Error(`Unknown stage "${until}".`);
  }
  for (let i = 0; i <= stop; i++) {
    const name = STAGES[i];
    process.stderr.write(`→ ${name} (${slug})\n`);
    await STAGE_RUNNERS[name](slug);
  }
};
